"use server";

import { createServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);

  await supabase.from("products").insert({
    supplier_id: user.id,
    name,
    description,
    price,
    cost_price: price,
    is_active: false,
  });

  revalidatePath("/dashboard/producer/products");
  return { success: true };
}
