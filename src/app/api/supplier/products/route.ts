import { requireSupplier } from "@/lib/supplier-auth";

function cleanString(value: unknown) { return String(value ?? "").trim(); }
function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(request: Request) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const url = new URL(request.url);
  const status = cleanString(url.searchParams.get("status"));
  let query = auth.client.from("products")
    .select("id,nome,slug,descricao,categoria_id,subcategoria_id,preco,preco_promocional,moeda,comissao_tipo,comissao_valor,preco_custo,taxa_plataforma,taxa_entrega,comissao_afiliado,fotos,video_url,checkout_url,estoque,reserved_estoque,low_stock_threshold,ativo,destaque,novo,supplier_status,pricing_mode,custom_pricing_floor_zar,supplier_min_selling_price,supplier_suggested_price,supplier_commission_rate,supplier_rejection_reason,supplier_country_code,supplier_cost_currency,supplier_cost_amount,supplier_fx_rate_to_zar,supplier_fx_rate_captured_at,created_at,updated_at")
    .eq("created_by", auth.userId).order("created_at", { ascending: false });
  if (status) query = query.eq("supplier_status", status);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const name = cleanString(body.nome);
  const categoryId = cleanString(body.categoria_id);
  const price = Number(body.preco);
  const pricingMode = String(body.pricing_mode ?? "fixed") === "custom" ? "custom" : "fixed";
  const cost = Number(body.preco_custo);
  const requestedSupplierCountry = cleanString(body.supplier_country_code || body.fornecedor_pais).toUpperCase();
  const supplierCostAmount = Number(body.supplier_cost_amount ?? body.preco_custo);
  const checkoutUrl = cleanString(body.checkout_url);

  if (name.length < 2) return Response.json({ error: "Product name is required." }, { status: 400 });
  if (!categoryId) return Response.json({ error: "Category is required." }, { status: 400 });
  if (!Number.isFinite(price) || price < 0) return Response.json({ error: "Invalid price." }, { status: 400 });
  if (!Number.isFinite(cost) || cost < 0) return Response.json({ error: "Invalid cost price." }, { status: 400 });
  if (requestedSupplierCountry && !["ZA", "CN"].includes(requestedSupplierCountry)) return Response.json({ error: "Supplier country must be South Africa (ZA) or China (CN)." }, { status: 400 });
  if (!Number.isFinite(supplierCostAmount) || supplierCostAmount < 0) return Response.json({ error: "Invalid supplier cost." }, { status: 400 });
  if (pricingMode === "custom" && (!Number.isFinite(Number(body.custom_pricing_floor_zar)) || Number(body.custom_pricing_floor_zar) <= 0)) return Response.json({ error: "A positive custom pricing base is required." }, { status: 400 });
  if (supplierCountry === "CN" && (!Number.isFinite(Number(body.supplier_fx_rate_to_zar)) || Number(body.supplier_fx_rate_to_zar) <= 0)) return Response.json({ error: "A valid CNY to ZAR FX rate is required for China suppliers." }, { status: 400 });
  if (!/^https?:\/\//i.test(checkoutUrl)) return Response.json({ error: "A valid checkout URL is required." }, { status: 400 });

  const slug = cleanString(body.slug) || slugify(name) || "product-" + crypto.randomUUID().slice(0, 8);
  const { data: supplierProfile } = await auth.client.from("supplier_profiles").select("approval_status,country_code").eq("user_id", auth.userId).maybeSingle();
  const supplierCountry = String(supplierProfile?.country_code || "").toUpperCase();
  if (!["ZA","CN"].includes(supplierCountry)) return Response.json({ error: "Supplier country must be South Africa (ZA) or China (CN)." }, { status: 400 });
  if (requestedSupplierCountry && requestedSupplierCountry !== supplierCountry) return Response.json({ error: "Supplier country does not match the approved supplier profile." }, { status: 400 });
  const supplierCostCurrency = supplierCountry === "CN" ? "CNY" : "ZAR";
  const initialStatus = supplierProfile?.approval_status === "approved" ? "pending_review" : "draft";

  const { data, error } = await auth.client.from("products").insert({
    nome: name, slug, descricao: cleanString(body.descricao),
    beneficios: Array.isArray(body.beneficios) ? body.beneficios.map(String).map((item) => item.trim()).filter(Boolean) : [],
    ingredientes: cleanString(body.ingredientes) || null, modo_uso: cleanString(body.modo_uso) || null,
    garantia_texto: cleanString(body.garantia_texto) || null, faq: Array.isArray(body.faq) ? body.faq : [],
    fornecedor_nome: cleanString(body.fornecedor_nome) || null, fornecedor_descricao: cleanString(body.fornecedor_descricao) || null,
    fornecedor_pais: cleanString(body.fornecedor_pais) || null, categoria_id: categoryId,
    subcategoria_id: cleanString(body.subcategoria_id) || null,
    preco: Math.round(price),
    preco_promocional: body.preco_promocional == null || body.preco_promocional === "" ? null : Number(body.preco_promocional),
    moeda: "ZAR", comissao_tipo: "percentual", comissao_valor: Number(body.comissao_valor ?? 0),
    preco_custo: supplierCountry === "ZA" ? supplierCostAmount : cost, supplier_country_code: supplierCountry, supplier_cost_currency: supplierCostCurrency, supplier_cost_amount: supplierCostAmount, supplier_fx_rate_to_zar: supplierCostCurrency === "ZAR" ? 1 : (Number(body.supplier_fx_rate_to_zar) || null), supplier_fx_rate_captured_at: supplierCostCurrency === "ZAR" ? new Date().toISOString() : (Number(body.supplier_fx_rate_to_zar) > 0 ? new Date().toISOString() : null), supplier_fx_source: supplierCostCurrency === "CNY" ? "exchangerate-api.com" : "same_currency", taxa_plataforma: Number(body.taxa_plataforma ?? 0), taxa_entrega: Number(body.taxa_entrega ?? 0),
    comissao_afiliado: Number(body.comissao_afiliado ?? body.supplier_commission_rate ?? 0),
    fotos: Array.isArray(body.fotos) ? body.fotos.map(String) : [], video_url: cleanString(body.video_url) || null,
    checkout_url: checkoutUrl, estoque: Math.max(0, Math.floor(Number(body.estoque ?? 0))), reserved_estoque: 0,
    low_stock_threshold: Math.max(0, Math.floor(Number(body.low_stock_threshold ?? 5))),
    pricing_mode: pricingMode,
    custom_pricing_floor_zar: String(body.pricing_mode ?? "fixed") === "custom" && body.custom_pricing_floor_zar != null ? Number(body.custom_pricing_floor_zar) : null,
    supplier_min_selling_price: Number(body.supplier_min_selling_price ?? price),
    supplier_suggested_price: Number(body.supplier_suggested_price ?? price),
    supplier_commission_rate: Number(body.supplier_commission_rate ?? body.comissao_afiliado ?? 0),
    ativo: false, destaque: false, novo: true, created_by: auth.userId, supplier_status: initialStatus,
  }).select("*").single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ data }, { status: 201 });
}
