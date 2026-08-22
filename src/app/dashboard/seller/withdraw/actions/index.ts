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

  // 1. Buscar saldo atual do usuário
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) throw new Error("User profile not found");

  // 2. Calcular taxas (2.5% + R10)
  const fee = (amount * 0.025) + 10;
  const totalDeduction = amount + fee;

  // 3. Verificar saldo
  if (profile.balance < totalDeduction) {
    throw new Error(`Insufficient balance. You need at least R${totalDeduction.toFixed(2)} to withdraw R${amount}.`);
  }

  // 4. Criar solicitação de saque
  const { error: withdrawalError } = await supabase
    .from("withdrawals")
    .insert({
      seller_id: user.id,
      amount: amount,
      fee: fee,
      method: method,
      status: "pending"
    });

  if (withdrawalError) throw new Error(withdrawalError.message);

  // 5. Atualizar o saldo do usuário (já descontando o valor + taxa, como uma reserva)
  const newBalance = profile.balance - totalDeduction;
  await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", user.id);

  revalidatePath("/dashboard/seller/wallet");
  return { success: true };
}
