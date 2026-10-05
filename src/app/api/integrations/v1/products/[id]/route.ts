import {
  apiError,
  apiOk,
  authenticateIntegrationRequest,
  logIntegrationRequest,
} from "@/lib/integrations/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const started = Date.now();
  const auth = await authenticateIntegrationRequest(request);
  const id = auth.id;
  const path = new URL(request.url).pathname;

  if (!auth.ok) {
    await logIntegrationRequest({
      requestId: id,
      method: "GET",
      path,
      statusCode: auth.error.status,
      durationMs: Date.now() - started,
    });
    return auth.error;
  }

  const { id: productId } = await context.params;
  const { data: product, error } = await auth.client
    .from("products")
    .select(
      "id,nome,slug,descricao,preco,preco_promocional,moeda,estoque,ativo,fotos,video_url,categoria_id,beneficios",
    )
    .eq("id", productId)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: id,
      method: "GET",
      path,
      statusCode: 500,
      durationMs: Date.now() - started,
    });
    return apiError("INTERNAL_ERROR", "Could not load the product.", 500, id);
  }

  if (!product) {
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: id,
      method: "GET",
      path,
      statusCode: 404,
      durationMs: Date.now() - started,
    });
    return apiError("PRODUCT_NOT_FOUND", "Product not found.", 404, id);
  }

  const { data: category } = product.categoria_id
    ? await auth.client
        .from("categories")
        .select("id,nome")
        .eq("id", product.categoria_id)
        .maybeSingle()
    : { data: null };

  await logIntegrationRequest({
    platformId: auth.platform.id,
    requestId: id,
    method: "GET",
    path,
    statusCode: 200,
    durationMs: Date.now() - started,
  });

  return apiOk(
    {
      data: {
        id: product.id,
        name: product.nome,
        slug: product.slug,
        description: product.descricao,
        currency: product.moeda,
        price: Number(product.preco),
        promotional_price:
          product.preco_promocional == null
            ? null
            : Number(product.preco_promocional),
        stock: Number(product.estoque ?? 0),
        available: Boolean(product.ativo) && Number(product.estoque ?? 0) > 0,
        images: product.fotos ?? [],
        video_url: product.video_url,
        category_id: product.categoria_id,
        category_name: category?.nome ?? null,
        benefits: product.beneficios ?? [],
        shipping: { supported: true },
      },
    },
    200,
    id,
  );
}
