"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth";
import { supplierFetch } from "@/lib/supplier-client";
import { supabase } from "@/lib/supabase";

type Method = "bank_transfer" | "alipay" | "wechat_pay" | "unionpay" | "ecny";
type Details = { enabled?: boolean; [key: string]: unknown };

const labels: Record<Method,string> = {
  bank_transfer: "Bank transfer / EFT",
  alipay: "Alipay",
  wechat_pay: "WeChat Pay",
  unionpay: "UnionPay",
  ecny: "e-CNY",
};

export default function SupplierWithdrawalsPage() {
  const [wallet, setWallet] = useState({ disponivel: 0, retido: 0, saldo_total: 0 });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("ZAR");
  const [minimum, setMinimum] = useState(100);
  const [methods, setMethods] = useState<Record<Method, Details | null>>({ bank_transfer: null, alipay: null, wechat_pay: null, unionpay: null, ecny: null });
  const [method, setMethod] = useState<Method>("bank_transfer");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const user = await getCurrentUser();
    if (!user) throw new Error("You must be signed in.");
    const [financeResult, profileResult, settingsResult] = await Promise.all([
      supplierFetch<{ data: { available: number; retained: number; total: number; withdrawals: any[] } }>("/api/supplier/finance"),
      supplierFetch<{ data: { country_code?: string; kyc_status?: string } }>("/api/supplier/profile"),
      supabase.from("account_settings").select("payout_methods").eq("user_id", user.id).maybeSingle(),
    ]);
    if (settingsResult.error) throw new Error(settingsResult.error.message);
    const cc = String(profileResult.data.country_code ?? "").toUpperCase();
    if (cc !== "ZA" && cc !== "CN") throw new Error("Supplier country must be South Africa or China.");
    setWallet({ disponivel: financeResult.data.available, retido: financeResult.data.retained, saldo_total: financeResult.data.total });
    setWithdrawals(financeResult.data.withdrawals ?? []);
    setCountry(cc);
    setCurrency(cc === "CN" ? "CNY" : "ZAR");
    const saved = (settingsResult.data?.payout_methods ?? {}) as Record<string, Details>;
    const next = { bank_transfer: saved.bank_transfer?.enabled === true ? saved.bank_transfer : null, alipay: saved.alipay?.enabled === true ? saved.alipay : null, wechat_pay: saved.wechat_pay?.enabled === true ? saved.wechat_pay : null, unionpay: saved.unionpay?.enabled === true ? saved.unionpay : null, ecny: saved.ecny?.enabled === true ? saved.ecny : null };
    setMethods(next);
    if (profileResult.data.kyc_status !== "approved") setMessage("KYC approval is required before you can withdraw.");
    const { data: payoutConfig } = await supabase.from("payout_methods").select("valor_minimo_saque").eq("pais", cc).maybeSingle();
    if (payoutConfig?.valor_minimo_saque != null) setMinimum(Number(payoutConfig.valor_minimo_saque));
    const first = (Object.keys(next) as Method[]).find((key) => next[key]);
    if (first) setMethod(first);
    setLoading(false);
  }

  useEffect(() => { load().catch((e) => { setMessage(e instanceof Error ? e.message : "Failed to load."); setLoading(false); }); }, []);

  async function request() {
    setMessage("");
    const value = Number(amount);
    const details = methods[method];
    if (!details) return setMessage("Configure this payout method in Settings first.");
    if (!Number.isFinite(value) || value < minimum) return setMessage(`Minimum withdrawal is ${minimum} ${currency}.`);
    if (value > wallet.disponivel) return setMessage("The withdrawal amount exceeds your available balance.");
    setBusy(true);
    try {
      await supplierFetch("/api/supplier/withdrawals", { method: "POST", body: JSON.stringify({ amount: value, method, data: details }) });
      setAmount("");
      setMessage("Withdrawal request submitted.");
      await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to request withdrawal."); }
    finally { setBusy(false); }
  }

  const availableMethods = useMemo(() => (Object.keys(methods) as Method[]).filter((m) => methods[m]), [methods]);

  return (
    <AppShell area="supplier">
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#10069F]">Supplier finance</p><h1 className="mt-1 text-3xl font-bold text-[#0A0440]">Withdrawals</h1><p className="mt-1 text-sm text-slate-500">{country === "CN" ? "China · CNY" : country === "ZA" ? "South Africa · ZAR" : "Supplier payout account"}</p></div>
          <Link href="/dashboard/supplier/settings" className="text-sm font-semibold text-[#10069F]">Payout settings →</Link>
        </div>
        {message && <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5"><p className="text-sm text-slate-500">Available</p><p className="mt-2 text-2xl font-bold text-slate-900">{wallet.disponivel.toLocaleString()} {currency}</p></Card>
          <Card className="p-5"><p className="text-sm text-slate-500">On hold</p><p className="mt-2 text-2xl font-bold text-slate-900">{wallet.retido.toLocaleString()} {currency}</p></Card>
          <Card className="p-5"><p className="text-sm text-slate-500">Total</p><p className="mt-2 text-2xl font-bold text-[#0A0440]">{wallet.saldo_total.toLocaleString()} {currency}</p></Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="p-6">
            <h2 className="font-semibold text-slate-900">Request withdrawal</h2>
            <p className="mt-1 text-sm text-slate-500">Minimum: {minimum.toLocaleString()} {currency}</p>
            <div className="mt-5 space-y-4">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={minimum} max={wallet.disponivel} placeholder={String(minimum)} className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500" />
              <div className="space-y-2">{availableMethods.map((m) => <button key={m} type="button" onClick={() => setMethod(m)} className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm ${method === m ? "border-blue-600 bg-blue-50" : "border-[#E5E7EB] bg-white"}`}><span className="font-medium text-slate-800">{labels[m]}</span><span className={method === m ? "text-[#10069F]" : "text-slate-400"}>{method === m ? "Selected" : "Select"}</span></button>)}</div>
              {!availableMethods.length && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Configure a payout method in Settings before requesting a withdrawal.</p>}
              <button disabled={busy || loading || !availableMethods.length} onClick={request} className="h-11 w-full rounded-lg bg-[#10069F] px-4 text-sm font-semibold text-white hover:bg-[#0B3D8F] disabled:opacity-50">{busy ? "Submitting..." : "Request withdrawal"}</button>
            </div>
          </Card>
          <Card className="overflow-hidden p-0"><div className="border-b border-slate-100 px-6 py-5"><h2 className="font-semibold text-slate-900">History</h2></div>{withdrawals.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No withdrawal requests yet.</div> : <div className="divide-y divide-slate-100">{withdrawals.map((w) => <div key={w.id} className="flex items-center justify-between gap-4 px-6 py-4"><div><p className="font-medium text-slate-800">#{w.id.slice(0,8)}</p><p className="text-xs text-slate-500">{new Date(w.created_at).toLocaleDateString()} · {w.metodo}</p></div><div className="text-right"><p className="font-semibold text-slate-900">{Number(w.valor_liquido).toLocaleString()} {currency}</p><p className="text-xs text-slate-500">{w.status}</p></div></div>)}</div>}</Card>
        </div>
      </div>
    </AppShell>
  );
}
