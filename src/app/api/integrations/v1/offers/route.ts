import {
  apiError,
  apiOk,
  authenticateIntegrationRequest,
  logIntegrationRequest,
} from "@/lib/integrations/server";

function mapOfferError(message: string) {
  const code = message.match(
    /INVALID_PLATFORM|INVALID_SELLER|PRODUCT_NOT_AVAILABLE|PRODUCT_NOT_MAPPED|MAPPING_SELLER_MISMATCH|INVALID_PRICING_MODE|FIXED_PRICE_MISMATCH|SALE_PRICE_BELOW_BASE_PRICE|PRICING_BASE_NOT_CONFIGURED/,
  )?.[0];

  switch (code) {
    case "INVALID_SELLER":
      return ["INVALID_SELLER", "External seller is invalid or inactive.", 404] as const;
    case "PRODUCT_NOT_AVAILABLE":
      return ["PRODUCT_NOT_AVAILABLE", "The NewVelion product is not available for external selling.", 409] as const;
    case "PRODUCT_NOT_MAPPED":
      return ["PRODUCT_NOT_MAPPED", "The product mapping is missing or inactive.", 409] as const;
    case "MAPPING_SELLER_MISMATCH":
      return ["MAPPING_SELLER_MISMATCH", "The mapping belongs to another external seller.", 409] as const;
    case "INVALID_PRICING_MODE":
      return ["INVALID_PRICING_MODE", "pricing_mode must be inherit, fixed or custom.", 400] as const;
    case "FIXED_PRICE_MISMATCH":
      return ["FIXED_PRICE_MISMATCH", "The supplied price does not match the fixed NewVelion price.", 409] as const;
    case "SALE_PRICE_BELOW_BASE_PRICE":
      return ["SALE_PRICE_BELOW_BASE_PRICE", "The custom selling price is below the NewVelion base.", 409] as const;
    case "PRICING_BASE_NOT_CONFIGURED":
      return ["PRICING_BASE_NOT_CONFIGURED", "This product does not have a valid pricing base.", 409] as const;
    default:
      return ["INVALID_ORDER", "The offer payload is invalid.", 400] as const;
  }
}

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

  const externalSellerId = String(body.external_seller_id ?? "").trim();
  const externalProductId = String(body.external_product_id ?? "").trim();
  const newvelionProductId = String(body.newvelion_product_id ?? "").trim();
  const pricingMode = String(body.pricing_mode ?? "").trim();
  const salePrice = body.sale_price == null ? null : Number(body.sale_price);

  const { data: seller } = await auth.client
    .from("integration_external_sellers")
    .select("id,status")
    .eq("platform_id", auth.platform.id)
    .eq("external_seller_id", externalSellerId)
    .maybeSingle();

  if (!seller || seller.status !== "active") {
    return apiError("INVALID_SELLER", "External seller is not registered or active.", 404, auth.id);
  }

  if (!externalSellerId || !externalProductId || !newvelionProductId || !pricingMode) {
    return apiError(
      "INVALID_ORDER",
      "external_seller_id, external_product_id, newvelion_product_id, pricing_mode and sale_price are required.",
      400,
      auth.id,
    );
  }

  if (!Number.isFinite(salePrice) || salePrice <= 0) {
    return apiError("INVALID_ORDER", "sale_price must be a positive number.", 400, auth.id);
  }

  let mappingId: string | null = null;
  {
    const { data: mapping } = await auth.client
      .from("integration_product_mappings")
      .select("id")
      .eq("platform_id", auth.platform.id)
      .eq("external_product_id", externalProductId)
      .eq("newvelion_product_id", newvelionProductId)
      .or(`external_seller_id.is.null,external_seller_id.eq.${seller.id}`)
      .eq("status", "active")
      .maybeSingle();

    if (!mapping) {
      return apiError("PRODUCT_NOT_MAPPED", "The external product is not mapped to NewVelion.", 409, auth.id);
    }
    mappingId = mapping.id;
  }

  const { data, error } = await auth.client.rpc("create_external_seller_offer", {
    p_platform_id: auth.platform.id,
    p_external_seller_id: seller.id,
    p_newvelion_product_id: newvelionProductId,
    p_mapping_id: mappingId,
    p_pricing_mode: pricingMode,
    p_sale_price: salePrice,
  });

  if (error) {
    const [code, message, status] = mapOfferError(error.message || "");
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: auth.id,
      method: "POST",
      path,
      statusCode: status,
      durationMs: Date.now() - started,
    });
    return apiError(code, message, status, auth.id);
  }

  const offer = Array.isArray(data) ? data[0] : data;
  await logIntegrationRequest({
    platformId: auth.platform.id,
    requestId: auth.id,
    method: "POST",
    path,
    statusCode: 201,
    durationMs: Date.now() - started,
  });

  return apiOk(
    {
      data: {
        offer_id: offer?.offer_id,
        pricing_mode: offer?.pricing_mode,
        sale_price: Number(offer?.sale_price ?? 0),
        base_price_zar: Number(offer?.base_price_zar ?? 0),
        seller_margin_zar: Number(offer?.seller_margin_zar ?? 0),
        commission_snapshot_zar: Number(offer?.commission_snapshot_zar ?? 0),
        currency: offer?.currency ?? "ZAR",
        offer_token: offer?.offer_token,
        sales_url: `${new URL(request.url).origin}/oferta/${offer?.offer_token}`,
      },
    },
    201,
    auth.id,
  );
}
