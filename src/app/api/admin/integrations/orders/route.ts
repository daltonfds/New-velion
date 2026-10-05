import { requireAdmin } from "@/lib/integrations/admin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const url = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || "50")));
  const platformId = url.searchParams.get("platform_id")?.trim() || "";

  let query = auth.client
    .from("integration_orders")
    .select(
      "id,platform_id,external_order_id,external_seller_id,status,currency,subtotal,shipping_amount,total,tracking_number,carrier,tracking_url,created_at,updated_at,platform:integration_platforms(name,slug)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (platformId) query = query.eq("platform_id", platformId);

  const { data, error } = await query;
  if (error) {
    return Response.json({ error: "Could not load integration orders." }, { status: 500 });
  }

  return Response.json({
    data: (data ?? []).map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      shipping_amount: Number(order.shipping_amount),
      total: Number(order.total),
    })),
  });
}
