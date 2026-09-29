"use client";

import { useEffect,useMemo,useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { getWalletSummary } from "@/lib/services/wallet";

type Method="bank_transfer"|"mpesa"|"emola";
type Details=Record<string,string>;

interface Withdrawal{id:string;valor_solicitado:number;taxa_percentual:number;taxa_fixa:number;valor_liquido:number;metodo:string;dados_pagamento:Record<string,unknown>|null;status:"solicitado"|"em_processamento"|"pago"|"rejeitado"|"cancelado";prazo_estimado_dias:number;created_at:string;payout_currency?:string|null;exchange_rate?:number|null;valor_convertido?:number|null}
interface WalletSummary{disponivel:number;retido:number;reservado:number;saldo_total:number}

export default function SellerWithdrawalsPage(){
  const [withdrawals,setWithdrawals]=useState<Withdrawal[]>([]);
  const [country,setCountry]=useState("");
  const [configured,setConfigured]=useState<Record<Method,Details|null>>({bank_transfer:null,mpesa:null,emola:null});
  const [wallet,setWallet]=useState<WalletSummary>({disponivel:0,retido:0,reservado:0,saldo_total:0});
  const [amount,setAmount]=useState("");
  const [method,setMethod]=useState<Method>("bank_transfer");
  const [exchangeRate,setExchangeRate]=useState<number|null>(null);
  const [rateLoading,setRateLoading]=useState(false);
  const [loading,setLoading]=useState(true);
  const [submitting,setSubmitting]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");

  async function loadExchangeRate(targetCountry:string){
    if(targetCountry!=="MZ"){setExchangeRate(1);return}
    setRateLoading(true);
    try{
      const response=await fetch("https://api.frankfurter.app/latest?from=ZAR&to=MZN",{cache:"no-store"});
      if(!response.ok)throw new Error("Unable to load the current ZAR to MZN exchange rate.");
      const data=await response.json();
      const rate=Number(data?.rates?.MZN);
      if(!Number.isFinite(rate)||rate<=0)throw new Error("Invalid ZAR to MZN exchange rate.");
      setExchangeRate(rate);
    }catch(e){
      setExchangeRate(null);
      setError(e instanceof Error?e.message:"Unable to load exchange rate.");
    }finally{setRateLoading(false)}
  }

  useEffect(()=>{(async()=>{
    const user=await getCurrentUser();
    if(!user){setError("You must be signed in.");setLoading(false);return}
    const [w,p,s,wd]=await Promise.all([
      getWalletSummary(user.id),
      supabase.from("profiles").select("country_code,pais").eq("id",user.id).single(),
      supabase.from("account_settings").select("payout_methods").eq("user_id",user.id).maybeSingle(),
      supabase.from("withdrawals").select("id,valor_solicitado,taxa_percentual,taxa_fixa,valor_liquido,metodo,dados_pagamento,status,prazo_estimado_dias,created_at,payout_currency,exchange_rate,valor_convertido").eq("vendedor_id",user.id).order("created_at",{ascending:false})
    ]);
    setWallet(w);
    if(p.error)setError(p.error.message);else {
      const detected=String(p.data?.country_code??p.data?.pais??"").toUpperCase();
      setCountry(detected);
      await loadExchangeRate(detected);
    }
    if(s.error)setError(s.error.message);
    else{
      const pm=s.data?.payout_methods??{};
      const next:Record<Method,Details|null>={bank_transfer:null,mpesa:null,emola:null};
      for(const m of ["bank_transfer","mpesa","emola"] as Method[])if(pm[m]?.enabled)next[m]=pm[m];
      setConfigured(next);
      const first=(Object.keys(next) as Method[]).find(m=>next[m]);
      if(first)setMethod(first);
    }
    if(wd.error)setError(wd.error.message);else setWithdrawals((wd.data??[]) as Withdrawal[]);
    setLoading(false);
  })()},[]);

  const numeric=Number(amount)||0;
  const fee=useMemo(()=>numeric*0.05+(numeric>0?10:0),[numeric]);
  const net=Math.max(numeric-fee,0);
  const convertedNet=country==="MZ"&&exchangeRate?net*exchangeRate:net;
  const available=(Object.keys(configured) as Method[]).filter(m=>configured[m]);

  async function requestWithdrawal(){
    setError("");setSuccess("");
    const user=await getCurrentUser();
    if(!user){setError("You must be signed in.");return}
    if(!configured[method]){setError("Configure this payout method in Settings first.");return}
    if(numeric<=0){setError("Enter a valid withdrawal amount.");return}
    if(numeric>wallet.disponivel){setError("The withdrawal amount cannot exceed your available balance.");return}
    const d=configured[method]!;
    setSubmitting(true);
    try{
      const rpcMethod=method==="bank_transfer"?"bank_transfer":"mobile_wallet";
      const payload={
        ...d,
        holder_name:d.holder_name||"",
        provider:method==="mpesa"?"m-pesa":method==="emola"?"e-mola":undefined,
        exchange_rate:country==="MZ"?exchangeRate:1
      };
      const {error}=await supabase.rpc("server_request_withdrawal",{p_user_id:user.id,p_amount:numeric,p_method:rpcMethod,p_data:payload});
      if(error)throw new Error(error.message);
      setSuccess("Withdrawal request submitted successfully.");
      setAmount("");
      const [nw,nwd]=await Promise.all([
        getWalletSummary(user.id),
        supabase.from("withdrawals").select("id,valor_solicitado,taxa_percentual,taxa_fixa,valor_liquido,metodo,dados_pagamento,status,prazo_estimado_dias,created_at,payout_currency,exchange_rate,valor_convertido").eq("vendedor_id",user.id).order("created_at",{ascending:false})
      ]);
      setWallet(nw);if(!nwd.error)setWithdrawals((nwd.data??[]) as Withdrawal[]);
    }catch(e){setError(e instanceof Error?e.message:"Unable to submit withdrawal.")}finally{setSubmitting(false)}
  }

  const money=(v:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(v);
  const mzn=(v:number)=>new Intl.NumberFormat("pt-MZ",{style:"currency",currency:"MZN"}).format(v);
  const methodLabel=(m:string)=>m==="mobile_wallet"?"Mobile Wallet":"Bank Transfer";
  const configuredLabel=(m:Method)=>m==="mpesa"?"M-Pesa":m==="emola"?"e-Mola":"Bank Transfer";
  const status=(s:string)=>s==="pago"?"Paid":s==="em_processamento"?"Processing":s==="rejeitado"?"Rejected":s==="cancelado"?"Cancelled":"Requested";

  return <AppShell area="seller"><div className="space-y-6">
    <div><h1 className="text-2xl font-semibold text-slate-900">Withdrawals</h1><p className="mt-1 text-sm text-slate-500">Request withdrawals using a payout method configured in Settings.</p></div>
    {error&&<Card><div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div></Card>}
    {success&&<Card><div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div></Card>}
    {loading?<Card><div className="py-12 text-center text-sm text-slate-500">Loading withdrawals...</div></Card>:<>
      <div className="grid gap-4 md:grid-cols-3"><Card><p className="text-sm text-slate-500">Available Balance</p><p className="mt-2 text-2xl font-semibold">{money(wallet.disponivel)}</p></Card><Card><p className="text-sm text-slate-500">Balance on Hold</p><p className="mt-2 text-2xl font-semibold">{money(wallet.retido)}</p></Card><Card><p className="text-sm text-slate-500">Total Balance</p><p className="mt-2 text-2xl font-semibold">{money(wallet.saldo_total)}</p></Card></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <Card><h2 className="font-semibold">Request Withdrawal</h2><p className="mt-1 text-sm text-slate-500">Minimum and eligibility requirements are validated by NewVelion.</p>
          <div className="mt-5 space-y-4">
            <input type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"/>
            <div className="rounded-lg bg-slate-50 p-4 text-sm"><div className="flex justify-between"><span>Withdrawal fee</span><b>{money(fee)}</b></div><div className="mt-2 flex justify-between"><span>Estimated net</span><b>{money(net)}</b></div><p className="mt-3 text-xs text-slate-500">Estimated fee: 5% + R10 fixed fee.</p></div>
            {country==="MZ"&&<div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Currency conversion</span>
                <span className="text-xs text-slate-500">{rateLoading?"Updating rate...":exchangeRate?`1 ZAR = ${exchangeRate.toFixed(4)} MZN`:"Rate unavailable"}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Net in ZAR</p>
                  <p className="mt-1 font-semibold">{money(net)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Estimated payout</p>
                  <p className="mt-1 font-semibold">{exchangeRate?mzn(convertedNet):"—"}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">The exchange rate is captured when you submit the withdrawal.</p>
            </div> }
            <div><label className="mb-2 block text-sm font-medium">Payout Method</label><select value={method} onChange={e=>setMethod(e.target.value as Method)} disabled={!available.length} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
              {available.length?available.map(m=><option key={m} value={m}>{configuredLabel(m)}</option>):<option>No payout methods configured</option>}
            </select></div>
            {!available.length&&<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Configure your payout method in <a className="font-semibold underline" href="/dashboard/seller/settings">Settings</a> before requesting a withdrawal.</div>}
            <button onClick={requestWithdrawal} disabled={submitting||numeric<=0||numeric>wallet.disponivel||!available.length||(country==="MZ"&&!exchangeRate)} className="h-11 w-full rounded-lg bg-[#16294F] text-sm font-semibold text-white disabled:opacity-50">{submitting?"Submitting...":"Request Withdrawal"}</button>
          </div>
        </Card>
        <Card><h2 className="font-semibold">Withdrawal History</h2><p className="mt-1 text-sm text-slate-500">Track every withdrawal request.</p>
          {withdrawals.length===0?<div className="mt-5 rounded-lg bg-slate-50 py-12 text-center text-sm text-slate-500">No withdrawal requests yet.</div>:<div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="pb-3">Request</th><th className="pb-3">Amount</th><th className="pb-3">Net</th><th className="pb-3">Payout</th><th className="pb-3">Method</th><th className="pb-3">Status</th><th className="pb-3">Date</th></tr></thead><tbody className="divide-y">{withdrawals.map(w=><tr key={w.id}><td className="py-4 font-medium">{w.id.slice(0,8)}</td><td className="py-4">{money(Number(w.valor_solicitado))}</td><td className="py-4 font-medium">{money(Number(w.valor_liquido))}</td><td className="py-4">{w.payout_currency==="MZN"&&w.valor_convertido!=null?mzn(Number(w.valor_convertido)):money(Number(w.valor_liquido))}</td><td className="py-4">{w.metodo==="mobile_wallet"&&w.dados_pagamento?.provider?String(w.dados_pagamento.provider):methodLabel(w.metodo)}</td><td className="py-4">{status(w.status)}</td><td className="py-4 text-slate-500">{new Date(w.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>}
        </Card>
      </div>
    </>}
  </div></AppShell>
}
