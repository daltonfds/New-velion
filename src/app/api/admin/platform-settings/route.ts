import { requireAdmin } from "@/lib/integrations/admin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  const { data, error } = await auth.client.from("platform_settings").select("*").eq("id", true).single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const payload = {
    id: true,
    transaction_fee_percent: Math.max(0, Number(body.transaction_fee_percent ?? 10)),
    supplier_transaction_fee_percent: Math.max(0, Number(body.supplier_transaction_fee_percent ?? 0)),
    withdrawal_fee_percent: Math.max(0, Number(body.withdrawal_fee_percent ?? 0)),
    withdrawal_fee_fixed: Math.max(0, Number(body.withdrawal_fee_fixed ?? 0)),
    hold_days: Math.max(0, Math.floor(Number(body.hold_days ?? 7))),
    api_monthly_order_limit: Math.max(1, Math.floor(Number(body.api_monthly_order_limit ?? 10000))),
    supplier_monthly_product_limit: Math.max(1, Math.floor(Number(body.supplier_monthly_product_limit ?? 100))),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await auth.client.from("platform_settings").upsert(payload, { onConflict: "id" }).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}