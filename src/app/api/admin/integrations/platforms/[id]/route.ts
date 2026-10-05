import {
  encryptSecret,
  generateIntegrationCredentials,
} from "@/lib/integrations/server";
import { requireAdmin } from "@/lib/integrations/admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = String(body.action ?? "").trim();

  if (["activate", "suspend", "revoke"].includes(action)) {
    const status =
      action === "activate"
        ? "active"
        : action === "suspend"
          ? "suspended"
          : "revoked";

    const { data, error } = await auth.client
      .from("integration_platforms")
      .update({ status })
      .eq("id", id)
      .select("id,name,slug,description,status,api_key,webhook_url,created_at,updated_at")
      .maybeSingle();

    if (error || !data) {
      return Response.json({ error: "Integration platform not found." }, { status: 404 });
    }

    return Response.json({ data });
  }

  if (action === "rotate" || action === "regenerate_webhook_secret") {
    const credentials = generateIntegrationCredentials();
    let encryptedWebhookSecret: string | undefined;

    if (action === "rotate") {
      try {
        encryptedWebhookSecret = encryptSecret(credentials.webhookSecret);
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : "Integration encryption is not configured." },
          { status: 500 },
        );
      }
    } else {
      const { data: current } = await auth.client
        .from("integration_platforms")
        .select("webhook_secret_encrypted")
        .eq("id", id)
        .maybeSingle();

      if (!current) {
        return Response.json({ error: "Integration platform not found." }, { status: 404 });
      }

      try {
        encryptedWebhookSecret = encryptSecret(credentials.webhookSecret);
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : "Integration encryption is not configured." },
          { status: 500 },
        );
      }
    }

    const update =
      action === "rotate"
        ? {
            api_key: credentials.apiKey,
            api_secret_hash: credentials.apiSecretHash,
            webhook_secret_encrypted: encryptedWebhookSecret,
          }
        : { webhook_secret_encrypted: encryptedWebhookSecret };

    const { data, error } = await auth.client
      .from("integration_platforms")
      .update(update)
      .eq("id", id)
      .select("id,name,slug,description,status,api_key,webhook_url,created_at,updated_at")
      .maybeSingle();

    if (error || !data) {
      return Response.json({ error: "Integration platform not found." }, { status: 404 });
    }

    return Response.json({
      data,
      credentials:
        action === "rotate"
          ? {
              api_key: credentials.apiKey,
              api_secret: credentials.apiSecret,
              webhook_secret: credentials.webhookSecret,
            }
          : { webhook_secret: credentials.webhookSecret },
      warning: "Store the new secret now. It will not be shown again.",
    });
  }

  return Response.json({ error: "Unsupported platform action." }, { status: 400 });
}
