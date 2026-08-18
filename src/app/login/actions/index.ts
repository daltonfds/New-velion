"use server";

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Login via Email/Senha
export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);
  redirect("/dashboard/seller");
}

// Envio de OTP via SMS (Login)
export async function loginWithPhone(formData: FormData) {
  const phone = formData.get("phone") as string;

  const supabase = createServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true }
  });

  if (error) throw new Error(error.message);
  return { success: true, phone };
}

// Verificação do OTP para Login
export async function verifyOTPLogin(formData: FormData) {
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
