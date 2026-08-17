"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProductStatus(productId: string, status: boolean, reason: string = "") {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("products")
    .update({ 
      is_active: status,
      // Opcional: podemos adicionar uma coluna `rejection_reason` na tabela produtos depois
    })
    .eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }

  // Recarrega a página do admin para mostrar a mudança
  revalidatePath("/dashboard/admin/products");
  return { success: true };
}
