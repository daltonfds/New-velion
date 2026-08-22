"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createIntegration(formData: FormData) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const platform = formData.get("platform") as string;
  const store_url = formData.get("store_url") as string;
  const api_key = formData.get("api_key") as string;
  const api_secret = formData.get("api_secret") as string;

  if (!platform) throw new Error("Platform is required");

  const { error } = await supabase
    .from("integrations")
    .insert({
      seller_id: user.id,
      platform,
      store_url,
      api_key,
      api_secret,
      is_active: true,
    });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/seller/integrations");
  return { success: true };
}
