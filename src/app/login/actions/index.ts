"use server";

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // SE FOR O ADMIN, VALIDA A SENHA EXTRA
  if (email === "daltonfelizarda66@gmail.com") {
    const extraPassword = formData.get("extra_password") as string;
    if (extraPassword !== "Meu amor Carolina") {
      throw new Error("Invalid Admin Security Password");
    }
    redirect("/dashboard/admin");
  }

  // CASO CONTRÁRIO, VAI PARA O PAINEL DO VENDEDOR
  redirect("/dashboard/seller");
}
