import { requireSupplier } from "@/lib/supplier-auth";

export async function GET(request: Request) {
  const auth = await requireSupplier(request);
  if (!auth.ok) return Response.json({ error: auth.message }, { status: auth.status });

  const [{ data: entries, error: entriesError }, { data: withdrawals, error: withdrawalsError }] =
    await Promise.all([
      auth.client
        .from("wallet_entries")
        .select("id,sale_id,tipo,valor,estado,created_at,withdrawal_id,currency")
        .eq("vendedor_id", auth.userId)
        .order("created_at", { ascending: false }),
      auth.client
        .from("withdrawals")
        .select("id,valor_solicitado,taxa_percentual,taxa_fixa,valor_liquido,metodo,dados_pagamento,status,prazo_estimado_dias,created_at,payout_currency,exchange_rate,valor_convertido")
        .eq("vendedor_id", auth.userId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  if (entriesError) return Response.json({ error: entriesError.message }, { status: 500 });
  if (withdrawalsError) return Response.json({ error: withdrawalsError.message }, { status: 500 });

  const rows = entries ?? [];
  const currency = rows.find((e) => e.currency)?.currency ?? "ZAR";
  const available = rows
    .filter((e) => e.estado === "disponivel" && ["supplier_earning", "estorno", "garantia_liberada"].includes(e.tipo))
    .reduce((sum, e) => sum + Number(e.valor || 0), 0);
  const retained = rows
    .filter((e) => e.estado === "retido" && e.tipo === "supplier_earning")
    .reduce((sum, e) => sum + Number(e.valor || 0), 0);
  const reserved = rows
    .filter((e) => e.tipo === "saque" && ["solicitado", "em_processamento"].includes((withdrawals ?? []).find((w) => w.id === e.withdrawal_id)?.status ?? ""))
    .reduce((sum, e) => sum + Math.abs(Number(e.valor || 0)), 0);
  const withdrawn = rows
    .filter((e) => e.tipo === "saque" && (withdrawals ?? []).find((w) => w.id === e.withdrawal_id)?.status === "pago")
    .reduce((sum, e) => sum + Math.abs(Number(e.valor || 0)), 0);

  return Response.json({
    data: {
      available: Math.max(available - reserved - withdrawn, 0),
      retained: Math.max(retained, 0),
      total: Math.max(available - reserved - withdrawn, 0) + Math.max(retained, 0),
      currency,
      withdrawals: withdrawals ?? [],
    },
  });
}
