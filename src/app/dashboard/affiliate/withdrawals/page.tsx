"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

type Summary = {
  country_code: string;
  kyc_status: string;
  available_balance: number;
  total_rewards: number;
  reserved_balance: number;
  withdrawn_balance: number;
  fee_percent: number;
  fee_fixed: number;
  minimum_withdrawal: number;
  min_days: number | null;
  max_days: number | null;
  allowed_methods: Record<string, { label?: string }>;
};
type PayoutDetails = { enabled?: boolean; holder_name?: string; bank?: string; account_number?: string; branch_code?: string; phone?: string; provider?: string; [key: string]: unknown };
type Method = "bank_transfer" | "mobile_wallet";
type Withdrawal = { id: string; valor_solicitado: number; taxa_percentual: number; taxa_fixa: number; valor_liquido: number; metodo: string; status: string; created_at: string; payout_currency: string | null; valor_convertido: number | null };

const money = (value: number) => "R" + new Intl.NumberFormat("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);
const currencyForCountry = (country: string) => country === "MZ" ? "MZN" : country === "AO" ? "AOA" : "ZAR";

export default function AffiliateWithdrawalsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [payoutSettings, setPayoutSettings] = useState<Record<string, PayoutDetails>>({});
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Method>("bank_transfer");
  const [provider, setProvider] = useState<"m-pesa" | "e-mola">("m-pesa");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rateLoading, setRateLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Please sign in to manage affiliate withdrawals.");
      setLoading(false);
      return;
    }
    const [summaryResult, settingsResult, withdrawalsResult] = await Promise.all([
      supabase.rpc("get_platform_affiliate_withdrawal_summary"),
      supabase.from("account_settings").select("payout_methods").eq("user_id", user.id).maybeSingle(),
      supabase.from("withdrawals").select("id,valor_solicitado,taxa_percentual,taxa_fixa,valor_liquido,metodo,status,created_at,payout_currency,valor_convertido,withdrawal_source").eq("vendedor_id", user.id).eq("withdrawal_source", "affiliate").order("created_at", { ascending: false }).limit(25),
    ]);
    if (summaryResult.error) setError(summaryResult.error.message);
    else if (summaryResult.data) setSummary(summaryResult.data as Summary);
    if (settingsResult.error) setError((current) => current ? current + " " + settingsResult.error!.message : settingsResult.error!.message);
    else {
      const saved = (settingsResult.data?.payout_methods || {}) as Record<string, PayoutDetails>;
      setPayoutSettings(saved);
      if (!saved.mpesa?.enabled && saved.emola?.enabled) setProvider("e-mola");
    }
    if (withdrawalsResult.error) setError((current) => current ? current + " " + withdrawalsResult.error!.message : withdrawalsResult.error!.message);
    else setWithdrawals((withdrawalsResult.data || []) as Withdrawal[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const country = summary?.country_code || "";
  const payoutCurrency = currencyForCountry(country);
  const configuredMethods = useMemo(() => {
    const allowed = summary?.allowed_methods || {};
    const result: Method[] = [];
    if (allowed.bank_transfer && payoutSettings.bank_transfer?.enabled) result.push("bank_transfer");
    if (allowed.mobile_wallet && (payoutSettings.mpesa?.enabled || payoutSettings.emola?.enabled)) result.push("mobile_wallet");
    return result;
  }, [summary, payoutSettings]);

  useEffect(() => {
    if (configuredMethods.length && !configuredMethods.includes(method)) setMethod(configuredMethods[0]);
  }, [configuredMethods, method]);

  useEffect(() => {
    if (!country || country === "ZA") {
      setExchangeRate(1);
      return;
    }
    let cancelled = false;
    setRateLoading(true);
    fetch("/api/currency/rate?base=ZAR&quote=" + encodeURIComponent(payoutCurrency))
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !Number.isFinite(Number(data?.rate)) || Number(data.rate) <= 0) throw new Error("A live exchange rate is not available for " + payoutCurrency + ".");
        if (!cancelled) setExchangeRate(Number(data.rate));
      })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "Exchange rate unavailable."); })
      .finally(() => { if (!cancelled) setRateLoading(false); });
    return () => { cancelled = true; };
  }, [country, payoutCurrency]);

  const numeric = Math.max(0, Number(amount) || 0);
  const fee = summary ? numeric * Number(summary.fee_percent || 0) / 100 + (numeric > 0 ? Number(summary.fee_fixed || 0) : 0) : 0;
  const net = Math.max(0, numeric - fee);
  const selectedDetails = method === "bank_transfer" ? payoutSettings.bank_transfer : payoutSettings[provider === "m-pesa" ? "mpesa" : "emola"];

  async function requestWithdrawal() {
    setError("");
    setSuccess("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Please sign in first."); return; }
    if (!summary) { setError("Withdrawal settings are unavailable. Please refresh and try again."); return; }
    if (summary.kyc_status !== "approved") { setError("KYC approval is required before requesting a withdrawal."); return; }
    if (!configuredMethods.includes(method)) { setError("Configure an eligible payout method in your account settings first."); return; }
    if (numeric < Number(summary.minimum_withdrawal || 0)) { setError("The minimum withdrawal is " + money(Number(summary.minimum_withdrawal)) + "."); return; }
    if (numeric > Number(summary.available_balance || 0)) { setError("The requested amount exceeds your available affiliate rewards."); return; }
    if (fee >= numeric) { setError("The amount is too small to cover the platform withdrawal fees."); return; }
    if (method === "mobile_wallet" && !(provider === "m-pesa" ? payoutSettings.mpesa?.enabled : payoutSettings.emola?.enabled)) {
      setError("Configure the selected mobile wallet in your payout settings first."); return;
    }
    setSubmitting(true);
    const payload = {
      ...(selectedDetails || {}),
      holder_name: selectedDetails?.holder_name || "",
      provider: method === "mobile_wallet" ? provider : undefined,
      exchange_rate: exchangeRate,
      wallet_type: "affiliate",
    };
    const result = await supabase.rpc("server_request_withdrawal", {
      p_user_id: user.id,
      p_amount: numeric,
      p_method: method,
      p_data: payload,
    });
    setSubmitting(false);
    if (result.error) { setError(result.error.message); return; }
    setSuccess("Your withdrawal request has been submitted for administrator review.");
    setAmount("");
    await load();
  }

  const statusLabel = (status: string) => status === "pago" ? "Paid" : status === "em_processamento" ? "Processing" : status === "rejeitado" ? "Rejected" : status === "cancelado" ? "Cancelled" : "Pending review";
  const statusClass = (status: string) => status === "pago" ? "bg-emerald-50 text-emerald-700" : status === "em_processamento" ? "bg-amber-50 text-amber-700" : status === "rejeitado" || status === "cancelado" ? "bg-red-50 text-red-700" : "bg-blue-50 text-[#003B95]";

  return (
    <AppShell area="affiliate" title="Withdrawals" subtitle="Request payout of your confirmed platform affiliate rewards.">
      <main className="min-h-screen bg-[#F5F8FC]">
        <div className="mx-auto max-w-[1250px] space-y-6 px-5 py-7 lg:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0078E8]">Affiliate finance</p><h1 className="mt-2 text-3xl font-bold text-[#001B44]">Withdrawals</h1><p className="mt-2 text-sm text-slate-600">The same Newvelion withdrawal fees and administrator approval process apply.</p></div>
            <Link href="/dashboard/affiliate" className="text-sm font-semibold text-[#003B95] hover:underline">Back to affiliate dashboard</Link>
          </div>

          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

          {loading ? <Card className="p-10 text-center text-sm text-slate-500">Loading your affiliate balance and payout rules…</Card> : !summary ? <Card className="p-6 text-sm text-slate-600">Could not load affiliate withdrawal settings.</Card> : <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Available rewards", money(Number(summary.available_balance)), "Eligible for a withdrawal request"],
                ["On hold", money(Number(summary.reserved_balance)), "Already requested; awaiting review"],
                ["Paid out", money(Number(summary.withdrawn_balance)), "Previously paid withdrawals"],
                ["Platform fee", Number(summary.fee_percent) + "% + " + money(Number(summary.fee_fixed)), "Same fees configured by Newvelion"],
              ].map(([label, value, note]) => <Card key={String(label)} className="border-[#DCE3EE] bg-white p-5 shadow-none"><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold text-[#001B44]">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></Card>)}
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
              <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
                <h2 className="text-lg font-bold text-[#001B44]">Request a withdrawal</h2>
                <p className="mt-1 text-sm text-slate-500">Country: {country || "Not set"} · Payout currency: {payoutCurrency}</p>
                {summary.kyc_status !== "approved" && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">KYC approval is required before withdrawals can be requested.</div>}
                {!configuredMethods.length && <div className="mt-4 rounded-lg border border-blue-100 bg-[#EAF3FF] p-3 text-sm text-[#003B95]">No eligible payout method is configured for your country. Open account settings and configure a supported method with the KYC-verified account holder name.</div>}
                <div className="mt-5 space-y-4">
                  <label className="block text-sm font-semibold text-[#001B44]">Amount to withdraw (ZAR)
                    <input type="number" min={summary.minimum_withdrawal} max={summary.available_balance} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#0078E8]" placeholder="100.00" />
                  </label>
                  {configuredMethods.length > 0 && <label className="block text-sm font-semibold text-[#001B44]">Payout method
                    <select value={method} onChange={(event) => setMethod(event.target.value as Method)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3">
                      {configuredMethods.map((item) => <option key={item} value={item}>{item === "bank_transfer" ? "Bank transfer / EFT" : "Mobile wallet"}</option>)}
                    </select>
                  </label>}
                  {method === "mobile_wallet" && configuredMethods.includes("mobile_wallet") && <label className="block text-sm font-semibold text-[#001B44]">Wallet provider
                    <select value={provider} onChange={(event) => setProvider(event.target.value as "m-pesa" | "e-mola")} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3">
                      {payoutSettings.mpesa?.enabled && <option value="m-pesa">M-Pesa</option>}
                      {payoutSettings.emola?.enabled && <option value="e-mola">e-Mola</option>}
                    </select>
                  </label>}
                  <div className="rounded-lg bg-[#F8FAFD] p-4 text-sm">
                    <div className="flex justify-between gap-3"><span className="text-slate-500">Withdrawal fee</span><span className="font-semibold text-[#001B44]">{money(fee)}</span></div>
                    <div className="mt-2 flex justify-between gap-3"><span className="text-slate-500">Estimated net amount</span><span className="font-bold text-[#001B44]">{money(net)}</span></div>
                    {country !== "ZA" && <div className="mt-2 flex justify-between gap-3"><span className="text-slate-500">Estimated local payout</span><span className="font-semibold text-[#001B44]">{rateLoading ? "Loading exchange rate…" : new Intl.NumberFormat("en-US",{maximumFractionDigits:2}).format(net * exchangeRate) + " " + payoutCurrency}</span></div>}
                    <p className="mt-3 text-xs leading-5 text-slate-500">Final fees, available balance, country eligibility and payout details are validated by Newvelion before the request is recorded.</p>
                  </div>
                  <button type="button" disabled={submitting || rateLoading || !configuredMethods.length || summary.kyc_status !== "approved" || numeric <= 0} onClick={() => void requestWithdrawal()} className="w-full rounded-lg bg-[#003B95] px-4 py-3 font-semibold text-white hover:bg-[#002B70] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Submitting request…" : "Request withdrawal"}</button>
                  <Link href="/dashboard/profile" className="block text-center text-sm font-semibold text-[#003B95] hover:underline">Manage profile and payout settings</Link>
                </div>
              </Card>

              <Card className="overflow-hidden border-[#DCE3EE] bg-white p-0 shadow-none">
                <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-[#001B44]">Withdrawal history</h2><p className="mt-1 text-xs text-slate-500">All requests are reviewed by the Newvelion administrator.</p></div>
                {!withdrawals.length ? <div className="px-5 py-12 text-center text-sm text-slate-500">No withdrawal requests yet.</div> : <div className="divide-y divide-slate-100">{withdrawals.map((item) => <div key={item.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-[#001B44]">{money(Number(item.valor_solicitado))} · {item.metodo === "mobile_wallet" ? "Mobile wallet" : "Bank transfer"}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()} · Net {money(Number(item.valor_liquido))}</p>{item.valor_convertido != null && item.payout_currency && item.payout_currency !== "ZAR" && <p className="mt-1 text-xs text-slate-500">Estimated payout: {Number(item.valor_convertido).toLocaleString(undefined,{maximumFractionDigits:2})} {item.payout_currency}</p>}</div><span className={"w-fit rounded-full px-3 py-1 text-xs font-semibold " + statusClass(item.status)}>{statusLabel(item.status)}</span></div>)}</div>}
              </Card>
            </div>
          </>}
        </div>
      </main>
    </AppShell>
  );
}
