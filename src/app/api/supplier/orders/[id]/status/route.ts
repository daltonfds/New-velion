import { requireSupplier } from "@/lib/supplier-auth";
import { deliverIntegrationWebhook, queueIntegrationWebhook } from "@/lib/integrations/server";

const allowedTransitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"], confirmed: ["processing", "cancelled"], processing: ["packed", "cancelled"],
  packed: ["shipped"], shipped: ["in_transit"], in_transit: ["delivered", "failed"], failed: ["processing"],
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;

  const { data: current, error: currentError } = await auth.client.from("fulfillment_orders")
    .select("id,status,supplier_id").eq("id", id).eq("supplier_id", auth.userId).maybeSingle();
  if (currentError) return Response.json({ error: currentError.message }, { status: 500 });
  if (!current) return Response.json({ error: "Fulfillment order not found." }, { status: 404 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const nextStatus = String(body.status ?? "").trim();
  if (!allowedTransitions[current.status]?.includes(nextStatus)) return Response.json({ error: "Invalid fulfillment status transition." }, { status: 409 });

  const { data, error } = await auth.client.rpc("set_fulfillment_status", {
    p_fulfillment_order_id: id, p_status: nextStatus,
    p_tracking_number: String(body.tracking_number ?? "").trim() || null,
    p_carrier: String(body.carrier ?? "").trim() || null,
    p_tracking_url: String(body.tracking_url ?? "").trim() || null,
    p_note: String(body.note ?? "").trim() || null, p_actor_id: auth.userId,
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });

  const result = Array.isArray(data) ? data[0] : data;
  if (result?.platform_id && result?.external_order_id) {
    try {
      const webhook = await queueIntegrationWebhook(result.platform_id, "order." + result.status, {
        newvelion_order_id: result.integration_order_id, external_order_id: result.external_order_id,
        status: result.status, tracking_number: result.tracking_number, carrier: result.carrier, tracking_url: result.tracking_url,
      });
      void deliverIntegrationWebhook(webhook.id).catch((error) => console.error("Supplier webhook delivery failed:", error));
    } catch (error) {
      console.error("Could not queue integration webhook:", error);
    }
  }
  return Response.json({ data: result });
}
