import { adminClient } from "@/lib/integrations/server";

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { ok: false as const, status: 401, message: "Authentication required." };
  }

  const client = adminClient();
  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    return { ok: false as const, status: 401, message: "Invalid session." };
  }

  const { data: profile } = await client
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false as const, status: 403, message: "Forbidden." };
  }

  return { ok: true as const, userId: data.user.id, client };
}
