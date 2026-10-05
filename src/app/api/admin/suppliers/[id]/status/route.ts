import { requireAdmin } from "@/lib/integrations/admin";

const statuses = new Set(["pending","under_review","approved","rejected","suspended"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const status = String(body.status ?? "").trim();
  const kycStatus = body.kyc_status == null ? null : String(body.kyc_status).trim();
  if (!statuses.has(status)) return Response.json({ error: "Invalid supplier status." }, { status: 400 });
  if (kycStatus && !["pending","under_review","approved","rejected"].includes(kycStatus)) return Response.json({ error: "Invalid KYC status." }, { status: 400 });

  const { data, error } = await auth.client.from("supplier_profiles").update({
    approval_status: status,
    rejection_reason: status === "rejected" ? String(body.rejection_reason ?? "").trim() || "Application rejected by NewVelion." : null,
    approved_at: status === "approved" ? new Date().toISOString() : null,
    approved_by: status === "approved" ? auth.userId : null,
    updated_at: new Date().toISOString(),
  }).eq("user_id", id).select("*").single();

  if (error) return Response.json({ error: error.message }, { status: 400 });

  if (kycStatus) await auth.client.from("profiles").update({ kyc_status: kycStatus }).eq("id", id);

  if (status === "approved") {
    await auth.client.from("profiles").update({ status: "active" }).eq("id", id);
    await auth.client.from("supplier_shipping_profiles").upsert({ user_id: id, enabled: true, processing_days: 1, default_rate: 0, currency: "ZAR", updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  }

  return Response.json({ data });
}
