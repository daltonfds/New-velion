import { requireAdmin } from "@/lib/integrations/admin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const url = new URL(request.url);
  const status = url.searchParams.get("status")?.trim() || "";
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 100), 1), 200);

  let query = auth.client
    .from("fulfillment_orders")
    .select(
      "id,source_type,source_id,integration_order_id,sale_id,status,supplier_id,currency,subtotal,shipping_amount,total,customer,shipping_address,tracking_number,carrier,tracking_url,fulfilled_at,created_at,updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    data: (data ?? []).map((item) => ({
      ...item,
      subtotal: Number(item.subtotal),
      shipping_amount: Number(item.shipping_amount),
      total: Number(item.total),
    })),
  });
}
