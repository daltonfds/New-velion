import { getSellerFinancialSummary } from "@/lib/services/seller-financials";

export interface WalletSummary {
  disponivel: number;
  retido: number;
  reservado: number;
  saldo_total: number;
}

export async function getWalletSummary(
  vendedorId: string
): Promise<WalletSummary> {
  const summary = await getSellerFinancialSummary(vendedorId);

  return {
    disponivel: summary.commission_available,
    retido: summary.guarantee_retained,
    reservado: summary.reserved,
    saldo_total: summary.total_balance,
  };
}
