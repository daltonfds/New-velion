"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth";
import { getWalletSummary } from "@/lib/services/wallet";
import { supabase } from "@/lib/supabase";
import { notify } from "@/lib/notify";
import { currencyForCountry, formatCurrency } from "@/lib/currency";

type Method = "bank_transfer" | "mpesa" | "emola";

type Details = {
  enabled?: boolean;
  bank?: string;
  account_type?: string;
  account_number?: string;
  branch_code?: string;
  nib?: string;
  phone?: string;
  holder_name?: string;
};

type WalletSummary = {
  disponivel: number;
  retido: number;
  reservado: number;
  saldo_total: number;
};

type Withdrawal = {
  id: string;
  valor_solicitado: number;
  taxa_percentual: number;
  taxa_fixa: number;
  valor_liquido: number;
  metodo: string;
  dados_pagamento: Record<string, unknown> | null;
  status: string;
  prazo_estimado_dias: string | null;
  created_at: string;
  payout_currency: string | null;
  exchange_rate: number | null;
  valor_convertido: number | null;
};

const icons = {
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h12a2.5 2.5 0 0 1 2.5 2.5V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18z" />
      <path d="M3.5 8h15.75A1.75 1.75 0 0 1 21 9.75v4.5A1.75 1.75 0 0 1 19.25 16H16a3 3 0 0 1 0-6h3.25" />
      <circle cx="16" cy="13" r=".7" fill="currentColor" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M5 12h13" />
      <path d="m13 7 5 5-5 5" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="m5 12 4 4L19 6" />
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path d="m3 10 9-5 9 5" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18M2.5 10h19" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M10 6h4M11 18h2" />
    </svg>
  ),
};

