import { requireSupplier } from "@/lib/supplier-auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const payload: any = {};
  if (body.name !== undefined) payload.name = String(body.name).trim();
  if (body.country_codes !== undefined) payload.country_codes = Array.isArray(body.country_codes) ? body.country_codes.map(String).map((x:string)=>x.trim().toUpperCase()).filter(Boolean) : [];
  if (body.metro !== undefined) payload.metro = body.metro == null ? null : Boolean(body.metro);
  for (const key of ["base_rate","per_kg_rate"]) if (body[key] !== undefined) payload[key] = Math.max(0, Number(body[key]));
  if (body.estimated_days !== undefined) payload.estimated_days = Math.max(0, Math.floor(Number(body.estimated_days)));
  if (body.active !== undefined) payload.active = Boolean(body.active);
  payload.updated_at = new Date().toISOString();
  const { data, error } = await auth.client.from("supplier_shipping_zones").update(payload).eq("id", id).eq("supplier_id", auth.userId).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;
  const { error } = await auth.client.from("supplier_shipping_zones").delete().eq("id", id).eq("supplier_id", auth.userId);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}