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
    disponivel: Number(summary.available_balance),
    retido: Number(summary.guarantee_retained),
    reservado: Number(summary.reserved),
    saldo_total: Number(summary.total_balance),
    sales_count: Number(summary.sales_count),
    gross_sales: Number(summary.gross_sales),
    commission_earned: Number(summary.commission_earned),
    commission_available: Number(summary.commission_available),
    guarantee_retained: Number(summary.guarantee_retained),
  };
}
