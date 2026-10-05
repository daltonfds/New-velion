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
      "id,nome,slug,descricao,preco,preco_promocional,moeda,estoque,ativo,fotos,video_url,categoria_id,beneficios",
      { count: "exact" },
    )
    .eq("ativo", true)
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
