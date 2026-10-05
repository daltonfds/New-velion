import {
  apiError,
  apiOk,
  authenticateIntegrationRequest,
  logIntegrationRequest,
} from "@/lib/integrations/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ externalOrderId: string }> },
) {
  const started = Date.now();
  const auth = await authenticateIntegrationRequest(request);
  const path = new URL(request.url).pathname;

  if (!auth.ok) return auth.error;

  const { externalOrderId } = await context.params;

  const { data: order, error } = await auth.client
    .from("integration_orders")
    .select(
      "id,external_order_id,status,currency,subtotal,shipping_amount,total,customer,shipping_address,tracking_number,carrier,tracking_url,created_at,updated_at",
    )
    .eq("platform_id", auth.platform.id)
    .eq("external_order_id", externalOrderId)
    .maybeSingle();

  if (error) {
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: auth.id,
      method: "GET",
      path,
      statusCode: 500,
      durationMs: Date.now() - started,
    });
    return apiError("INTERNAL_ERROR", "Could not load the order.", 500, auth.id);
  }

  if (!order) {
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: auth.id,
      method: "GET",
      path,
      statusCode: 404,
      durationMs: Date.now() - started,
    });
    return apiError("INVALID_ORDER", "Order not found.", 404, auth.id);
  }

  const { data: items } = await auth.client
    .from("integration_order_items")
    .select(
      "id,external_product_id,newvelion_product_id,quantity,sale_price,currency,product_name",
    )
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  await logIntegrationRequest({
    platformId: auth.platform.id,
    requestId: auth.id,
    method: "GET",
    path,
    statusCode: 200,
    durationMs: Date.now() - started,
  });

  return apiOk(
    {
      data: {
        ...order,
        subtotal: Number(order.subtotal),
        shipping_amount: Number(order.shipping_amount),
        total: Number(order.total),
        items: (items ?? []).map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          sale_price: Number(item.sale_price),
        })),
      },
    },
    200,
    auth.id,
  );
}
