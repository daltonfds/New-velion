"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const supabase = createServerClient();

  // 1. Pegar dados do formulário
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const imageFile = formData.get("image") as File;

  // 2. Fazer upload da imagem para o Supabase Storage
  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile);

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }
  }

  // 3. Inserir o produto na tabela `products`
  const { error } = await supabase.from("products").insert({
    name,
    description,
    price,
    category,
    images: imageUrl ? [imageUrl] : [],
    is_active: false, // Produto começa como inativo (aguardando aprovação do Admin)
  });

  if (error) {
    throw new Error(error.message);
  }

  // 4. Atualizar a página de produtos para mostrar o novo item
  revalidatePath("/dashboard/seller/products");
  return { success: true };
}
