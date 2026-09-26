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

    for (const name of [
      "x-payjsr-signature",
      "x-payjsr-timestamp",
      "x-payjsr-event",
      "content-type",
    ]) {
      const value = req.headers.get(name);
      if (value) headers.set(name, value);
    }

    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

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
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("PayJSR webhook proxy error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Webhook proxy failed.",
      },
      { status: 500 },
    );
  }
}
