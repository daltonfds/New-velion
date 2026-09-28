import { supabase } from "@/lib/supabase";

export interface SellerSalesSummary {
  totalSales: number;
  totalCommission: number;
}

export async function getSellerSalesSummary(
  vendedorId: string
): Promise<SellerSalesSummary> {
  const { data, error } = await supabase
    .from("sales")
    .select("valor_venda, comissao_vendedor")
    .eq("vendedor_id", vendedorId)
    .eq("status", "paga");

  if (error) {
    throw error;
  }

  return {
    totalSales: data?.length ?? 0,
    totalCommission:
      data?.reduce(
        (total, sale) => total + Number(sale.comissao_vendedor ?? 0),
        0
      ) ?? 0,
  };
}
