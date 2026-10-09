import { adminClient } from "@/lib/integrations/server";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\\s+/i, "").trim();

  if (!token) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const client = adminClient();
  const { data: authData, error: authError } = await client.auth.getUser(token);

  if (authError || !authData.user) {
    return Response.json({ error: "Your session is invalid. Please sign in again." }, { status: 401 });
  }

  const { data, error } = await client
    .from("integration_platforms")
    .select("id,name,slug,description,status")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    console.error("Seller integration discovery failed:", error);
    return Response.json({ error: "Could not load active integrations." }, { status: 500 });
  }

  return Response.json(
    {
      data: data ?? [],
      api: {
        version: "v1",
        documentation_url: "/docs/integrations",
        base_url: new URL("/api/integrations/v1", request.url).toString(),
        capabilities: ["products.read", "sellers.manage", "product_mappings.manage", "offers.manage", "orders.create", "fulfillment_tracking"],
        authentication: "Bearer API_KEY.API_SECRET",
      },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
