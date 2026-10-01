import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dispatchNotification } from "@/lib/notifications/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server is not configured." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const sessionId =
      typeof body === "object" &&
      body !== null &&
      "session_id" in body
        ? String((body as { session_id?: unknown }).session_id || "").trim()
        : "";

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id is required." },
        { status: 400 }
      );
    }

    const { data, error } = await admin.rpc(
      "approve_checkout_session",
      {
        p_session_id: sessionId,
      }
    );

    if (error) {
      console.error("Checkout approval failed:", error);

      return NextResponse.json(
        { error: error.message || "Could not approve checkout session." },
        { status: 409 }
      );
    }

    const saleId = Array.isArray(data)
      ? data[0]?.sale_id
      : data?.sale_id;

    if (saleId) {
      const { data: notification } = await admin
        .from("notifications")
        .select("id")
        .eq("event_key", `sale_confirmed:${saleId}`)
        .maybeSingle();

      if (notification?.id) {
        try {
          await dispatchNotification(notification.id);
        } catch (notificationError) {
          console.error(
            "Sale notification dispatch failed:",
            notificationError
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      sale_id: saleId,
    });
  } catch (error) {
    console.error("Admin checkout approval error:", error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
