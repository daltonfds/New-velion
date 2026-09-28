import { supabase } from "@/lib/supabase";

export interface WalletSummary {
  disponivel: number;
  retido: number;
  reservado: number;
  saldo_total: number;
}

export async function getWalletSummary(
  vendedorId: string
): Promise<WalletSummary> {
  const { data, error } = await supabase.rpc("get_wallet_summary", {
    p_vendedor_id: vendedorId,
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;

  return {
    disponivel: Number(row?.disponivel ?? 0),
    retido: Number(row?.retido ?? 0),
    reservado: Number(row?.reservado ?? 0),
    saldo_total: Number(row?.saldo_total ?? 0),
  };
}
