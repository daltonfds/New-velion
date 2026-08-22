import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

// PUT/PATCH: Atualizar um produto existente (somente o produtor dono pode)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    // Verificar se o usuário é o dono do produto
    const { data: existing, error: checkError } = await supabase
      .from("products")
      .select("supplier_id")
      .eq("id", id)
      .single();

    if (checkError || !existing) throw new Error("Product not found");
    if (existing.supplier_id !== user.id) throw new Error("Forbidden: You do not own this product");

    // Atualizar o produto
    const { data, error } = await supabase
      .from("products")
      .update(body)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE: Deletar um produto (ou desativar logicamente)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data: existing, error: checkError } = await supabase
      .from("products")
      .select("supplier_id")
      .eq("id", id)
      .single();

    if (checkError || !existing) throw new Error("Product not found");
    if (existing.supplier_id !== user.id) throw new Error("Forbidden: You do not own this product");

    // Desativar logicamente (em vez de deletar, deixamos como inativo)
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
    return new Response(null, { status: 204 }); // No Content
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
