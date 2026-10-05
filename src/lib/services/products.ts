import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("ativo", true)
    .eq("supplier_status", "approved")
    .order("destaque", { ascending: false })
    .order("novo", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Product[];
}
