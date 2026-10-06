import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { fromSupabaseUrl, withOAuthProtectedResource, withSupabase } from "@supabase/server";

export const runtime = "nodejs";

export const createProtectedMcpHandler = (handler: ReturnType<typeof createMcpHandler>) =>
  withOAuthProtectedResource(
    {
      resourceServer: (request) => new URL(request.url).origin + "/mcp",
      authorizationServer: fromSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || ""),
    },
    withSupabase({ auth: "user" }, async (request, context) => {
      const userId = context.userClaims?.id;
      if (!userId) return Response.json({ error: "Unauthorized MCP request." }, { status: 401 });
      const { data: profile, error } = await context.supabaseAdmin.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (error || profile?.role !== "admin") return Response.json({ error: "NewVelion administrator access is required." }, { status: 403 });
      return handler.fetch(request);
    }),
  );
