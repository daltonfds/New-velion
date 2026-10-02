import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;
const BLOCK_SECONDS = 15 * 60;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body?.email === "string"
        ? normalizeEmail(body.email)
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      console.error("Missing Supabase authentication environment variables.");

      return NextResponse.json(
        { error: "Authentication service is not configured." },
        { status: 500 },
      );
    }

    const ip = getClientIp(request);
    const rateKey = `${ip}:${email}`;

    const admin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data: rateData, error: rateCheckError } =
      await admin.rpc("login_rate_limit_check", {
        p_rate_key: rateKey,
      });

    if (rateCheckError) {
      console.error("Login rate-limit check failed:", rateCheckError);

      return NextResponse.json(
        { error: "Authentication service temporarily unavailable." },
        { status: 503 },
      );
    }

    const rateStatus = Array.isArray(rateData)
      ? rateData[0]
      : rateData;

    if (!rateStatus?.allowed) {
      const blockedUntil = rateStatus?.blocked_until
        ? new Date(rateStatus.blocked_until).getTime()
        : Date.now() + BLOCK_SECONDS * 1000;

      const retryAfter = Math.max(
        1,
        Math.ceil((blockedUntil - Date.now()) / 1000),
      );

      return NextResponse.json(
        {
          error:
            "Too many login attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        },
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      const { data: failureData, error: failureError } =
        await admin.rpc("login_rate_limit_record_failure", {
          p_rate_key: rateKey,
          p_max_attempts: MAX_ATTEMPTS,
          p_window_seconds: WINDOW_SECONDS,
          p_block_seconds: BLOCK_SECONDS,
        });

      if (failureError) {
        console.error(
          "Login rate-limit record failed:",
          failureError,
        );
      }

      const failureStatus = Array.isArray(failureData)
        ? failureData[0]
        : failureData;

      if (failureStatus?.blocked_until) {
        return NextResponse.json(
          {
            error:
              "Too many login attempts. Please try again later.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(BLOCK_SECONDS),
            },
          },
        );
      }

      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut();

      await admin.rpc("login_rate_limit_record_failure", {
        p_rate_key: rateKey,
        p_max_attempts: MAX_ATTEMPTS,
        p_window_seconds: WINDOW_SECONDS,
        p_block_seconds: BLOCK_SECONDS,
      });

      return NextResponse.json(
        {
          error:
            "Please confirm your email address before signing in. Check your inbox and spam folder.",
        },
        { status: 403 },
      );
    }

    const { error: resetError } =
      await admin.rpc("login_rate_limit_reset", {
        p_rate_key: rateKey,
      });

    if (resetError) {
      console.error(
        "Login rate-limit reset failed:",
        resetError,
      );
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 },
    );
  }
}
