"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createOrder(formData: FormData) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Dados do formulário
  const product_id = formData.get("product_id") as string;
  const customer_name = formData.get("customer_name") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const phone = formData.get("phone") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const selling_price = parseFloat(formData.get("selling_price") as string);
  const delivery_fee = parseFloat(formData.get("delivery_fee") as string) || 0;

  // Buscar produto
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", product_id)
    .single();
  if (error || !product) throw new Error("Product not found");

  // Cálculos financeiros
  const total_revenue = selling_price * quantity;
  const seller_fee = (total_revenue * 0.05) + (10 * quantity);
  const supplier_fee = (product.price * quantity * 0.05) + (10 * quantity);
  const logistics_cost = delivery_fee;
  const seller_profit = total_revenue - (product.price * quantity) - seller_fee - logistics_cost;
  const supplier_payout = (product.price * quantity) - supplier_fee;

  // Insere pedido
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

  // Insere Ledger (4 entradas)
  await supabase.from("financial_ledger").insert([
    { order_id: order.id, user_id: user.id, type: "sale_revenue", description: "Sale Revenue", amount: total_revenue },
    { order_id: order.id, user_id: user.id, type: "seller_fee", description: "Seller Fee (5% + R10)", amount: -seller_fee },
    { order_id: order.id, user_id: user.id, type: "logistics_cost", description: "Logistics Cost", amount: -logistics_cost },
    { order_id: order.id, user_id: product.supplier_id, type: "supplier_payout", description: "Supplier Payout", amount: supplier_payout },
  ]);

  // Atualizar saldos (Seller e Supplier)
  const { data: seller } = await supabase.from("profiles").select("balance").eq("id", user.id).single();
  await supabase.from("profiles").update({ balance: (seller?.balance || 0) + seller_profit }).eq("id", user.id);

  const { data: supplier } = await supabase.from("profiles").select("balance").eq("id", product.supplier_id).single();
  await supabase.from("profiles").update({ balance: (supplier?.balance || 0) + supplier_payout }).eq("id", product.supplier_id);

  revalidatePath("/dashboard/seller/orders");
  return { success: true, order };
}
