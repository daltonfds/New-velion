"use server";

import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendVerificationEmail } from "@/lib/email/sendVerification";

export async function signupWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: role || "seller" },
    });

    if (error) throw new Error(error.message);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const supabase = createServerClient();
    await supabase.from("email_verification_codes").insert({ email, code: otpCode });
    await sendVerificationEmail(email, otpCode);

    return { success: true, redirect: `/verify-email?email=${encodeURIComponent(email)}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signupWithPhone(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const country = formData.get("country") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: `${phone}@phone.velion`,
      password,
      options: { data: { full_name: fullName, country, phone, role: role || "seller" } },
    });

    if (error) throw new Error(error.message);

    const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
    if (otpError) throw new Error(otpError.message);

    return { success: true, redirect: `/verify-phone?phone=${encodeURIComponent(phone)}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const supabase = createServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return { success: true, redirect: "/dashboard/seller" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function loginWithPhone(formData: FormData) {
  const phone = formData.get("phone") as string;
  try {
    const supabase = createServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: false }
    });
    if (error) throw new Error(error.message);
    return { success: true, redirect: "/verify-phone" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
