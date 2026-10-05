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

  const externalSellerId = String(body.external_seller_id ?? "").trim();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim() || null;
  const status = String(body.status ?? "active").trim();
  const metadata =
    body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? body.metadata
      : {};

  if (!externalSellerId || !name) {
    return apiError("INVALID_SELLER", "external_seller_id and name are required.", 400, auth.id);
  }

  if (!["active", "suspended", "revoked"].includes(status)) {
    return apiError("INVALID_SELLER", "Invalid seller status.", 400, auth.id);
  }

  const { data, error } = await auth.client
    .from("integration_external_sellers")
    .upsert(
      {
        platform_id: auth.platform.id,
        external_seller_id: externalSellerId,
        name,
        email,
        status,
        metadata,
      },
      { onConflict: "platform_id,external_seller_id" },
    )
    .select("id,external_seller_id,name,email,status,metadata,created_at,updated_at")
    .single();

  if (error) {
    console.error("Integration seller upsert failed:", error);
    await logIntegrationRequest({
      platformId: auth.platform.id,
      requestId: auth.id,
      method: "POST",
      path,
      statusCode: 500,
      durationMs: Date.now() - started,
    });
    return apiError("INTERNAL_ERROR", "Could not save the external seller.", 500, auth.id);
  }

  await logIntegrationRequest({
    platformId: auth.platform.id,
    requestId: auth.id,
    method: "POST",
    path,
    statusCode: 200,
    durationMs: Date.now() - started,
  });

  return apiOk({ data }, 200, auth.id);
}
