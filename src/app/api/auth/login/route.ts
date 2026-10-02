import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000;

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
      typeof body?.email === "string" ? normalizeEmail(body.email) : "";

    const password =
      typeof body?.password === "string" ? body.password : "";

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
      return NextResponse.json(
        { error: "Authentication service is not configured." },
        { status: 500 },
      );
    }

    const ip = getClientIp(request);
    const rateKey = `${ip}:${email}`;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const now = Date.now();

    const { data: existing, error: rateReadError } = await admin
      .schema("private")
      .from("login_rate_limits")
      .select(
        "id, rate_key, window_started_at, attempt_count, blocked_until",
      )
      .eq("rate_key", rateKey)
      .maybeSingle();

    if (rateReadError) {
      console.error("Login rate-limit read failed:", rateReadError);

      return NextResponse.json(
        { error: "Authentication service temporarily unavailable." },
        { status: 503 },
      );
    }

    if (existing?.blocked_until) {
      const blockedUntil = new Date(existing.blocked_until).getTime();

      if (blockedUntil > now) {
        return NextResponse.json(
          {
            error:
              "Too many login attempts. Please try again later.",
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(
                Math.ceil((blockedUntil - now) / 1000),
              ),
            },
          },
        );
      }
    }

    let attemptCount = existing?.attempt_count ?? 0;
    let windowStartedAt = existing?.window_started_at
      ? new Date(existing.window_started_at).getTime()
      : now;

    if (now - windowStartedAt >= WINDOW_MS) {
      attemptCount = 0;
      windowStartedAt = now;
    }

    attemptCount += 1;

    const blockedUntil =
      attemptCount >= MAX_ATTEMPTS
        ? new Date(now + BLOCK_MS).toISOString()
        : null;

    const { error: rateWriteError } = await admin
      .schema("private")
      .from("login_rate_limits")
      .upsert(
        {
          rate_key: rateKey,
          window_started_at: new Date(windowStartedAt).toISOString(),
          attempt_count: attemptCount,
          blocked_until: blockedUntil,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "rate_key",
        },
      );

    if (rateWriteError) {
      console.error("Login rate-limit write failed:", rateWriteError);

      return NextResponse.json(
        { error: "Authentication service temporarily unavailable." },
        { status: 503 },
      );
    }

    if (attemptCount >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          error:
            "Too many login attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(BLOCK_MS / 1000)),
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut();

      return NextResponse.json(
        {
          error:
            "Please confirm your email address before signing in. Check your inbox and spam folder.",
        },
        { status: 403 },
      );
    }

    await admin
      .schema("private")
      .from("login_rate_limits")
      .delete()
      .eq("rate_key", rateKey);

    return NextResponse.json({
      user: data.user,
    });
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 },
    );
  }
}
