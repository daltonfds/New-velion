"use server";

import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { sendVerificationEmail } from "@/lib/email/sendVerification";

// 1. Registo via Email
export async function signupWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: role || "seller",
    },
  });

  if (error) throw new Error(error.message);

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const supabase = createServerClient();
  await supabase.from("email_verification_codes").insert({ email, code: otpCode });
  await sendVerificationEmail(email, otpCode);

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

// 2. Registo via Telefone
export async function signupWithPhone(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const country = formData.get("country") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const supabase = createServerClient();

  const { data, error } = await supabase.auth.signUp({
    email: `${phone}@phone.velion`,
    password,
    options: {
      data: {
        full_name: fullName,
        country: country,
        phone: phone,
        role: role || "seller",
      },
    },
  });

  if (error) throw new Error(error.message);

  const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
  if (otpError) throw new Error(otpError.message);

  redirect(`/verify-phone?phone=${encodeURIComponent(phone)}`);
}

// 3. Verificação de código (Email)
export async function verifyEmailCode(formData: FormData) {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;

  const supabase = createServerClient();
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

  redirect("/dashboard/seller");
}

// 4. Verificação de código (Telefone)
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

// 5. Login via Telefone
export async function loginWithPhone(formData: FormData) {
  const phone = formData.get("phone") as string;

  const supabase = createServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: false }
  });

  if (error) throw new Error(error.message);
  return { success: true, phone };
}

// 6. Login via Email
export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);
  redirect("/dashboard/seller");
}

// 7. Login com Google
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
