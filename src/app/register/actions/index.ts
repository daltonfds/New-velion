"use server";

import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const { error } = await createClient().auth.signUp({
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
    throw new Error(error.message);
  }

  redirect("/dashboard/seller");
}
