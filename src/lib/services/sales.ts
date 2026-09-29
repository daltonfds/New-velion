import { getSellerFinancialSummary } from "@/lib/services/seller-financials";

export interface SellerSalesSummary {
  totalSales: number;
  totalCommission: number;
  grossSales: number;
  commissionAvailable: number;
  guaranteeRetained: number;
}

export async function getSellerSalesSummary(
  vendedorId: string
): Promise<SellerSalesSummary> {
  const summary = await getSellerFinancialSummary(vendedorId);

  return {
    totalSales: summary.sales_count,
    totalCommission: summary.commission_earned,
    grossSales: summary.gross_sales,
    commissionAvailable: summary.commission_available,
    guaranteeRetained: summary.guarantee_retained,
  };
}