export default function SellerWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [country, setCountry] = useState("");
  const [minimumWithdrawal, setMinimumWithdrawal] = useState(100);
  const [walletCurrency] = useState("ZAR");
  const [payoutCurrency, setPayoutCurrency] = useState("MZN");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [rateLoading, setRateLoading] = useState(false);
  const [configured, setConfigured] = useState<Record<Method, Details | null>>({
    bank_transfer: null,
    mpesa: null,
    emola: null,
  });
  const [wallet, setWallet] = useState<WalletSummary>({
    disponivel: 0,
    retido: 0,
    reservado: 0,
    saldo_total: 0,
  });
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Method>("bank_transfer");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();

      if (!user) {
        setError("You must be signed in.");
        setLoading(false);
        return;
      }

      const [w, p, s, wd] = await Promise.all([
        getWalletSummary(user.id),
        supabase
          .from("profiles")
          .select("country_code,pais")
          .eq("id", user.id)
          .single(),
        supabase
          .from("account_settings")
          .select("payout_methods")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("withdrawals")
          .select(
            "id,valor_solicitado,taxa_percentual,taxa_fixa,valor_liquido,metodo,dados_pagamento,status,prazo_estimado_dias,created_at,payout_currency,exchange_rate,valor_convertido"
          )
          .eq("vendedor_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setWallet(w);

      if (p.error) {
        setError(p.error.message);
      } else {
        const detected = String(
          p.data?.country_code ?? p.data?.pais ?? ""
        ).toUpperCase();

        setCountry(detected);
        const localCurrency = currencyForCountry(detected);
        setPayoutCurrency(localCurrency);
        if (localCurrency !== "ZAR") {
          setRateLoading(true);
          try {
            const fx = await fetch(`/api/currency/rate?base=ZAR&quote=${encodeURIComponent(localCurrency)}`).then((r) => r.json());
            if (!Number.isFinite(Number(fx?.rate)) || Number(fx.rate) <= 0) throw new Error("Exchange rate unavailable.");
            setExchangeRate(Number(fx.rate));
          } catch (e) {
            setError(e instanceof Error ? e.message : "Exchange rate unavailable.");
          } finally {
            setRateLoading(false);
          }
        } else {
          setExchangeRate(1);
        }

        const { data: payoutConfig } = await supabase
          .from("payout_methods")
          .select("valor_minimo_saque")
          .eq("pais", detected)
          .maybeSingle();

        const minimum = Number(payoutConfig?.valor_minimo_saque);

        if (Number.isFinite(minimum) && minimum > 0) {
          setMinimumWithdrawal(minimum);
        }

      }

      if (s.error) {
        setError(s.error.message);
      } else {
        const pm = s.data?.payout_methods ?? {};
        const next: Record<Method, Details | null> = {
          bank_transfer: null,
          mpesa: null,
          emola: null,
        };

        for (const m of ["bank_transfer", "mpesa", "emola"] as Method[]) {
          if (pm[m]?.enabled) next[m] = pm[m];
        }

        setConfigured(next);

        const first = (Object.keys(next) as Method[]).find((m) => next[m]);
        if (first) setMethod(first);
      }

      if (wd.error) {
        setError(wd.error.message);
      } else {
        setWithdrawals((wd.data ?? []) as Withdrawal[]);
      }

      setLoading(false);
    })();
  }, []);

  const numeric = Number(amount) || 0;
  const numericZar = numeric;

  const fee = useMemo(
    () => numeric * 0.05 + (numeric > 0 ? 10 : 0),
    [numeric]
  );

  const net = Math.max(numeric - fee, 0);
  const convertedNet = net * exchangeRate;

  const available = (Object.keys(configured) as Method[]).filter(
    (m) => configured[m]
  );

  async function requestWithdrawal() {
    setError("");
    setSuccess("");

    const user = await getCurrentUser();

    if (!user) {
      setError("You must be signed in.");
      return;
    }

    if (!configured[method]) {
      setError("Configure this payout method in Settings first.");
      return;
    }

    if (numeric <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }

    if (numeric < minimumWithdrawal) {
      setError(
        "The minimum withdrawal amount is " +
          money(minimumWithdrawal) +
          "."
      );
      return;
    }

    if (numeric < minimumWithdrawal) {
      setError(
        "The minimum withdrawal amount is " +
          money(minimumWithdrawal) +
          "."
      );
      return;
    }

    if (numericZar > wallet.disponivel) {
      setError("The withdrawal amount cannot exceed your available balance.");
      return;
    }

    const d = configured[method]!;

    setSubmitting(true);

    try {
      const rpcMethod =
        method === "bank_transfer" ? "bank_transfer" : "mobile_wallet";

      const payload = {
        ...d,
        holder_name: d.holder_name || "",
        provider:
          method === "mpesa"
            ? "m-pesa"
            : method === "emola"
              ? "e-mola"
              : undefined,
        exchange_rate: exchangeRate,
      };

      const { error } = await supabase.rpc("server_request_withdrawal", {
        p_user_id: user.id,
        p_amount: numeric,
        p_method: rpcMethod,
        p_data: payload,
      });

      if (error) throw new Error(error.message);

      setSuccess("Withdrawal request submitted successfully.");

      notify.success(
        "Saque solicitado",
        "O seu pedido de saque foi enviado com sucesso."
      );

      setAmount("");

      const [nw, nwd] = await Promise.all([
        getWalletSummary(user.id),
        supabase
          .from("withdrawals")
          .select(
            "id,valor_solicitado,taxa_percentual,taxa_fixa,valor_liquido,metodo,dados_pagamento,status,prazo_estimado_dias,created_at,payout_currency,exchange_rate,valor_convertido"
          )
          .eq("vendedor_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setWallet(nw);

      if (!nwd.error) {
        setWithdrawals((nwd.data ?? []) as Withdrawal[]);
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to submit withdrawal.";

      setError(message);

      notify.error(
        "Falha ao solicitar saque",
        message
      );
    } finally {
      setSubmitting(false);
    }
  }

  const money = (v: number) => formatCurrency(v, walletCurrency);

  const methodLabel = (m: string) =>
    m === "mobile_wallet" ? "Mobile Wallet" : "Bank Transfer";

  const configuredLabel = (m: Method) =>
    m === "mpesa" ? "M-Pesa" : m === "emola" ? "e-Mola" : "Bank Transfer";

  const status = (s: string) =>
    s === "pago"
      ? "Paid"
      : s === "em_processamento"
        ? "Processing"
        : s === "rejeitado"
          ? "Rejected"
          : s === "cancelado"
            ? "Cancelled"
            : "Requested";

  const statusClass = (s: string) =>
    s === "pago"
      ? "bg-emerald-50 text-emerald-700"
      : s === "em_processamento"
        ? "bg-amber-50 text-amber-700"
        : s === "rejeitado" || s === "cancelado"
          ? "bg-red-50 text-red-700"
          : "bg-slate-100 text-slate-600";

  return (
    <AppShell area="seller">
      <div className="min-h-full bg-[#f7f8fa] -m-4 p-4 md:-m-6 md:p-6">
        <div className="mx-auto max-w-[1320px] space-y-6">
          <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Finance
              </p>
              <h1 className="mt-1 text-[27px] font-semibold tracking-tight text-[#0A0440]">
                Withdrawals
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your seller payouts and withdrawal requests.
              </p>
            </div>

            <a
              href="/dashboard/seller/settings"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-[#F7F8FA]"
            >
              Payout settings
              {icons.arrow}
            </a>
          </div>

          {error && (
            <div className="flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                {icons.check}
              </span>
              {success}
            </div>
          )}

          {loading ? (
            <Card>
              <div className="py-16 text-center text-sm text-slate-500">
                Loading withdrawals...
              </div>
            </Card>
          ) : (
            <>
              <div className="grid gap-px overflow-hidden rounded-lg border border-[#E5E7EB] bg-slate-200 md:grid-cols-3">
                <div className="bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-[#0A0440]">
                      {icons.wallet}
                    </span>
                    <span className="text-sm text-slate-500">
                      Available Balance
                    </span>
                  </div>
                  <p className="mt-4 text-[25px] font-semibold tracking-tight text-slate-900">
                    {money(wallet.disponivel)}
                  </p>
                </div>

                <div className="bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                      {icons.clock}
                    </span>
                    <span className="text-sm text-slate-500">
                      Balance on Hold
                    </span>
                  </div>
                  <p className="mt-4 text-[25px] font-semibold tracking-tight text-slate-900">
                    {money(wallet.retido)}
                  </p>
                </div>

                <div className="bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-[#0A0440]">
                      {icons.wallet}
                    </span>
                    <span className="text-sm text-slate-500">
                      Total Balance
                    </span>
                  </div>
                  <p className="mt-4 text-[25px] font-semibold tracking-tight text-slate-900">
                    {money(wallet.saldo_total)}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
                <Card className="overflow-hidden">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="text-base font-semibold text-slate-900">
                      Request Withdrawal
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Minimum and eligibility requirements are validated by
                      Newvelion.
                    </p>
                  </div>

                  <div className="space-y-5 p-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Withdrawal amount
                      </label>

                      <div className="flex h-12 overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-[#0A0440] focus-within:ring-1 focus-within:ring-[#0A0440]">
                        <span className="flex items-center border-r border-[#E5E7EB] bg-[#F7F8FA] px-3 text-sm font-medium text-slate-500">
                          ZAR
                        </span>
                        <input
                          type="number"
                          min={minimumWithdrawal}
                          max={wallet.disponivel}
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder={minimumWithdrawal.toFixed(2)}
                          className="min-w-0 flex-1 px-3 text-sm outline-none"
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Minimum withdrawal: {formatCurrency(minimumWithdrawal, "ZAR")}
                      </p>
                      {walletCurrency !== "ZAR" && <p className="mt-1 text-xs text-slate-400">Reference rate: 1 ZAR = {exchangeRate.toFixed(4)} {walletCurrency}</p>}
                    </div>

                    <div className="rounded-md border border-[#E5E7EB]">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <span className="text-sm text-slate-600">
                          Withdrawal fee
                        </span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(fee, "ZAR")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-slate-600">
                          Estimated net
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(net, "ZAR")}
                        </span>
                      </div>

                      <div className="border-t border-slate-100 bg-[#F7F8FA] px-4 py-3 text-xs text-slate-500">
                        Fee: 5% + R10 fixed fee. The wallet balance and withdrawal amount are always in ZAR.
                      </div>
                    </div>

                    {walletCurrency !== "ZAR" && (
                      <div className="rounded-md border border-[#E5E7EB] bg-white">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                          <span className="text-sm font-semibold text-slate-800">
                            Currency conversion
                          </span>

                          <span className="text-xs font-medium text-slate-500">
                            {rateLoading
                              ? "Updating..."
                              : exchangeRate
                                ? `1 ZAR = ${exchangeRate.toFixed(4)} ${payoutCurrency}`
                                : "Rate unavailable"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 divide-x divide-slate-100">
                          <div className="p-4">
                            <p className="text-xs text-slate-500">
                              Net in ZAR
                            </p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">
                              {formatCurrency(net, "ZAR")}
                            </p>
                          </div>

                          <div className="p-4">
                            <p className="text-xs text-slate-500">
                              Estimated local payout ({payoutCurrency})
                            </p>
                            <p className="mt-1 text-lg font-semibold text-[#0A0440]">
                              {exchangeRate ? formatCurrency(convertedNet, payoutCurrency) : "—"}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                          The exchange rate is captured when you submit the
                          withdrawal.
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Payout method
                      </label>

                      <div className="space-y-2">
                        {available.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMethod(m)}
                            className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition ${
                              method === m
                                ? "border-[#0A0440] bg-[#F7F8FA]"
                                : "border-[#E5E7EB] bg-white hover:border-slate-300"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span className="text-[#0A0440]">
                                {m === "bank_transfer"
                                  ? icons.bank
                                  : icons.phone}
                              </span>

                              <span>
                                <span className="block text-sm font-medium text-slate-800">
                                  {configuredLabel(m)}
                                </span>
                                <span className="block text-xs text-slate-500">
                                  {m === "bank_transfer"
                                    ? "Bank account"
                                    : "Mobile wallet"}
                                </span>
                              </span>
                            </span>

                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                method === m
                                  ? "border-[#0A0440] bg-[#10069F] text-white"
                                  : "border-slate-300"
                              }`}
                            >
                              {method === m && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {!available.length && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Configure your payout method in{" "}
                        <a
                          className="font-semibold underline"
                          href="/dashboard/seller/settings"
                        >
                          Settings
                        </a>{" "}
                        before requesting a withdrawal.
                      </div>
                    )}

                    <button
                      onClick={requestWithdrawal}
                      disabled={
                        submitting ||
                        numeric < minimumWithdrawal ||
                        numericZar > wallet.disponivel ||
                        !available.length ||
                        (walletCurrency !== "ZAR" && (!exchangeRate || rateLoading))
                      }
                      className="h-11 w-full rounded-md bg-[#10069F] px-4 text-sm font-semibold text-white transition hover:bg-[#0B3D8F] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Request Withdrawal"}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                      Funds are sent using your configured payout details.
                    </p>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="text-base font-semibold text-slate-900">
                      Withdrawal History
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Track every withdrawal request.
                    </p>
                  </div>

                  {withdrawals.length === 0 ? (
                    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F7F8FA] text-slate-400">
                        {icons.wallet}
                      </div>
                      <p className="mt-4 text-sm font-medium text-slate-700">
                        No withdrawal requests yet
                      </p>
                      <p className="mt-1 max-w-sm text-sm text-slate-500">
                        Your withdrawal requests will appear here once you
                        submit your first payout.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            <th className="px-6 py-3">Request</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Net</th>
                            <th className="px-4 py-3">Payout</th>
                            <th className="px-4 py-3">Method</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {withdrawals.map((w) => (
                            <tr
                              key={w.id}
                              className="hover:bg-[#F7F8FA]/70"
                            >
                              <td className="px-6 py-4 font-medium text-slate-800">
                                #{w.id.slice(0, 8)}
                              </td>
                              <td className="px-4 py-4 text-slate-700">
                                {formatCurrency(Number(w.valor_solicitado), "ZAR")}
                              </td>
                              <td className="px-4 py-4 font-medium text-slate-800">
                                {formatCurrency(Number(w.valor_liquido), "ZAR")}
                              </td>
                              <td className="px-4 py-4 text-slate-700">
                                {w.payout_currency === walletCurrency &&
                                w.valor_convertido != null
                                  ? formatCurrency(Number(w.valor_convertido), w.payout_currency || payoutCurrency)
                                  : formatCurrency(Number(w.valor_liquido), "ZAR")}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {w.metodo === "mobile_wallet" &&
                                w.dados_pagamento?.provider
                                  ? String(w.dados_pagamento.provider)
                                  : methodLabel(w.metodo)}
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(w.status)}`}
                                >
                                  {status(w.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500">
                                {new Date(w.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
