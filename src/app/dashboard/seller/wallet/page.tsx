"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth";
import { getWalletSummary } from "@/lib/services/wallet";
import { supabase } from "@/lib/supabase";

type WalletEntry = {
  id: string;
  tipo: "comissao" | "garantia_retida" | "garantia_liberada" | "estorno" | "saque";
  valor: number;
  estado: "pendente" | "disponivel" | "retido" | "sacado";
  created_at: string;
  sale_id: string | null;
};

const typeLabels: Record<WalletEntry["tipo"], string> = {
  comissao: "Commission",
  garantia_retida: "Guarantee held",
  garantia_liberada: "Guarantee released",
  estorno: "Refund adjustment",
  saque: "Withdrawal",
};

const stateLabels: Record<WalletEntry["estado"], string> = {
  pendente: "Pending",
  disponivel: "Available",
  retido: "On hold",
  sacado: "Withdrawn",
};

export default function SellerWalletPage() {
  const [wallet, setWallet] = useState({
    disponivel: 0,
    retido: 0,
    reservado: 0,
    saldo_total: 0,
  });
  const [entries, setEntries] = useState<WalletEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    const user = await getCurrentUser();

    if (!user) {
      setError("You must be signed in to view your wallet.");
      setLoading(false);
      return;
    }

    try {
      const [summary, result] = await Promise.all([
        getWalletSummary(user.id),
        supabase
          .from("wallet_entries")
          .select("id, tipo, valor, estado, created_at, sale_id")
          .eq("vendedor_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (result.error) throw result.error;

      setWallet(summary);
      setEntries((result.data ?? []) as WalletEntry[]);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your wallet.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function money(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(value);
  }

  function date(value: string) {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function stateClass(state: WalletEntry["estado"]) {
    if (state === "disponivel") return "bg-emerald-50 text-emerald-700";
    if (state === "retido") return "bg-amber-50 text-amber-700";
    if (state === "sacado") return "bg-slate-100 text-slate-600";
    return "bg-blue-50 text-blue-700";
  }

  return (
    <AppShell
      area="seller"
      title="Wallet"
      subtitle="Manage your balance and wallet activity."
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Wallet</h1>
            <p className="mt-1 text-sm text-slate-500">
              Your NewVelion earnings and balance activity.
            </p>
          </div>

          <Link
            href="/dashboard/seller/withdrawals"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Withdraw funds
          </Link>
        </div>

        {error && (
          <Card className="p-4">
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </Card>
        )}

        {loading ? (
          <Card className="p-10 text-center text-sm text-slate-500">
            Loading wallet...
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Available Balance", wallet.disponivel],
                ["Balance on Hold", wallet.retido],
                ["Reserved", wallet.reservado],
                ["Total Balance", wallet.saldo_total],
              ].map(([label, value]) => (
                <Card key={String(label)} className="p-5">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {money(Number(value))}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    South African Rand (ZAR)
                  </p>
                </Card>
              ))}
            </div>

            <Card className="overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-5">
                <h2 className="font-semibold text-slate-900">
                  Wallet History
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Every ledger movement recorded for your account.
                </p>
              </div>

              {entries.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No wallet activity yet.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Your commissions and balance movements will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr className="text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-3 font-medium">Activity</th>
                        <th className="px-5 py-3 font-medium">Amount</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Date</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-900">
                              {typeLabels[entry.tipo]}
                            </p>

                            {entry.sale_id && (
                              <p className="mt-1 text-xs text-slate-500">
                                Sale: {entry.sale_id.slice(0, 8)}
                              </p>
                            )}
                          </td>

                          <td
                            className={`px-5 py-4 text-sm font-semibold ${
                              entry.valor >= 0
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            {entry.valor > 0 ? "+" : ""}
                            {money(entry.valor)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${stateClass(
                                entry.estado,
                              )}`}
                            >
                              {stateLabels[entry.estado]}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {date(entry.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
