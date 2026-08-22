"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createDispute(formData: FormData) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const order_id = formData.get("order_id") as string;
  const reason = formData.get("reason") as string;
  const description = formData.get("description") as string;

  await supabase.from("disputes").insert({
    order_id,
    seller_id: user.id,
    reason,
    description,
    status: "pending",
  });

  revalidatePath("/dashboard/seller/returns");
  return { success: true };
}
