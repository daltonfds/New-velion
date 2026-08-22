import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createServerClient();
  const body = await req.json();

  // Simulação de webhook (Shopify/WooCommerce)
  const { email, phone, address, city, product_id, quantity, total_price } = body;

  // Buscar o produto e o seller associado a essa integração
  const { data: product } = await supabase.from("products").select("seller_id").eq("id", product_id).single();
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // Criar o pedido automaticamente na Velion
  const { data: order, error } = await supabase.from("orders").insert({
    product_id,
    seller_id: product.seller_id,
    customer_name: email || "External Customer",
    address,
    city,
    phone,
    quantity,
    total_price,
    status: "pending",
    proof_of_payment_url: "external_integration",
  }).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Order processed successfully", order });
}
