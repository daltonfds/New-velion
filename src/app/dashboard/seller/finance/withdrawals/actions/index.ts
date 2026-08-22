"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function requestWithdrawal(formData: FormData) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const amount = parseFloat(formData.get("amount") as string);
  const method = formData.get("method") as string;
  if (!amount || amount <= 0) throw new Error("Invalid amount");

  // Taxas: 2.5% + R10
  const fee = (amount * 0.025) + 10;
  const total = amount + fee;

  // Verificar saldo
  const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).single();
  if (!profile || profile.balance < total) {
    throw new Error("Insufficient balance to cover withdrawal amount and fees.");
  }

  await supabase.from("withdrawals").insert({
    seller_id: user.id,
    amount,
    fee,
    method,
    status: "pending",
  });

  // Atualizar saldo
  await supabase.from("profiles").update({ balance: profile.balance - total }).eq("id", user.id);

  revalidatePath("/dashboard/seller/finance/withdrawals");
  return { success: true };
}
