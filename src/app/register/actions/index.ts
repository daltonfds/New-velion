"use server";

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signupWithPhone(formData: FormData) {
  const phone = formData.get("phone") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string;

  const supabase = createServerClient();

  // 1. Tentar criar o utilizador com o número de telefone
  const { data, error } = await supabase.auth.signUp({
    phone,
    password: phone, // Gera uma password baseada no número (o utilizador pode alterar depois)
    options: {
      data: {
        full_name: fullName,
        role: role || "seller",
      },
    },
  });

  if (error) throw new Error(error.message);

  // 2. Enviar OTP para o número para verificação
  const { error: otpError } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (otpError) throw new Error(otpError.message);

  // 3. Redirecionar para a página de verificação de código
  redirect(`/verify-phone?phone=${encodeURIComponent(phone)}`);
}

export async function verifyPhoneCode(formData: FormData) {
  const phone = formData.get("phone") as string;
  const token = formData.get("token") as string;

  const supabase = createServerClient();
  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms"
  });

  if (error) throw new Error(error.message);
  redirect("/dashboard/seller");
}
