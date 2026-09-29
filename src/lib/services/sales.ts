import { getSellerFinancialSummary } from "@/lib/services/seller-financials";

export interface SellerSalesSummary {
  totalSales: number;
  totalCommission: number;
}

export async function getSellerSalesSummary(
  vendedorId: string,
  days?: number | null
): Promise<SellerSalesSummary> {
  const summary = await getSellerFinancialSummary(vendedorId, days);

  return {
    totalSales: summary.sales_count,
    totalCommission: summary.commission_earned,
  };
}
