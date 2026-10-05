import { requireAdmin } from "@/lib/integrations/admin";
import { deliverIntegrationWebhook, queueIntegrationWebhook } from "@/lib/integrations/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const { id } = await context.params;
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const status = String(body.status ?? "").trim();
  const trackingNumber = String(body.tracking_number ?? "").trim() || null;
  const carrier = String(body.carrier ?? "").trim() || null;
  const trackingUrl = String(body.tracking_url ?? "").trim() || null;
  const note = String(body.note ?? "").trim() || null;

  const { data, error } = await auth.client.rpc("set_fulfillment_status", {
    p_fulfillment_order_id: id,
    p_status: status,
    p_tracking_number: trackingNumber,
    p_carrier: carrier,
    p_tracking_url: trackingUrl,
    p_note: note,
    p_actor_id: auth.userId,
  });

  if (error) {
    const message = error.message || "Could not update fulfillment.";
    const statusCode = /NOT_FOUND/.test(message) ? 404 : /CONFLICT|INVALID/.test(message) ? 409 : 400;
    return Response.json({ error: message }, { status: statusCode });
  }

  const result = Array.isArray(data) ? data[0] : data;
  let webhookQueued = false;

  if (result?.platform_id && result?.external_order_id) {
    const webhook = await queueIntegrationWebhook(result.platform_id, `order.${result.status}`, {
      newvelion_order_id: result.integration_order_id,
      external_order_id: result.external_order_id,
      status: result.status,
      tracking_number: result.tracking_number,
      carrier: result.carrier,
      tracking_url: result.tracking_url,
    });

    webhookQueued = true;
    void deliverIntegrationWebhook(webhook.id).catch((deliveryError) => {
      console.error("Fulfillment webhook delivery failed:", deliveryError);
    });
  }

  return Response.json({
    data: result,
    webhook_queued: webhookQueued,
  });
}
