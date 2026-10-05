import { requireSupplier } from "@/lib/supplier-auth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;
  const { data, error } = await auth.client.from("products").select("*").eq("id", id).eq("created_by", auth.userId).maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "Product not found." }, { status: 404 });
  return Response.json({ data });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });
  const { id } = await context.params;
  const { data: existing, error: existingError } = await auth.client.from("products").select("id,supplier_status").eq("id", id).eq("created_by", auth.userId).maybeSingle();
  if (existingError) return Response.json({ error: existingError.message }, { status: 500 });
  if (!existing) return Response.json({ error: "Product not found." }, { status: 404 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  if (String(body.action ?? "") === "submit") {
    const { data: supplierProfile } = await auth.client.from("supplier_profiles").select("approval_status").eq("user_id", auth.userId).maybeSingle();
    if (supplierProfile?.approval_status !== "approved") return Response.json({ error: "Your supplier account must be approved before submitting products." }, { status: 403 });
    if (!["draft", "rejected"].includes(existing.supplier_status)) return Response.json({ error: "Only draft or rejected products can be submitted." }, { status: 409 });
    const { data, error } = await auth.client.from("products").update({
      supplier_status: "pending_review", supplier_rejection_reason: null, supplier_reviewed_at: null,
      supplier_reviewed_by: null, ativo: false, updated_at: new Date().toISOString(),
    }).eq("id", id).eq("created_by", auth.userId).select("*").single();
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ data });
  }

  if (!["draft", "rejected", "approved"].includes(existing.supplier_status)) {
    return Response.json({ error: "This product cannot be edited in its current state." }, { status: 409 });
  }

  const price = Number(body.preco);
  const cost = Number(body.preco_custo);
  if (!Number.isFinite(price) || price < 0 || !Number.isFinite(cost) || cost < 0) return Response.json({ error: "Invalid price or cost." }, { status: 400 });

  const nextStatus = existing.supplier_status === "approved" ? "pending_review" : "draft";
  const { data, error } = await auth.client.from("products").update({
    nome: String(body.nome ?? "").trim(), slug: String(body.slug ?? "").trim(), descricao: String(body.descricao ?? "").trim(),
    categoria_id: String(body.categoria_id ?? ""), subcategoria_id: String(body.subcategoria_id ?? "").trim() || null,
    preco: String(body.moeda ?? "ZAR") === "ZAR" ? Math.round(price) : price,
    preco_promocional: body.preco_promocional == null || body.preco_promocional === "" ? null : Number(body.preco_promocional),
    moeda: String(body.moeda ?? "ZAR"), preco_custo: cost, comissao_afiliado: Number(body.comissao_afiliado ?? 0),
    supplier_min_selling_price: Number(body.supplier_min_selling_price ?? price), supplier_suggested_price: Number(body.supplier_suggested_price ?? price),
    supplier_commission_rate: Number(body.supplier_commission_rate ?? 0), estoque: Math.max(0, Math.floor(Number(body.estoque ?? 0))),
    low_stock_threshold: Math.max(0, Math.floor(Number(body.low_stock_threshold ?? 5))),
    beneficios: Array.isArray(body.beneficios) ? body.beneficios.map(String).map((item) => item.trim()).filter(Boolean) : [],
    ingredientes: String(body.ingredientes ?? "").trim() || null, modo_uso: String(body.modo_uso ?? "").trim() || null,
    garantia_texto: String(body.garantia_texto ?? "").trim() || null, faq: Array.isArray(body.faq) ? body.faq : [],
    fotos: Array.isArray(body.fotos) ? body.fotos.map(String) : [], video_url: String(body.video_url ?? "").trim() || null,
    checkout_url: String(body.checkout_url ?? "").trim(), fornecedor_nome: String(body.fornecedor_nome ?? "").trim() || null,
    fornecedor_descricao: String(body.fornecedor_descricao ?? "").trim() || null, fornecedor_pais: String(body.fornecedor_pais ?? "").trim() || null,
    ativo: false, supplier_status: nextStatus, supplier_rejection_reason: null, supplier_reviewed_at: null, supplier_reviewed_by: null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("created_by", auth.userId).select("*").single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data });
}
