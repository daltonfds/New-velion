import {
  apiError,
  apiOk,
  authenticateIntegrationRequest,
  logIntegrationRequest,
} from "@/lib/integrations/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const started = Date.now();
  const auth = await authenticateIntegrationRequest(request);
  const path = new URL(request.url).pathname;

  if (!auth.ok) return auth.error;

  const { id } = await params;
  const { data, error } = await auth.client
    .from("integration_external_offers")
    .select(
      "id,platform_id,external_seller_id,newvelion_product_id,mapping_id,pricing_mode,sale_price,base_price_zar,seller_margin_zar,commission_snapshot_zar,currency,offer_token,status,created_at,updated_at",
    )
    .eq("platform_id", auth.platform.id)
    .or(`id.eq.${id},offer_token.eq.${id}`)
    .maybeSingle();

  if (error) {
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: auth.id,
      method: "GET",
      path,
      statusCode: 500,
      durationMs: Date.now() - started,
    });
    return apiError("INTERNAL_ERROR", "Could not load the offer.", 500, auth.id);
  }

  if (!data) {
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: auth.id,
      method: "GET",
      path,
      statusCode: 404,
      durationMs: Date.now() - started,
    });
    return apiError("OFFER_NOT_FOUND", "External seller offer not found.", 404, auth.id);
  }

  await logIntegrationRequest({
    platformId: auth.platform.id,
    requestId: auth.id,
    method: "GET",
    path,
    statusCode: 200,
    durationMs: Date.now() - started,
  });

  return apiOk(
    {
      data: {
        ...data,
        sale_price: Number(data.sale_price),
        base_price_zar: Number(data.base_price_zar),
        seller_margin_zar: Number(data.seller_margin_zar),
        commission_snapshot_zar: Number(data.commission_snapshot_zar),
        currency: "ZAR",
        sales_url: `${new URL(request.url).origin}/oferta/${data.offer_token}`,
      },
    },
    200,
    auth.id,
  );
}
