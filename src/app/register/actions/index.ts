"use server";

import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "seller",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard/seller");
}
