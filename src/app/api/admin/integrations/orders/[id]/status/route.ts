import {
  queueIntegrationWebhook,
  deliverIntegrationWebhook,
} from "@/lib/integrations/server";
import { requireAdmin } from "@/lib/integrations/admin";

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "in_transit",
  "delivered",
  "cancelled",
  "failed",
  "returned",
] as const;

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
  if (!statuses.includes(status as (typeof statuses)[number])) {
    return Response.json({ error: "Invalid integration order status." }, { status: 400 });
  }

  const trackingNumber = String(body.tracking_number ?? "").trim() || null;
  const carrier = String(body.carrier ?? "").trim() || null;
  const trackingUrl = String(body.tracking_url ?? "").trim() || null;

  const { data: order, error } = await auth.client
    .from("integration_orders")
    .update({
      status,
      tracking_number: trackingNumber,
      carrier,
      tracking_url: trackingUrl,
    })
    .eq("id", id)
    .select(
      "id,platform_id,external_order_id,status,currency,subtotal,shipping_amount,total,tracking_number,carrier,tracking_url",
    )
    .maybeSingle();

  if (error || !order) {
    return Response.json({ error: "Integration order not found." }, { status: 404 });
  }

  const webhook = await queueIntegrationWebhook(order.platform_id, `order.${status}`, {
    newvelion_order_id: order.id,
    external_order_id: order.external_order_id,
    status: order.status,
    tracking_number: order.tracking_number,
    tracking_url: order.tracking_url,
    carrier: order.carrier,
  });

  void deliverIntegrationWebhook(webhook.id).catch((deliveryError) => {
    console.error("Integration status webhook delivery failed:", deliveryError);
  });

  return Response.json({
    data: {
      ...order,
      subtotal: Number(order.subtotal),
      shipping_amount: Number(order.shipping_amount),
      total: Number(order.total),
    },
  });
}
