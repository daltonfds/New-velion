import { createClient } from "@supabase/supabase-js";
import { adminClient } from "@/lib/integrations/server";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!token) return Response.json({ error: "Authentication required." }, { status: 401 });

  const admin = adminClient();
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return Response.json({ error: "Invalid session." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const companyName = String(body.company_name ?? "").trim();
  const responsibleName = String(body.responsible_name ?? "").trim();
  const countryCode = String(body.country_code ?? "").trim().toUpperCase();

  if (companyName.length < 2 || responsibleName.length < 2) {
    return Response.json({ error: "Company name and responsible person are required." }, { status: 400 });
  }
  if (!["ZA", "CN"].includes(countryCode)) {
    return Response.json({ error: "Supplier country must be South Africa (ZA) or China." }, { status: 400 });
  }

  const { data: existing } = await admin
    .from("supplier_profiles")
    .select("approval_status")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (existing?.approval_status === "approved") {
    return Response.json({ error: "This account is already an approved supplier." }, { status: 409 });
  }

  const payload = {
    user_id: authData.user.id,
    company_name: companyName,
    legal_name: String(body.legal_name ?? "").trim() || null,
    business_type: ["supplier", "producer", "producer_supplier"].includes(String(body.business_type)) ? String(body.business_type) : "supplier",
    country_code: countryCode,
    country_name: countryCode === "CN" ? "China" : "South Africa",
    calling_code: countryCode === "CN" ? "+86" : "+27",
    business_phone: String(body.business_phone ?? "").trim() || null,
    whatsapp: String(body.whatsapp ?? "").trim() || null,
    business_email: String(body.business_email ?? "").trim() || authData.user.email || null,
    website: String(body.website ?? "").trim() || null,
    registration_number: String(body.registration_number ?? "").trim() || null,
    tax_number: String(body.tax_number ?? "").trim() || null,
    product_categories: Array.isArray(body.product_categories) ? body.product_categories.map(String).map((x) => x.trim()).filter(Boolean) : [],
    description: String(body.description ?? "").trim() || null,
    responsible_name: responsibleName,
    responsible_title: String(body.responsible_title ?? "").trim() || null,
    public_city: String(body.public_city ?? "").trim() || null,
    public_region: String(body.public_region ?? "").trim() || null,
    approval_status: "pending",
    rejection_reason: null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin
    .from("supplier_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}
