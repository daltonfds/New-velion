import { adminClient } from "@/lib/integrations/server";

export async function requireSupplier(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.replace(/^Bearer\\s+/i, "").trim();

  if (!token) {
    return {
      ok: false as const,
      status: 401,
      message: "Authentication required.",
    };
  }

  const client = adminClient();
  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    return {
      ok: false as const,
      status: 401,
      message: "Invalid session.",
    };
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("id,role,status,kyc_status,full_name,nome_completo")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false as const,
      status: 500,
      message: profileError.message,
    };
  }

  if (profile?.role !== "supplier") {
    return {
      ok: false as const,
      status: 403,
      message: "Supplier access required.",
    };
  }

  return {
    ok: true as const,
    userId: data.user.id,
    user: data.user,
    profile,
    client,
  };
}
