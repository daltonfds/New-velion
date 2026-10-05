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

  if (!auth.ok) return auth.error;

  const { id: productId } = await context.params;
  const { data: product, error } = await auth.client
    .from("products")
    .select("id,estoque,ativo,moeda")
    .eq("id", productId)
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
    return apiError("INTERNAL_ERROR", "Could not load product stock.", 500, id);
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
        product_id: product.id,
        stock: Number(product.estoque ?? 0),
        available: Boolean(product.ativo) && Number(product.estoque ?? 0) > 0,
        currency: product.moeda,
      },
    },
    200,
    id,
  );
}
