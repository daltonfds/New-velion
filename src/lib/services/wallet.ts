import { getSellerFinancialSummary } from "@/lib/services/seller-financials";

export interface WalletSummary {
  disponivel: number;
  retido: number;
  reservado: number;
  saldo_total: number;
  sales_count: number;
  gross_sales: number;
  commission_earned: number;
  commission_available: number;
  guarantee_retained: number;
}

export async function getWalletSummary(
  vendedorId: string
): Promise<WalletSummary> {
  const summary = await getSellerFinancialSummary(vendedorId);

  return {
    disponivel: summary.available_balance,
    retido: summary.guarantee_retained,
    reservado: summary.reserved,
    saldo_total: summary.total_balance,
    sales_count: summary.sales_count,
    gross_sales: summary.gross_sales,
    commission_earned: summary.commission_earned,
    commission_available: summary.commission_available,
    guarantee_retained: summary.guarantee_retained,
  };
}
