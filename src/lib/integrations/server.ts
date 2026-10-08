import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type IntegrationPlatform = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "suspended" | "revoked";
  api_key: string;
  api_secret_hash: string;
  webhook_url: string | null;
  webhook_secret_encrypted: string | null;
  created_at: string;
  updated_at: string;
};

export function adminClient(): SupabaseClient {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function requestId(request: Request): string {
  return request.headers.get("x-request-id")?.trim() || crypto.randomUUID();
}

export function apiError(
  code: string,
  message: string,
  status: number,
  id: string,
) {
  return Response.json(
    { error: { code, message, request_id: id } },
    {
      status,
      headers: {
        "x-request-id": id,
        "cache-control": "no-store",
      },
    },
  );
}

export function apiOk<T>(
  data: T,
  status = 200,
  id?: string,
  extraHeaders?: Record<string, string>,
) {
  const headers: Record<string, string> = {
    "cache-control": "no-store",
    ...extraHeaders,
  };

  if (id) headers["x-request-id"] = id;

  return Response.json(data, { status, headers });
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function generateIntegrationCredentials() {
  const apiKey = `nv_live_${randomBytes(18).toString("base64url")}`;
  const apiSecret = `nvs_${randomBytes(36).toString("base64url")}`;
  const webhookSecret = `nwh_${randomBytes(36).toString("base64url")}`;

  return {
    apiKey,
    apiSecret,
    apiSecretHash: sha256(apiSecret),
    webhookSecret,
  };
}

function encryptionKey(): Buffer {
  const raw = process.env.INTEGRATION_ENCRYPTION_KEY?.trim();

  if (!raw) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY is required to manage integration webhook secrets.",
    );
  }

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY must be a 32-byte base64 value or a 64-character hex value.",
    );
  }

  return key;
}

export function encryptSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${ciphertext.toString("base64url")}`;
}

export function decryptSecret(payload: string): string {
  const [version, ivRaw, tagRaw, cipherRaw] = payload.split(":");

  if (version !== "v1" || !ivRaw || !tagRaw || !cipherRaw) {
    throw new Error("Invalid encrypted integration secret.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivRaw, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(cipherRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export async function authenticateIntegrationRequest(request: Request) {
  const id = requestId(request);
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);

  if (!match) {
    return { ok: false as const, id, error: apiError("UNAUTHORIZED", "Authentication required.", 401, id) };
  }

  const credential = match[1];
  const separator = credential.indexOf(".");
  if (separator <= 0 || separator === credential.length - 1) {
    return { ok: false as const, id, error: apiError("UNAUTHORIZED", "Authentication failed.", 401, id) };
  }

  const apiKey = credential.slice(0, separator);
  const apiSecret = credential.slice(separator + 1);
  const client = adminClient();

  const { data: platform, error } = await client
    .from("integration_platforms")
    .select("*")
    .eq("api_key", apiKey)
    .maybeSingle();

  if (error || !platform) {
    return { ok: false as const, id, error: apiError("UNAUTHORIZED", "Authentication failed.", 401, id) };
  }

  if (platform.status !== "active") {
    return { ok: false as const, id, error: apiError("INVALID_PLATFORM", "This integration is not active.", 403, id) };
  }

  const receivedHash = sha256(apiSecret);
  if (!safeEqualHex(receivedHash, platform.api_secret_hash)) {
    return { ok: false as const, id, error: apiError("UNAUTHORIZED", "Authentication failed.", 401, id) };
  }

  const { data: allowed } = await client.rpc("consume_integration_rate_limit", {
    p_platform_id: platform.id,
    p_limit: 120,
    p_window_seconds: 60,
  });

  if (allowed === false) {
    return {
      ok: false as const,
      id,
      error: apiError("RATE_LIMITED", "Integration API rate limit exceeded.", 429, id),
    };
  }

  return {
    ok: true as const,
    id,
    platform: platform as IntegrationPlatform,
    client,
  };
}

export async function logIntegrationRequest(args: {
  platformId?: string | null;
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs?: number;
}) {
  try {
    const client = adminClient();
    await client.from("integration_api_logs").insert({
      platform_id: args.platformId ?? null,
      request_id: args.requestId,
      method: args.method,
      path: args.path,
      status_code: args.statusCode,
      duration_ms: args.durationMs ?? null,
    });
  } catch (error) {
    console.error("Integration API log failed:", error);
  }
}

export async function queueIntegrationWebhook(
  platformId: string,
  eventType: string,
  data: Record<string, unknown>,
) {
  const client = adminClient();
  const eventId = crypto.randomUUID();
  const payload = {
    event: eventType,
    id: eventId,
    created_at: new Date().toISOString(),
    data,
  };

  const { data: event, error } = await client
    .from("integration_webhook_events")
    .insert({
      platform_id: platformId,
      event_id: eventId,
      event_type: eventType,
      payload,
    })
    .select("*")
    .single();

  if (error) throw error;

  return event;
}

function webhookSignature(secret: string, timestamp: string, body: string) {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${body}`, "utf8")
    .digest("hex");
}

