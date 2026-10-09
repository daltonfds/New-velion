"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth";
import { getWalletSummary } from "@/lib/services/wallet";
import { supabase } from "@/lib/supabase";
import { currencyForCountry, formatCurrency } from "@/lib/currency";

type Entry = {
  id: string;
  tipo: "comissao" | "garantia_retida" | "garantia_liberada" | "estorno" | "saque";
  valor: number;
  estado: "pendente" | "disponivel" | "retido" | "sacado";
  created_at: string;
  sale_id: string | null;
};

const labels: Record<Entry["tipo"], string> = {
  comissao: "Commission",
  garantia_retida: "Guarantee held",
  garantia_liberada: "Guarantee released",
  estorno: "Refund adjustment",
  saque: "Withdrawal",
};

const states: Record<Entry["estado"], string> = {
  pendente: "Pending",
  disponivel: "Available",
  retido: "On hold",
  sacado: "Withdrawn",
};

function Icon({ type }: { type?: Entry["tipo"] }) {
  const p = {
    width: 19,
    height: 19,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "saque")
    return (
      <svg {...p}>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    );

  if (type === "estorno")
    return (
      <svg {...p}>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v6h6" />
      </svg>
    );

  if (type === "garantia_retida" || type === "garantia_liberada")
    return (
      <svg {...p}>
        <rect x="4" y="6" width="16" height="13" rx="2" />
        <path d="M8 6V4h8v2" />
      </svg>
    );

  return (
    <svg {...p}>
      <path d="M12 3v18" />
      <path d="M17 8c-.8-1.3-2.5-2-4.7-2-2.8 0-4.8 1.2-4.8 3s2 2.8 4.8 3.2c2.7.4 4.7 1.1 4.7 3.1s-2 3.3-4.8 3.3c-2.2 0-4-.8-4.9-2" />
    </svg>
  );
}

