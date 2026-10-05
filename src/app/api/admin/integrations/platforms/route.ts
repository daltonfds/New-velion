import {
  encryptSecret,
  generateIntegrationCredentials,
} from "@/lib/integrations/server";
import { requireAdmin } from "@/lib/integrations/admin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const { data, error } = await auth.client
    .from("integration_platforms")
    .select("id,name,slug,description,status,api_key,webhook_url,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Could not load integration platforms." }, { status: 500 });
  }

  const platforms = await Promise.all(
    (data ?? []).map(async (platform) => {
      const [{ count: sellers }, { count: products }, { count: orders }, { data: latest }] =
        await Promise.all([
          auth.client
            .from("integration_external_sellers")
            .select("id", { count: "exact", head: true })
            .eq("platform_id", platform.id),
          auth.client
            .from("integration_product_mappings")
            .select("id", { count: "exact", head: true })
            .eq("platform_id", platform.id),
          auth.client
            .from("integration_orders")
            .select("id", { count: "exact", head: true })
            .eq("platform_id", platform.id),
          auth.client
            .from("integration_api_logs")
            .select("created_at")
            .eq("platform_id", platform.id)
            .order("created_at", { ascending: false })
            .limit(1),
        ]);

      return {
        ...platform,
        sellers: sellers ?? 0,
        products: products ?? 0,
        orders: orders ?? 0,
        last_activity: latest?.[0]?.created_at ?? null,
      };
    }),
  );

  return Response.json({ data: platforms });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const description = String(body.description ?? "").trim() || null;
  const webhookUrl = String(body.webhook_url ?? "").trim() || null;

  if (!name || !slug) {
    return Response.json({ error: "Name is required." }, { status: 400 });
  }

  if (webhookUrl) {
    try {
      const url = new URL(webhookUrl);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      return Response.json({ error: "webhook_url must be a valid HTTP(S) URL." }, { status: 400 });
    }
  }

  const credentials = generateIntegrationCredentials();

  let encryptedWebhookSecret: string;
  try {
    encryptedWebhookSecret = encryptSecret(credentials.webhookSecret);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Integration encryption is not configured." },
      { status: 500 },
    );
  }

  const { data, error } = await auth.client
    .from("integration_platforms")
    .insert({
      name,
      slug,
      description,
      status: "active",
      api_key: credentials.apiKey,
      api_secret_hash: credentials.apiSecretHash,
      webhook_url: webhookUrl,
      webhook_secret_encrypted: encryptedWebhookSecret,
    })
    .select("id,name,slug,description,status,api_key,webhook_url,created_at,updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "A platform with this name/slug already exists." }, { status: 409 });
    }

    console.error("Integration platform creation failed:", error);
    return Response.json({ error: "Could not create integration platform." }, { status: 500 });
  }

  return Response.json(
    {
      data,
      credentials: {
        api_key: credentials.apiKey,
        api_secret: credentials.apiSecret,
        webhook_secret: credentials.webhookSecret,
      },
      warning: "Store these credentials now. Secrets are never shown again.",
    },
    { status: 201 },
  );
}
