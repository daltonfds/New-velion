"use server";

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = createServerClient();

  await supabase.auth.signOut();

  redirect("/login");
}
