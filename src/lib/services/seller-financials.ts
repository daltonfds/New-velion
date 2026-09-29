import { supabase } from "@/lib/supabase";

export interface SellerFinancialSummary {
  sales_count: number;
  gross_sales: number;
  commission_earned: number;
  commission_available: number;
  guarantee_retained: number;
  reserved: number;
  available_balance: number;
  total_balance: number;
}

export async function getSellerFinancialSummary(
  vendedorId: string,
  days: number | null = null
): Promise<SellerFinancialSummary> {
  const { data, error } = await supabase.rpc("get_seller_financial_summary", {
    p_vendedor_id: vendedorId,
    p_days: days,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;

  return {
    sales_count: Number(row?.sales_count ?? 0),
    gross_sales: Number(row?.gross_sales ?? 0),
    commission_earned: Number(row?.commission_earned ?? 0),
    commission_available: Number(row?.commission_available ?? 0),
    guarantee_retained: Number(row?.guarantee_retained ?? 0),
    reserved: Number(row?.reserved ?? 0),
    available_balance: Number(row?.available_balance ?? 0),
    total_balance: Number(row?.total_balance ?? 0),
  };
}
