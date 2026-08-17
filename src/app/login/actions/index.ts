"use server";

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);
  redirect("/dashboard/seller");
}

export async function loginWithGoogle() {
  const supabase = createServerClient();
  const origin = (await headers()).get("origin");
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error) throw new Error(error.message);
  redirect(data.url);
}

export async function loginWithPhone(formData: FormData) {
  const phone = formData.get("phone") as string; // Já estará no formato +258...
  const supabase = createServerClient();

  // Se for o primeiro clique, envia o SMS (OTP)
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true }
  });

  if (error) throw new Error(error.message);
  // Guarda o número para verificar o OTP no próximo passo
  return { success: true, phone };
}

export async function verifyOTP(formData: FormData) {
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
