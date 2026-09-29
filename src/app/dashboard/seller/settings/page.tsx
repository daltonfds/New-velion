"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

type Method = "bank_transfer"|"mpesa"|"emola";
type Details = Record<string,string>;

const emptyDetails:Record<Method,Details>={
  bank_transfer:{bank:"",account_number:"",branch_code:"",nib:"",holder_name:""},
  mpesa:{phone:"",holder_name:""},
  emola:{phone:"",holder_name:""}
};

export default function SellerSettingsPage(){
  const [country,setCountry]=useState("");
  const [methods,setMethods]=useState<Record<Method,boolean>>({bank_transfer:false,mpesa:false,emola:false});
  const [details,setDetails]=useState(emptyDetails);
  const [emailNotifications,setEmailNotifications]=useState(true);
  const [salesNotifications,setSalesNotifications]=useState(true);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{(async()=>{
    const user=await getCurrentUser();
    if(!user){setError("You must be signed in.");setLoading(false);return}
    const [profile,settings]=await Promise.all([
      supabase.from("profiles").select("country_code,pais,full_name,nome_completo").eq("id",user.id).single(),
      supabase.from("account_settings").select("*").eq("user_id",user.id).maybeSingle()
    ]);
    if(profile.error){setError(profile.error.message);setLoading(false);return}
    const cc=String(profile.data?.country_code??profile.data?.pais??"").toUpperCase();
    setCountry(cc);
    if(settings.error){setError(settings.error.message);setLoading(false);return}
    if(settings.data){
      setEmailNotifications(settings.data.email_notifications??true);
      setSalesNotifications(settings.data.sales_notifications??true);
      const saved=settings.data.payout_methods??{};
      const next={...emptyDetails} as Record<Method,Details>;
      const enabled={bank_transfer:false,mpesa:false,emola:false};
      for(const m of ["bank_transfer","mpesa","emola"] as Method[]){
        if(saved[m]){enabled[m]=saved[m].enabled===true;next[m]={...next[m],...saved[m]}}
      }
      setMethods(enabled);setDetails(next);
    }
    setLoading(false);
  })()},[]);

  const setDetail=(m:Method,k:string,v:string)=>setDetails(d=>({...d,[m]:{...d[m],[k]:v}}));

  async function save(){
    setSaving(true);setError("");setMessage("");
    const user=await getCurrentUser();
    if(!user){setError("You must be signed in.");setSaving(false);return}
    const payoutMethods:Record<string,unknown>={};
    for(const m of ["bank_transfer","mpesa","emola"] as Method[]){
      if(methods[m]) payoutMethods[m]={enabled:true,...details[m]};
    }
    const {error}=await supabase.from("account_settings").upsert({
      user_id:user.id,
      email_notifications:emailNotifications,
      sales_notifications:salesNotifications,
      payout_methods:payoutMethods,
      updated_at:new Date().toISOString()
    },{onConflict:"user_id"});
    if(error){setError(error.message);setSaving(false);return}
    setMessage("Settings saved successfully.");
    setSaving(false);
  }

  const showMZ=country==="MZ";
  return <AppShell area="seller" title="Settings" subtitle="Manage your account and payout preferences.">
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/dashboard/profile" className="text-sm text-slate-500 hover:text-[#16294F]">← Account</Link>
      <div><h2 className="mt-3 text-2xl font-bold text-[#16294F]">Settings</h2><p className="mt-1 text-sm text-slate-500">Payout methods and account preferences are stored securely in NewVelion.</p></div>
      {error&&<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {loading?<div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading settings...</div>:<>
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-5"><h3 className="font-semibold text-slate-900">Payout methods</h3><p className="mt-1 text-sm text-slate-500">Configure your payout account here. Withdrawals will only show configured methods.</p></div>
          <div className="space-y-5 p-6">
            <label className="flex items-center gap-3"><input type="checkbox" checked={methods.bank_transfer} onChange={e=>setMethods(m=>({...m,bank_transfer:e.target.checked}))}/><span className="font-medium">Bank Transfer</span></label>
            {methods.bank_transfer&&<div className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-2">
              <input placeholder="Bank name" value={details.bank_transfer.bank} onChange={e=>setDetail("bank_transfer","bank",e.target.value)} className="rounded-lg border px-3 py-2.5"/>
              <input placeholder="Account number" value={details.bank_transfer.account_number} onChange={e=>setDetail("bank_transfer","account_number",e.target.value)} className="rounded-lg border px-3 py-2.5"/>
              <input placeholder="Branch code" value={details.bank_transfer.branch_code} onChange={e=>setDetail("bank_transfer","branch_code",e.target.value)} className="rounded-lg border px-3 py-2.5"/>
              {showMZ&&<input placeholder="NIB" value={details.bank_transfer.nib} onChange={e=>setDetail("bank_transfer","nib",e.target.value)} className="rounded-lg border px-3 py-2.5"/>}
              <input placeholder="Account holder name" value={details.bank_transfer.holder_name} onChange={e=>setDetail("bank_transfer","holder_name",e.target.value)} className="rounded-lg border px-3 py-2.5 md:col-span-2"/>
            </div>}
            {showMZ&&<>
              <label className="flex items-center gap-3"><input type="checkbox" checked={methods.mpesa} onChange={e=>setMethods(m=>({...m,mpesa:e.target.checked}))}/><span className="font-medium">M-Pesa</span></label>
              {methods.mpesa&&<div className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-2"><input placeholder="M-Pesa phone number" value={details.mpesa.phone} onChange={e=>setDetail("mpesa","phone",e.target.value)} className="rounded-lg border px-3 py-2.5"/><input placeholder="Account holder name" value={details.mpesa.holder_name} onChange={e=>setDetail("mpesa","holder_name",e.target.value)} className="rounded-lg border px-3 py-2.5"/></div>}
              <label className="flex items-center gap-3"><input type="checkbox" checked={methods.emola} onChange={e=>setMethods(m=>({...m,emola:e.target.checked}))}/><span className="font-medium">e-Mola</span></label>
              {methods.emola&&<div className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-2"><input placeholder="e-Mola phone number" value={details.emola.phone} onChange={e=>setDetail("emola","phone",e.target.value)} className="rounded-lg border px-3 py-2.5"/><input placeholder="Account holder name" value={details.emola.holder_name} onChange={e=>setDetail("emola","holder_name",e.target.value)} className="rounded-lg border px-3 py-2.5"/></div>}
            </>}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-5"><h3 className="font-semibold text-slate-900">Account preferences</h3></div>
          <div className="space-y-5 p-6">
            <label className="flex items-center justify-between"><span><b className="block text-sm">Email notifications</b><small className="text-slate-500">Important account and payout notifications.</small></span><input type="checkbox" checked={emailNotifications} onChange={e=>setEmailNotifications(e.target.checked)}/></label>
            <label className="flex items-center justify-between"><span><b className="block text-sm">Sales notifications</b><small className="text-slate-500">Notifications when affiliate sales are recorded.</small></span><input type="checkbox" checked={salesNotifications} onChange={e=>setSalesNotifications(e.target.checked)}/></label>
          </div>
        </section>
        <div className="flex justify-end"><button onClick={save} disabled={saving} className="rounded-lg bg-[#16294F] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving?"Saving...":"Save settings"}</button></div>
      </>}
    </div>
  </AppShell>
}
