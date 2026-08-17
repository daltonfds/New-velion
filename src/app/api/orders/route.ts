import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET: Buscar pedidos do Seller logado
export async function GET() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, products(*)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST: Criar um novo pedido (usado quando o Seller recebe um pedido da loja integrada)
export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { product_id, customer_name, address, city, phone, quantity, total_price, proof_of_payment_url } = body;

    const { data, error } = await supabase
      .from("orders")
      .insert({
        product_id,
        seller_id: user.id,
        customer_name,
        address,
        city,
        phone,
        quantity,
        total_price,
        proof_of_payment_url,
        status: "pending",
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
