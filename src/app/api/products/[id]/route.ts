import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PATCH: Atualizar o status de um produto (Aprovar/Rejeitar)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Apenas Admin pode aprovar/rejeitar produtos
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { is_active } = body; // true (aprovado) ou false (rejeitado)

    const { data, error } = await supabase
      .from("products")
      .update({ is_active })
      .eq("id", params.id)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
