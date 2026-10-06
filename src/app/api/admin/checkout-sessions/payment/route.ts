import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const sessionId = String(body?.session_id || "").trim();
    const reference = String(body?.external_payment_reference || "").trim();
    const amount = Number(body?.external_payment_amount);
    const paidAt = body?.external_payment_paid_at
      ? new Date(String(body.external_payment_paid_at)).toISOString()
      : new Date().toISOString();

    if (!sessionId || !reference || !Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "Invalid payment data." }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("register_checkout_payment", {
      p_session_id: sessionId,
      p_external_payment_reference: reference,
      p_external_payment_amount: Math.round(amount * 100) / 100,
      p_external_payment_paid_at: paidAt,
    });

    if (error) {
      const message = error.message || "Could not register payment.";
      const status = /not found/i.test(message) ? 404 : /already approved|invalid payment/i.test(message) ? 409 : 500;
      return NextResponse.json({ error: message }, { status });
    }

    const result = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({
      success: true,
      session_id: result?.session_id ?? sessionId,
      status: result?.status,
      payment_comparison_status: result?.payment_comparison_status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected payment reconciliation error." },
      { status: 500 },
    );
  }
}
