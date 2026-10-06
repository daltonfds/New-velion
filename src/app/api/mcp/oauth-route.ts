import { mcpHandler } from "@/app/api/mcp/route";
import { withOAuthProtectedResource, withSupabase, fromSupabaseUrl } from "@supabase/server";

const handle = withOAuthProtectedResource(
  {
    resourceServer: (request) => new URL(request.url).origin + "/api/mcp/oauth-route",
    authorizationServer: fromSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || ""),
  },
  withSupabase({ auth: "user" }, async (request, context) => {
    const userId = context.userClaims?.id;
    if (!userId) return Response.json({ error: "Unauthorized MCP request." }, { status: 401 });
    const { data: profile, error } = await context.supabaseAdmin.from("profiles").select("role").eq("id", userId).maybeSingle();
    if (error || profile?.role !== "admin") return Response.json({ error: "NewVelion administrator access is required." }, { status: 403 });
    return mcpHandler.fetch(request);
  }),
);

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
