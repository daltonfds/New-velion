import { requireAdmin } from "@/lib/integrations/admin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const { data, error } = await auth.client.from("supplier_profiles")
    .select("*,profiles:profiles!supplier_profiles_user_id_fkey(full_name,email:id)")
    .order("created_at", { ascending: false });

  if (error) {
    const fallback = await auth.client.from("supplier_profiles").select("*").order("created_at", { ascending: false });
    if (fallback.error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ data: fallback.data ?? [] });
  }

  return Response.json({ data: data ?? [] });
}
