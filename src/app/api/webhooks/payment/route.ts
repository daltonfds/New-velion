import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function signatureFor(raw: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(raw).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.NEWVELION_GATEWAY_WEBHOOK_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secret || !supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Webhook service is not configured." }, { status: 500 });
    }

    const rawBody = await request.text();
    const providedSignature =
      request.headers.get("x-newvelion-signature") ||
      request.headers.get("x-webhook-signature") ||
      request.headers.get("x-signature") ||
      "";

    if (!providedSignature) {
      return NextResponse.json({ error: "Missing webhook signature." }, { status: 401 });
    }

    const expected = signatureFor(rawBody, secret);
    const normalized = providedSignature.replace(/^sha256=/i, "").trim().toLowerCase();

    if (!safeEqual(normalized, expected)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const sessionId = String(
      body?.newvelion_session ||
      body?.session_id ||
      body?.metadata?.newvelion_session ||
      body?.metadata?.session_id ||
      "",
    ).trim();

    const reference = String(
      body?.payment_reference ||
      body?.transaction_id ||
      body?.reference ||
      body?.id ||
      "",
    ).trim();

    const amount = Number(
      body?.amount ??
      body?.paid_amount ??
      body?.payment?.amount,
    );

    const currency = String(
      body?.currency ||
      body?.payment?.currency ||
      "ZAR",
    ).trim().toUpperCase();

    const paidAtValue =
      body?.paid_at ||
      body?.payment?.paid_at ||
      body?.created_at ||
      new Date().toISOString();

    if (!sessionId || !reference || !Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "Invalid payment webhook payload." }, { status: 400 });
    }

    const paidAt = new Date(String(paidAtValue));
    if (Number.isNaN(paidAt.getTime())) {
      return NextResponse.json({ error: "Invalid payment timestamp." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.rpc("process_checkout_webhook_payment", {
      p_session_id: sessionId,
      p_external_payment_reference: reference,
      p_external_payment_amount: Math.round(amount * 100) / 100,
      p_external_payment_currency: currency,
      p_external_payment_paid_at: paidAt.toISOString(),
    });

    if (error) {
      console.error("Checkout payment webhook RPC failed:", error);
      return NextResponse.json({ error: "Could not process payment webhook." }, { status: 500 });
    }

    const result = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      received: true,
      session_id: result?.session_id ?? sessionId,
      status: result?.status ?? "pending",
      payment_comparison_status: result?.payment_comparison_status ?? "mismatch",
      sale_id: result?.sale_id ?? null,
    });
  } catch (error) {
    console.error("Checkout payment webhook error:", error);
    return NextResponse.json({ error: "Unexpected webhook error." }, { status: 500 });
  }
}
