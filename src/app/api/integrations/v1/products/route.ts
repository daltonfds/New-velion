import {
  apiError,
  apiOk,
  authenticateIntegrationRequest,
  logIntegrationRequest,
} from "@/lib/integrations/server";

export async function GET(request: Request) {
  const started = Date.now();
  const auth = await authenticateIntegrationRequest(request);

  if (!auth.ok) {
    await logIntegrationRequest({
      requestId: auth.id,
      method: "GET",
      path: new URL(request.url).pathname,
      statusCode: auth.error.status,
      durationMs: Date.now() - started,
    });
    return auth.error;
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || "25")));
  const search = url.searchParams.get("search")?.trim() || "";
  const categoryId = url.searchParams.get("category_id")?.trim() || "";
  const available = url.searchParams.get("available");

  let query = auth.client
    .from("products")
    .select(
      "id,nome,slug,descricao,preco,preco_promocional,moeda,estoque,ativo,fotos,video_url,categoria_id,beneficios,pricing_mode,custom_pricing_floor_zar,supplier_min_selling_price,supplier_suggested_price,supplier_country_code,supplier_cost_currency,supplier_cost_amount,supplier_fx_rate_to_zar,supplier_fx_rate_captured_at,supplier_origin_shipping_cost,supplier_origin_shipping_currency,comissao_tipo,comissao_valor",
      { count: "exact" },
    )
    .eq("ativo", true)
    .eq("moeda", "ZAR")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`nome.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  if (categoryId) query = query.eq("categoria_id", categoryId);
  if (available === "true") query = query.gt("estoque", 0);

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) {
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: auth.id,
      method: "GET",
      path: url.pathname,
      statusCode: 500,
      durationMs: Date.now() - started,
    });
    return apiError("INTERNAL_ERROR", "Could not load products.", 500, auth.id);
  }

  const categoryIds = Array.from(
    new Set((data ?? []).map((product) => product.categoria_id).filter(Boolean)),
  );

  const { data: categories } = categoryIds.length
    ? await auth.client.from("categories").select("id,nome").in("id", categoryIds)
    : { data: [] as Array<{ id: string; nome: string }> };

  const categoryMap = new Map(
    (categories ?? []).map((category) => [category.id, category.nome]),
  );

  const products = (data ?? []).map((product) => ({
    id: product.id,
    name: product.nome,
    slug: product.slug,
    description: product.descricao,
    currency: product.moeda,
    price: Number(product.preco),
    promotional_price:
      product.preco_promocional == null ? null : Number(product.preco_promocional),
    stock: Number(product.estoque ?? 0),
    available: Boolean(product.ativo) && Number(product.estoque ?? 0) > 0,
    images: product.fotos ?? [],
    video_url: product.video_url,
    category_id: product.categoria_id,
    category_name: categoryMap.get(product.categoria_id) ?? null,
    benefits: product.beneficios ?? [],
    pricing_mode: product.pricing_mode,
    base_price_zar:
      product.custom_pricing_floor_zar ??
      product.supplier_min_selling_price ??
      null,
    fixed_sale_price:
      product.pricing_mode === "fixed"
        ? Number(product.preco_promocional ?? product.preco)
        : null,
    commission:
      product.comissao_tipo === "percentual"
        ? Number(((Number(product.preco_promocional ?? product.preco) * Number(product.comissao_valor)) / 100).toFixed(2))
        : Number(product.comissao_valor),
    supplier: {
      country_code: product.supplier_country_code,
      cost_currency: product.supplier_cost_currency,
      cost_amount: product.supplier_cost_amount == null ? null : Number(product.supplier_cost_amount),
      fx_rate_to_zar: product.supplier_fx_rate_to_zar == null ? null : Number(product.supplier_fx_rate_to_zar),
      fx_captured_at: product.supplier_fx_rate_captured_at,
      origin_shipping_cost: product.supplier_origin_shipping_cost == null ? null : Number(product.supplier_origin_shipping_cost),
      origin_shipping_currency: product.supplier_origin_shipping_currency,
    },
    shipping: { supported: true },
  }));

  await logIntegrationRequest({
    platformId: auth.platform.id,
    requestId: auth.id,
    method: "GET",
    path: url.pathname,
    statusCode: 200,
    durationMs: Date.now() - started,
  });

  return apiOk(
    {
      data: products,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        pages: Math.ceil((count ?? 0) / limit),
      },
    },
    200,
    auth.id,
  );
}
