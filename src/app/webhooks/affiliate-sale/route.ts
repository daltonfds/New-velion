import { NextRequest, NextResponse } from "next/server";

const SUPABASE_WEBHOOK_URL =
  "https://ndtitpmkfbouvaiforfx.supabase.co/functions/v1/newvelion-api/webhooks/affiliate-sale";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "newvelion-payjsr-webhook-proxy",
    method: "POST",
    endpoint: "/webhooks/affiliate-sale",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const headers = new Headers();

    const signature = req.headers.get("x-payjsr-signature");
    const timestamp = req.headers.get("x-payjsr-timestamp");
    const event = req.headers.get("x-payjsr-event");
    const contentType = req.headers.get("content-type");

    if (signature) {
      headers.set("x-payjsr-signature", signature);
    }

    if (timestamp) {
      headers.set("x-payjsr-timestamp", timestamp);
    }

    if (event) {
      headers.set("x-payjsr-event", event);
    }

    headers.set(
      "content-type",
      contentType || "application/json"
    );

    const response = await fetch(SUPABASE_WEBHOOK_URL, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ||
          "application/json",
      },
    });
  } catch (error) {
    console.error("PayJSR webhook proxy error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Webhook proxy failed.",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers":
        "content-type, x-payjsr-signature, x-payjsr-timestamp, x-payjsr-event",
    },
  });
}