export default function SellerWalletPage() {
  const [wallet, setWallet] = useState({
    disponivel: 0,
    retido: 0,
    reservado: 0,
    saldo_total: 0,
  });

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<"30" | "90" | "all">("30");
  const [country, setCountry] = useState("ZA");
  const [walletCurrency] = useState("ZAR");
  const [localCurrency, setLocalCurrency] = useState("ZAR");
  const [exchangeRate, setExchangeRate] = useState(1);

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
      const [summary, result, profile] = await Promise.all([
        getWalletSummary(user.id),
        supabase
          .from("wallet_entries_canonical")
          .select("id,tipo,valor,estado,created_at,sale_id")
          .eq("vendedor_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("country_code,pais,wallet_currency").eq("id", user.id).single(),
      ]);

      if (result.error) throw result.error;

      setWallet(summary);
      setEntries((result.data ?? []) as Entry[]);
      const detected = String(profile.data?.country_code ?? profile.data?.pais ?? "ZA").toUpperCase();
      const localCurrencyCode = currencyForCountry(detected);
      setCountry(detected);
      setLocalCurrency(localCurrencyCode);
      if (localCurrencyCode !== "ZAR") {
        const fx = await fetch(`/api/currency/rate?base=ZAR&quote=${encodeURIComponent(localCurrencyCode)}`).then((r) => r.json());
        if (Number.isFinite(Number(fx?.rate)) && Number(fx.rate) > 0) setExchangeRate(Number(fx.rate));
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load your wallet.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const money = (value: number) => formatCurrency(value, "ZAR");
  const localMoney = (value: number) => formatCurrency(value * exchangeRate, localCurrency);

  const date = (value: string) =>
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  const filtered = useMemo(() => {
    if (period === "all") return entries;

    return entries.filter(
      (entry) =>
        Date.now() - new Date(entry.created_at).getTime() <=
        Number(period) * 86400000,
    );
  }, [entries, period]);

  const chart = useMemo(() => {
    const now = new Date();

    const months = Array.from({ length: 6 }, (_, index) => {
      const d = new Date(
        now.getFullYear(),
        now.getMonth() - 5 + index,
        1,
      );

      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-US", { month: "short" }),
        value: 0,
      };
    });

    filtered.forEach((entry) => {
      const d = new Date(entry.created_at);

      const month = months.find(
        (item) =>
          item.key === `${d.getFullYear()}-${d.getMonth()}`,
      );

      if (month) month.value += Number(entry.valor);
    });

    return {
      months,
      max: Math.max(
        ...months.map((month) => Math.abs(month.value)),
        1,
      ),
      inflow: filtered
        .filter((entry) => entry.valor > 0)
        .reduce((sum, entry) => sum + Number(entry.valor), 0),
      outflow: Math.abs(
        filtered
          .filter((entry) => entry.valor < 0)
          .reduce((sum, entry) => sum + Number(entry.valor), 0),
      ),
    };
  }, [filtered]);

  const badge = (state: Entry["estado"]) => {
    if (state === "disponivel")
      return "border-emerald-100 bg-[#EAF7F0] text-[#18794E]";

    if (state === "retido")
      return "border-amber-100 bg-amber-50 text-amber-700";

    if (state === "sacado")
      return "border-[#DCE3EE] bg-[#EEF3F9] text-[#60708A]";

    return "border-blue-100 bg-[#EDF4FF] text-[#245EA8]";
  };

  return (
    <AppShell
      area="seller"
      title="Wallet"
      subtitle="Manage your balance and wallet activity."
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Finance
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0A0440]">
              Wallet
            </h1>

            <p className="mt-1 text-sm text-[#7C8798]">
              Manage earnings, available funds and every balance movement in
              one place.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/dashboard/seller/withdrawals"
              className="inline-flex h-10 items-center rounded-lg border border-[#DCE3EE] bg-white px-4 text-sm font-semibold text-[#405579] hover:bg-[#F5F8FC]"
            >
              Withdrawal history
            </Link>

            <Link
              href="/dashboard/seller/withdrawals"
              className="inline-flex h-10 items-center rounded-lg bg-[#10069F] px-4 text-sm font-semibold text-white hover:bg-[#0B3D8F]"
            >
              Withdraw funds
            </Link>
          </div>
        </div>

        {error && (
          <Card className="p-4">
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </Card>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Card
                key={item}
                className="h-32 animate-pulse bg-[#F5F8FC]"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [
                  "Available Balance",
                  wallet.disponivel,
                  "Ready to withdraw",
                ],
                [
                  "Balance on Hold",
                  wallet.retido,
                  "Awaiting release",
                ],
                [
                  "Reserved",
                  wallet.reservado,
                  "Reserved funds",
                ],
                [
                  "Total Balance",
                  wallet.saldo_total,
                  "Current wallet position",
                ],
              ].map(([label, value, hint]) => (
                <Card key={String(label)} className="p-5">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {label}
                      </p>

                      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0A0440]">
                        {money(Number(value))}
                      </p>
                      {localCurrency !== "ZAR" && <p className="mt-1 text-xs font-medium text-slate-500">≈ {localMoney(Number(value))}</p>}
                    </div>

                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DCE3EE] bg-[#F5F8FC] text-[#60708A]">
                      <Icon />
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    {hint}
                  </p>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#DCE3EE] px-5 py-5">
                  <div>
                    <h2 className="font-semibold text-[#0A0440]">
                      Wallet performance
                    </h2>

                    <p className="mt-1 text-sm text-[#7C8798]">
                      Actual ledger movements across the last six months.
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-100 bg-[#EAF7F0] px-3 py-1.5 text-xs font-semibold text-[#18794E]">
                    Live data
                  </span>
                </div>

                <div className="px-5 pb-5 pt-7">
                  <div className="flex h-56 items-end gap-3 sm:gap-5">
                    {chart.months.map((month) => {
                      const height = Math.max(
                        7,
                        Math.round(
                          (Math.abs(month.value) / chart.max) * 100,
                        ),
                      );

                      return (
                        <div
                          key={month.key}
                          className="flex h-full flex-1 flex-col justify-end"
                        >
                          <div className="group relative flex h-full items-end">
                            <span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#10069F] px-2 py-1 text-[10px] font-semibold text-white group-hover:block">
                              {money(month.value)}{localCurrency !== "ZAR" ? ` · ${localMoney(month.value)}` : ""}
                            </span>

                            <div
                              className="w-full rounded-t-md bg-[#10069F] transition hover:bg-[#0B3D8F]"
                              style={{ height: `${height}%` }}
                            />
                          </div>

                          <p className="mt-3 text-center text-xs font-medium text-slate-400">
                            {month.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex justify-between">
                  <div>
                    <h2 className="font-semibold text-[#0A0440]">
                      Balance position
                    </h2>

                    <p className="mt-1 text-sm text-[#7C8798]">
                      How your current funds are allocated.
                    </p>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DCE3EE] bg-[#F5F8FC] text-[#60708A]">
                    <Icon />
                  </span>
                </div>

                <div className="mt-7">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7C8798]">
                      Available balance
                    </span>

                    <span className="font-semibold text-[#0A0440]">
                      {wallet.saldo_total
                        ? Math.round(
                            (wallet.disponivel / wallet.saldo_total) * 100,
                          )
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="mt-2 h-2 rounded-full bg-[#EEF3F9]">
                    <div
                      className="h-full rounded-full bg-[#EAF7F0]0"
                      style={{
                        width: `${
                          wallet.saldo_total
                            ? Math.min(
                                (wallet.disponivel /
                                  wallet.saldo_total) *
                                  100,
                                100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#7C8798]">Available</span>
                      <b>{money(wallet.disponivel)}{localCurrency !== "ZAR" && <small className="ml-2 block font-normal text-slate-500">≈ {localMoney(wallet.disponivel)}</small>}</b>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#7C8798]">On hold</span>
                      <b>{money(wallet.retido)}{localCurrency !== "ZAR" && <small className="ml-2 block font-normal text-slate-500">≈ {localMoney(wallet.retido)}</small>}</b>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#7C8798]">Reserved</span>
                      <b>{money(wallet.reservado)}{localCurrency !== "ZAR" && <small className="ml-2 block font-normal text-slate-500">≈ {localMoney(wallet.reservado)}</small>}</b>
                    </div>

                    <div className="flex justify-between border-t border-[#E9EEF5] pt-3">
                      <span className="font-medium text-[#405579]">
                        Total
                      </span>
                      <b>{money(wallet.saldo_total)}{localCurrency !== "ZAR" && <small className="ml-2 block font-normal text-slate-500">≈ {localMoney(wallet.saldo_total)}</small>}</b>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total inflow
                </p>

                <p className="mt-2 text-xl font-semibold text-[#18794E]">
                  {money(chart.inflow)}{localCurrency !== "ZAR" && <p className="mt-1 text-sm text-slate-500">≈ {localMoney(chart.inflow)}</p>}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Positive movements recorded in the ledger
                </p>
              </Card>

              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total outflow
                </p>

                <p className="mt-2 text-xl font-semibold text-[#0A0440]">
                  {money(chart.outflow)}{localCurrency !== "ZAR" && <p className="mt-1 text-sm text-slate-500">≈ {localMoney(chart.outflow)}</p>}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Withdrawals and negative adjustments
                </p>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <div className="flex flex-col justify-between gap-4 border-b border-[#DCE3EE] px-5 py-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-semibold text-[#0A0440]">
                    Wallet history
                  </h2>

                  <p className="mt-1 text-sm text-[#7C8798]">
                    Every ledger movement recorded for your account.
                  </p>
                </div>

                <div className="flex rounded-lg border border-[#DCE3EE] bg-[#F5F8FC] p-1">
                  {(
                    [
                      ["30", "30 days"],
                      ["90", "90 days"],
                      ["all", "All time"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setPeriod(value)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                        period === value
                          ? "bg-white text-[#0A0440] shadow-sm"
                          : "text-[#7C8798]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[10px] border border-[#DCE3EE] bg-[#F5F8FC] text-[#7C8798]">
                    <Icon />
                  </span>

                  <p className="mt-4 text-sm font-semibold text-[#233B63]">
                    No wallet activity yet
                  </p>

                  <p className="mt-1 text-sm text-[#7C8798]">
                    Your commissions, withdrawals and balance movements will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="border-b border-[#DCE3EE] bg-[#F5F8FC]">
                      <tr className="text-[11px] uppercase tracking-wider text-[#7C8798]">
                        <th className="px-5 py-3">Activity</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Reference</th>
                        <th className="px-5 py-3">Date</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filtered.map((entry) => (
                        <tr
                          key={entry.id}
                          className="hover:bg-[#F5F8FC]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE3EE] bg-white text-[#60708A]">
                                <Icon type={entry.tipo} />
                              </span>

                              <span className="font-medium text-[#0A0440]">
                                {labels[entry.tipo]}
                              </span>
                            </div>
                          </td>

                          <td
                            className={`px-5 py-4 text-sm font-semibold ${
                              entry.valor >= 0
                                ? "text-[#18794E]"
                                : "text-[#0A0440]"
                            }`}
                          >
                            {entry.valor > 0 ? "+" : ""}
                            {money(entry.valor)}{localCurrency !== "ZAR" && <small className="ml-2 block font-normal text-slate-500">≈ {localMoney(entry.valor)}</small>}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badge(
                                entry.estado,
                              )}`}
                            >
                              {states[entry.estado]}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-xs text-[#7C8798]">
                            {entry.sale_id
                              ? `Sale #${entry.sale_id.slice(0, 8)}`
                              : "Wallet ledger"}
                          </td>

                          <td className="px-5 py-4 text-sm text-[#7C8798]">
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
