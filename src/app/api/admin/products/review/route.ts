import { requireAdmin } from "@/lib/integrations/admin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const url = new URL(request.url);
  const status = url.searchParams.get("status")?.trim() || "pending_review";

  const { data, error } = await auth.client.from("products")
    .select("id,nome,slug,descricao,preco,preco_custo,moeda,estoque,created_by,supplier_status,supplier_rejection_reason,created_at,updated_at")
    .eq("supplier_status", status)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ data: data ?? [] });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const id = String(body.id ?? "").trim();
  const status = String(body.status ?? "").trim();
  if (!id || !["approved","rejected","suspended","archived"].includes(status)) {
    return Response.json({ error: "Invalid product review action." }, { status: 400 });
  }

  const { data: product } = await auth.client.from("products").select("id,created_by").eq("id", id).maybeSingle();
  if (!product) return Response.json({ error: "Product not found." }, { status: 404 });

  const { data, error } = await auth.client.from("products").update({
    supplier_status: status,
    ativo: status === "approved",
    supplier_reviewed_at: new Date().toISOString(),
    supplier_reviewed_by: auth.userId,
    supplier_rejection_reason: status === "rejected" ? String(body.reason ?? "").trim() || "Please update the product and resubmit it." : null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select("*").single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}
