import {
  apiError,
  apiOk,
  authenticateIntegrationRequest,
  logIntegrationRequest,
} from "@/lib/integrations/server";

export async function POST(request: Request) {
  const started = Date.now();
  const auth = await authenticateIntegrationRequest(request);
  const path = new URL(request.url).pathname;

  if (!auth.ok) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_ORDER", "Request body must be valid JSON.", 400, auth.id);
  }

  const externalProductId = String(body.external_product_id ?? "").trim();
  const newvelionProductId = String(body.newvelion_product_id ?? "").trim();
  const externalSellerId = String(body.external_seller_id ?? "").trim() || null;
  const salePrice =
    body.sale_price == null ? null : Number(body.sale_price);
  const saleCurrency = String(body.sale_currency ?? "").trim() || null;
  const pricingMode = String(body.pricing_mode ?? "inherit").trim();

  if (!externalProductId || !newvelionProductId) {
    return apiError(
      "PRODUCT_NOT_FOUND",
      "external_product_id and newvelion_product_id are required.",
      400,
      auth.id,
    );
  }

  if (salePrice != null && (!Number.isFinite(salePrice) || salePrice < 0)) {
    return apiError("INVALID_ORDER", "sale_price must be a non-negative number.", 400, auth.id);
  }

  if (!["inherit","fixed","custom"].includes(pricingMode)) {
    return apiError("INVALID_ORDER", "pricing_mode must be inherit, fixed, or custom.", 400, auth.id);
  }

  if (saleCurrency && saleCurrency !== "ZAR") {
    return apiError("INVALID_CURRENCY", "sale_currency must be ZAR.", 400, auth.id);
  }

  const { data: product, error: productError } = await auth.client
    .from("products")
    .select("id,ativo,moeda,pricing_mode,preco,preco_promocional,custom_pricing_floor_zar,supplier_min_selling_price,supplier_cost_currency,supplier_cost_amount,supplier_fx_rate_to_zar,supplier_origin_shipping_cost,supplier_origin_shipping_currency")
    .eq("id", newvelionProductId)
    .maybeSingle();

  if (productError || !product) {
    return apiError("PRODUCT_NOT_FOUND", "NewVelion product not found.", 404, auth.id);
  }

  if (!product.ativo) {
    return apiError("PRODUCT_NOT_FOUND", "NewVelion product is not available for integration.", 409, auth.id);
  }

  if (pricingMode === "fixed" && salePrice == null) {
    return apiError("INVALID_ORDER", "A fixed mapping requires sale_price.", 400, auth.id);
  }

  const fixedPrice = Number(
    Number(product.preco_promocional ?? 0) > 0 ? product.preco_promocional : product.preco,
  );
  let basePrice = 0;
  if (product.custom_pricing_floor_zar != null) {
    basePrice = Number(product.custom_pricing_floor_zar);
  } else if (product.supplier_min_selling_price != null) {
    basePrice = Number(product.supplier_min_selling_price);
  } else {
    const supplierCost =
      product.supplier_cost_currency === "CNY" && Number(product.supplier_fx_rate_to_zar ?? 0) > 0
        ? Number(product.supplier_cost_amount ?? 0) * Number(product.supplier_fx_rate_to_zar)
        : Number(product.supplier_cost_amount ?? 0);
    const originShipping =
      Number(product.supplier_origin_shipping_cost ?? 0) *
      (product.supplier_origin_shipping_currency === "CNY" && Number(product.supplier_fx_rate_to_zar ?? 0) > 0
        ? Number(product.supplier_fx_rate_to_zar)
        : 1);
    basePrice = supplierCost + originShipping;
  }

  if (pricingMode === "fixed" && salePrice != null && Math.abs(salePrice - fixedPrice) > 0.01) {
    return apiError("FIXED_PRICE_MISMATCH", "sale_price must match the NewVelion fixed price.", 409, auth.id);
  }

  if (pricingMode === "custom" && salePrice != null && salePrice < basePrice) {
    return apiError("SALE_PRICE_BELOW_BASE_PRICE", "sale_price is below the NewVelion base price.", 409, auth.id);
  }

  if (pricingMode === "custom" && salePrice != null && salePrice <= 0) {
    return apiError("INVALID_ORDER", "A custom mapping sale_price must be positive when supplied.", 400, auth.id);
  }

  if (saleCurrency && saleCurrency !== product.moeda) {
    return apiError("INVALID_CURRENCY", "sale_currency must match the NewVelion product currency.", 409, auth.id);
  }

  let sellerUuid: string | null = null;
  if (externalSellerId) {
    const { data: seller } = await auth.client
      .from("integration_external_sellers")
      .select("id,status")
      .eq("platform_id", auth.platform.id)
      .eq("external_seller_id", externalSellerId)
      .maybeSingle();

    if (!seller || seller.status !== "active") {
      return apiError("INVALID_SELLER", "External seller is not registered or active.", 404, auth.id);
    }

    sellerUuid = seller.id;
  }

  let duplicateQuery = auth.client
    .from("integration_product_mappings")
    .select("id")
    .eq("platform_id", auth.platform.id)
    .eq("external_product_id", externalProductId);

  duplicateQuery = sellerUuid
    ? duplicateQuery.eq("external_seller_id", sellerUuid)
    : duplicateQuery.is("external_seller_id", null);

  const { data: duplicate } = await duplicateQuery.maybeSingle();
  if (duplicate) {
    return apiError("PRODUCT_NOT_MAPPED", "This product mapping already exists.", 409, auth.id);
  }

  const { data, error } = await auth.client
    .from("integration_product_mappings")
    .insert({
      platform_id: auth.platform.id,
      external_product_id: externalProductId,
      newvelion_product_id: product.id,
      external_seller_id: sellerUuid,
      sale_price: salePrice,
      sale_currency: "ZAR",
      metadata: body.metadata ?? {},
    })
    .select(
      "id,external_product_id,newvelion_product_id,external_seller_id,sale_price,sale_currency,pricing_mode,base_price_zar,status,metadata,created_at,updated_at",
    )
    .single();

  if (error) {
    console.error("Integration product mapping failed:", error);
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: auth.id,
      method: "POST",
      path,
      statusCode: 500,
      durationMs: Date.now() - started,
    });
    return apiError("INTERNAL_ERROR", "Could not create the product mapping.", 500, auth.id);
  }

  await logIntegrationRequest({
    platformId: auth.platform.id,
    requestId: auth.id,
    method: "POST",
    path,
    statusCode: 201,
    durationMs: Date.now() - started,
  });

  return apiOk({ data }, 201, auth.id);
}
