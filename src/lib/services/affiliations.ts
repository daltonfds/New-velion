import { supabase } from "@/lib/supabase";

export interface CreateAffiliationResult {
  affiliation: {
    id: string;
    vendedor_id: string;
    product_id: string;
    link_unico: string;
    ativo: boolean;
    created_at: string;
  };
  affiliate_link: string;
  created: boolean;
}

export async function createAffiliation(
  productId: string,
): Promise<CreateAffiliationResult> {
  const { data, error } = await supabase.functions.invoke(
    "create-affiliation",
    {
      body: {
        product_id: productId,
      },
    },
  );

  if (error) {
    throw new Error(error.message || "Failed to create affiliation");
  }

  if (!data?.affiliate_link) {
    throw new Error(data?.error || "Affiliate link was not returned");
  }

  return data as CreateAffiliationResult;
}
