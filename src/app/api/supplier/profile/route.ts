import { requireSupplier } from "@/lib/supplier-auth";

export async function GET(request: Request) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const [{ data, error }, { data: profile }] = await Promise.all([
    auth.client.from("supplier_profiles").select("*").eq("user_id", auth.userId).maybeSingle(),
    auth.client.from("profiles").select("kyc_status,status").eq("id", auth.userId).maybeSingle(),
  ]);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: data ? { ...data, kyc_status: profile?.kyc_status ?? null, account_status: profile?.status ?? null } : null });
}

export async function PUT(request: Request) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const companyName = String(body.company_name ?? "").trim();
  const countryCode = String(body.country_code ?? "").trim().toUpperCase();
  if (!["ZA", "CN"].includes(countryCode)) return Response.json({ error: "Supplier country must be South Africa (ZA) or China (CN)." }, { status: 400 });
  const responsibleName = String(body.responsible_name ?? "").trim();
  if (companyName.length < 2 || responsibleName.length < 2) {
    return Response.json({ error: "Company name and responsible person are required." }, { status: 400 });
  }

  const payload = {
    user_id: auth.userId,
    company_name: companyName,
    legal_name: String(body.legal_name ?? "").trim() || null,
    business_type: ["supplier", "producer", "producer_supplier"].includes(String(body.business_type)) ? String(body.business_type) : "supplier",
    country_code: countryCode,
    country_name: countryCode === "CN" ? "China" : "South Africa", String(body.country_name ?? "").trim() || null,
    calling_code: countryCode === "CN" ? "+86" : "+27",
    payout_currency: countryCode === "CN" ? "CNY" : "ZAR",
    business_phone: String(body.business_phone ?? "").trim() || null,
    whatsapp: String(body.whatsapp ?? "").trim() || null,
    business_email: String(body.business_email ?? "").trim() || null,
    website: String(body.website ?? "").trim() || null,
    registration_number: String(body.registration_number ?? "").trim() || null,
    tax_number: String(body.tax_number ?? "").trim() || null,
    product_categories: Array.isArray(body.product_categories) ? body.product_categories.map(String).map((item) => item.trim()).filter(Boolean) : [],
    description: String(body.description ?? "").trim() || null,
    responsible_name: responsibleName,
    responsible_title: String(body.responsible_title ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await auth.client.from("supplier_profiles").upsert(payload, { onConflict: "user_id" }).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}
