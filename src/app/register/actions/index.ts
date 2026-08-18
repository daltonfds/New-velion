"use server";

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { sendVerificationEmail } from "@/lib/email/sendVerification";
import { revalidatePath } from "next/cache";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string;

  const supabase = createServerClient();

  // 1. Criar o usuário no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: role || "seller" },
      emailRedirectTo: undefined,
    },
  });

  if (error) throw new Error(error.message);

  // 2. Gerar código OTP de 6 dígitos
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 3. Salvar o código no banco
  await supabase
    .from("email_verification_codes")
    .insert({
      email: email,
      code: otpCode,
    });

  // 4. Enviar o email com o código via Resend
  await sendVerificationEmail(email, otpCode);

  // 5. Redirecionar para a página de verificação, passando o email via query string
  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function verifyEmailCode(formData: FormData) {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;

  const supabase = createServerClient();

  // 1. Buscar o código no banco
  const { data, error } = await supabase
    .from("email_verification_codes")
    .select("*")
    .eq("email", email)
    .eq("code", code)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    throw new Error("Invalid or expired verification code.");
  }

  // 2. Atualizar o usuário no Auth (confirmar o email manualmente)
  const { error: updateError } = await supabase.auth.updateUser({
    data: { email_confirmed_at: new Date().toISOString() },
  });

  if (updateError) throw new Error(updateError.message);

  // 3. Opcional: Limpar códigos usados
  await supabase
    .from("email_verification_codes")
    .delete()
    .eq("email", email)
    .eq("code", code);

  // 4. Redirecionar para o dashboard
  redirect("/dashboard/seller");
}
