import { deliverPendingIntegrationWebhooks } from "@/lib/integrations/server";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization") || "";
  const provided = authorization.replace(/^Bearer\s+/i, "").trim();

  if (!cronSecret || provided !== cronSecret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const results = await deliverPendingIntegrationWebhooks(25);
    return Response.json({
      processed: results.length,
      delivered: results.filter((result) => result.delivered).length,
    });
  } catch (error) {
    console.error("Integration webhook worker failed:", error);
    return Response.json({ error: "Webhook worker failed." }, { status: 500 });
  }
}
