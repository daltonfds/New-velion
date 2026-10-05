import {
  apiError,
  apiOk,
  authenticateIntegrationRequest,
  logIntegrationRequest,
  queueIntegrationWebhook,
  deliverIntegrationWebhook,
} from "@/lib/integrations/server";

function mapOrderError(message: string) {
  const code = message.match(
    /INVALID_ORDER|INVALID_SELLER|PRODUCT_NOT_MAPPED|PRODUCT_NOT_FOUND|PRODUCT_OUT_OF_STOCK|INVALID_QUANTITY|INVALID_CURRENCY|SALE_PRICE_BELOW_MINIMUM/,
  )?.[0];

  switch (code) {
    case "INVALID_SELLER":
      return ["INVALID_SELLER", "External seller is invalid or inactive.", 404] as const;
    case "PRODUCT_NOT_MAPPED":
      return ["PRODUCT_NOT_MAPPED", "The external product is not mapped to NewVelion.", 409] as const;
    case "PRODUCT_NOT_FOUND":
      return ["PRODUCT_NOT_FOUND", "The NewVelion product is unavailable.", 404] as const;
    case "PRODUCT_OUT_OF_STOCK":
      return ["PRODUCT_OUT_OF_STOCK", "The requested product quantity is out of stock.", 409] as const;
    case "INVALID_QUANTITY":
      return ["INVALID_QUANTITY", "Every order quantity must be greater than zero.", 400] as const;
    case "INVALID_CURRENCY":
      return ["INVALID_CURRENCY", "The order currency is not supported for the mapped product.", 409] as const;
    case "SALE_PRICE_BELOW_MINIMUM":
      return ["SALE_PRICE_BELOW_MINIMUM", "The seller price is below the supplier minimum.", 409] as const;
    default:
      return ["INVALID_ORDER", "The order payload is invalid.", 400] as const;
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

  const externalOrderId = String(body.external_order_id ?? "").trim();
  const externalSellerId = String(body.external_seller_id ?? "").trim();
  const currency = String(body.currency ?? "").trim();
  const items = Array.isArray(body.items) ? body.items : [];
  const customer =
    body.customer && typeof body.customer === "object" && !Array.isArray(body.customer)
      ? body.customer
      : {};
  const shippingAddress: Record<string, unknown> =
    body.shipping_address &&
    typeof body.shipping_address === "object" &&
    !Array.isArray(body.shipping_address)
      ? (body.shipping_address as Record<string, unknown>)
      : {};
  const shippingAmount =
    body.shipping_amount == null ? 0 : Number(body.shipping_amount);
  const metadata =
    body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? body.metadata
      : {};
  const idempotencyKey =
    request.headers.get("idempotency-key")?.trim() ||
    String(body.idempotency_key ?? "").trim() ||
    null;

  if (!externalOrderId || !externalSellerId || !["ZAR", "MZN"].includes(currency)) {
    return apiError("INVALID_ORDER", "external_order_id, external_seller_id and a supported currency are required.", 400, auth.id);
  }

  if (!items.length) {
    return apiError("INVALID_ORDER", "At least one order item is required.", 400, auth.id);
  }

  if (!Number.isFinite(shippingAmount) || shippingAmount < 0) {
    return apiError("INVALID_ORDER", "shipping_amount must be a non-negative number.", 400, auth.id);
  }

  const { data: seller } = await auth.client
    .from("integration_external_sellers")
    .select("id,external_seller_id,status")
    .eq("platform_id", auth.platform.id)
    .eq("external_seller_id", externalSellerId)
    .maybeSingle();

  if (!seller || seller.status !== "active") {
    return apiError("INVALID_SELLER", "External seller is invalid or inactive.", 404, auth.id);
  }

  if (!shippingAddress.country || !shippingAddress.city || !shippingAddress.address || !shippingAddress.phone) {
    return apiError(
      "INVALID_ADDRESS",
      "shipping_address.country, city, address and phone are required.",
      400,
      auth.id,
    );
  }

  const normalizedItems = items.map((item) => ({
    external_product_id: String(item?.external_product_id ?? "").trim(),
    newvelion_product_id: String(item?.newvelion_product_id ?? "").trim() || undefined,
    quantity: Number(item?.quantity ?? 0),
    sale_price: Number(item?.sale_price ?? NaN),
    metadata:
      item?.metadata &&
      typeof item.metadata === "object" &&
      !Array.isArray(item.metadata)
        ? item.metadata
        : {},
  }));

  if (
    normalizedItems.some(
      (item) =>
        !item.external_product_id ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.sale_price) ||
        item.sale_price < 0,
    )
  ) {
    return apiError("INVALID_ORDER", "Each item requires external_product_id, positive integer quantity and a valid sale_price.", 400, auth.id);
  }

  const { data: existing } = await auth.client
    .from("integration_orders")
    .select("id,status,total,currency,external_order_id")
    .eq("platform_id", auth.platform.id)
    .eq("external_order_id", externalOrderId)
    .maybeSingle();

  if (existing) {
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: auth.id,
      method: "POST",
      path,
      statusCode: 200,
      durationMs: Date.now() - started,
    });

    return apiOk(
      {
        data: {
          id: existing.id,
          external_order_id: existing.external_order_id,
          status: existing.status,
          total: Number(existing.total),
          currency: existing.currency,
          duplicate: true,
        },
      },
      200,
      auth.id,
    );
  }

  const { data: result, error } = await auth.client.rpc("create_integration_order", {
    p_platform_id: auth.platform.id,
    p_external_order_id: externalOrderId,
    p_external_seller_id: seller.id,
    p_currency: currency,
    p_items: normalizedItems,
    p_customer: customer,
    p_shipping_address: shippingAddress,
    p_shipping_amount: shippingAmount,
    p_metadata: metadata,
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    console.error("Integration order creation failed:", error);
    const [code, message, status] = mapOrderError(error.message || "");

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

  const created = Array.isArray(result) ? result[0] : result;

  if (!created?.order_id) {
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: auth.id,
      method: "POST",
      path,
      statusCode: 500,
      durationMs: Date.now() - started,
    });
    return apiError("INTERNAL_ERROR", "NewVelion could not create the order.", 500, auth.id);
  }

  const webhook = await queueIntegrationWebhook(auth.platform.id, "order.created", {
    newvelion_order_id: created.order_id,
    external_order_id: externalOrderId,
    status: created.order_status,
    total: Number(created.order_total),
    currency: created.order_currency,
  });

  void deliverIntegrationWebhook(webhook.id).catch((deliveryError) => {
    console.error("Initial integration webhook delivery failed:", deliveryError);
  });

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
        id: created.order_id,
        external_order_id: externalOrderId,
        status: created.order_status,
        total: Number(created.order_total),
        currency: created.order_currency,
      },
    },
    201,
    auth.id,
  );
}
