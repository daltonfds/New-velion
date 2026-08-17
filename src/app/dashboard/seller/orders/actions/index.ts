"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOrder(formData: FormData) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Dados do formulário
  const product_id = formData.get("product_id") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const customer_name = formData.get("customer_name") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const phone = formData.get("phone") as string;
  const seller_selling_price = parseFloat(formData.get("selling_price") as string);
  const delivery_fee = parseFloat(formData.get("delivery_fee") as string) || 0; // Agora dinâmico

  // 2. Buscar dados do produto
  const { data: product, error: prodError } = await supabase
    .from("products")
    .select("name, price, supplier_id")
    .eq("id", product_id)
    .single();
  if (prodError || !product) throw new Error("Product not found");

  const supplier_cost_price = product.price;

  // 3. Cálculos Financeiros (Tudo dinâmico)
  const logistics_cost = delivery_fee;
  const total_revenue = seller_selling_price * quantity;
  const total_cost = (supplier_cost_price * quantity) + logistics_cost;

  const seller_fee = (total_revenue * 0.05) + (10 * quantity);
  const supplier_fee = (supplier_cost_price * quantity * 0.05) + (10 * quantity);

  const seller_profit = total_revenue - (supplier_cost_price * quantity) - seller_fee - logistics_cost;
  const supplier_payout = (supplier_cost_price * quantity) - supplier_fee;

  // 4. Criar o Pedido
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      product_id,
      seller_id: user.id,
      customer_name,
      address,
      city,
      phone,
      quantity,
      total_price: total_revenue,
      delivery_fee: logistics_cost,
      status: "pending",
    })
    .select()
    .single();
  if (orderError) throw new Error(orderError.message);

  // 5. Registrar no Financial Ledger
  const ledgerEntries = [
    { order_id: order.id, user_id: user.id, type: "sale_revenue", description: `Sale of ${quantity}x ${product.name || 'Product'}`, amount: total_revenue },
    { order_id: order.id, user_id: user.id, type: "seller_fee", description: `Velion fee (5% + R10)`, amount: -seller_fee },
    { order_id: order.id, user_id: user.id, type: "logistics_cost", description: `Delivery fee`, amount: -logistics_cost },
    { order_id: order.id, user_id: product.supplier_id, type: "supplier_payout", description: `Payout for order #${order.id}`, amount: supplier_payout },
  ];

  const { error: ledgerError } = await supabase.from("financial_ledger").insert(ledgerEntries);
  if (ledgerError) throw new Error(ledgerError.message);

  // 6. Atualizar saldos (Resumo na tabela profiles)
  const { data: sellerProfile } = await supabase.from("profiles").select("balance").eq("id", user.id).single();
  const { data: supplierProfile } = await supabase.from("profiles").select("balance").eq("id", product.supplier_id).single();

  await supabase.from("profiles").update({ balance: (sellerProfile?.balance || 0) + seller_profit }).eq("id", user.id);
  await supabase.from("profiles").update({ balance: (supplierProfile?.balance || 0) + supplier_payout }).eq("id", product.supplier_id);

  revalidatePath("/dashboard/seller/orders");
  return { success: true, order };
}
