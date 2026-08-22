import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET: Buscar todos os produtos (para o Marketplace do Seller)
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true) // Apenas produtos aprovados
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST: Criar um novo produto (usado pelo formulário "Add Product")
export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, price, category, images } = body;

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price: parseFloat(price),
        category,
        images: images || [],
        supplier_id: user.id,
        is_active: false, // Aguarda aprovação do Admin
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