export async function deliverIntegrationWebhook(eventId: string) {
  const client = adminClient();
  const { data: event, error } = await client
    .from("integration_webhook_events")
    .select("*,platform:integration_platforms(*)")
    .eq("id", eventId)
    .maybeSingle();

  if (error) throw error;
  if (!event) return { delivered: false, reason: "not_found" as const };
  if (event.status === "delivered") return { delivered: true, reason: "already_delivered" as const };

  const platform = event.platform as IntegrationPlatform | null;
  if (!platform?.webhook_url || !platform.webhook_secret_encrypted) {
    await client
      .from("integration_webhook_events")
      .update({
        status: "failed",
        attempts: Number(event.attempts ?? 0) + 1,
        last_attempt_at: new Date().toISOString(),
        next_attempt_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        error: "Webhook URL or secret is not configured.",
      })
      .eq("id", event.id);
    return { delivered: false, reason: "not_configured" as const };
  }

  const body = JSON.stringify(event.payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const secret = decryptSecret(platform.webhook_secret_encrypted);
  const signature = webhookSignature(secret, timestamp, body);

  try {
    const response = await fetch(platform.webhook_url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Newvelion-IntegrationAPI/1.0",
        "x-newvelion-event": event.event_type,
        "x-newvelion-timestamp": timestamp,
        "x-newvelion-signature": signature,
        "x-newvelion-event-id": event.event_id,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (response.ok) {
      await client
        .from("integration_webhook_events")
        .update({
          status: "delivered",
          attempts: Number(event.attempts ?? 0) + 1,
          last_attempt_at: new Date().toISOString(),
          next_attempt_at: new Date().toISOString(),
          response_status: response.status,
          error: null,
        })
        .eq("id", event.id);

      return { delivered: true, reason: "delivered" as const };
    }

    throw new Error(`Webhook endpoint returned HTTP ${response.status}.`);
  } catch (error) {
    const attempts = Number(event.attempts ?? 0) + 1;
    const backoffSeconds = Math.min(3600, Math.max(30, 2 ** Math.min(attempts, 8) * 5));

    await client
      .from("integration_webhook_events")
      .update({
        status: attempts >= 12 ? "failed" : "pending",
        attempts,
        last_attempt_at: new Date().toISOString(),
        next_attempt_at: new Date(Date.now() + backoffSeconds * 1000).toISOString(),
        error: error instanceof Error ? error.message.slice(0, 500) : "Webhook delivery failed.",
      })
      .eq("id", event.id);

    return { delivered: false, reason: "retry" as const };
  }
}

export async function deliverPendingIntegrationWebhooks(limit = 25) {
  const client = adminClient();
  const { data: events, error } = await client
    .from("integration_webhook_events")
    .select("id")
    .eq("status", "pending")
    .lte("next_attempt_at", new Date().toISOString())
    .order("next_attempt_at", { ascending: true })
    .limit(limit);

  if (error) throw error;

  const results = [];
  for (const event of events ?? []) {
    results.push(await deliverIntegrationWebhook(event.id));
  }

  return results;
}

export function isValidWebhookSignature(
  secret: string,
  timestamp: string,
  body: string,
  signature: string,
) {
  const expected = webhookSignature(secret, timestamp, body);
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(signature, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}
