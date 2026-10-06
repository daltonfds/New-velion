import { requireSupplier } from "@/lib/supplier-auth";

export async function GET(request: Request) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  const [{ data: profile }, { data: zones, error }] = await Promise.all([
    auth.client.from("supplier_shipping_profiles").select("*").eq("user_id", auth.userId).maybeSingle(),
    auth.client.from("supplier_shipping_zones").select("*").eq("supplier_id", auth.userId).order("created_at", { ascending: true }),
  ]);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: { profile, zones: zones ?? [] } });
}

export async function PUT(request: Request) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const payload = {
    user_id: auth.userId,
    enabled: body.enabled !== false,
    processing_days: Math.max(0, Math.floor(Number(body.processing_days ?? 1))),
    free_shipping_threshold: body.free_shipping_threshold == null || body.free_shipping_threshold === "" ? null : Math.max(0, Number(body.free_shipping_threshold)),
    default_rate: Math.max(0, Number(body.default_rate ?? 0)),
    currency: "ZAR",
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await auth.client.from("supplier_shipping_profiles").upsert(payload, { onConflict: "user_id" }).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}

export async function POST(request: Request) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  let body: any;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const countries = Array.isArray(body.country_codes) ? body.country_codes.map(String).map((x:string)=>x.trim().toUpperCase()).filter(Boolean) : [];
  const payload = {
    supplier_id: auth.userId,
    name: String(body.name ?? "").trim(),
    country_codes: countries,
    metro: body.metro == null ? null : Boolean(body.metro),
    base_rate: Math.max(0, Number(body.base_rate ?? 0)),
    per_kg_rate: Math.max(0, Number(body.per_kg_rate ?? 0)),
    estimated_days: Math.max(0, Math.floor(Number(body.estimated_days ?? 3))),
    active: body.active !== false,
    updated_at: new Date().toISOString(),
  };
  if (payload.name.length < 2) return Response.json({ error: "Zone name is required." }, { status: 400 });
  const { data, error } = await auth.client.from("supplier_shipping_zones").insert(payload).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data }, { status: 201 });
}