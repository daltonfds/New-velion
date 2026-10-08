"use client";
import { useEffect,useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { adminFetch } from "@/lib/admin-client";

export default function PlatformSettingsPage(){
 const [form,setForm]=useState<any>({transaction_fee_percent:10,supplier_transaction_fee_percent:0,withdrawal_fee_percent:0,withdrawal_fee_fixed:0,hold_days:7,api_monthly_order_limit:10000,supplier_monthly_product_limit:100});
 const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);const [message,setMessage]=useState("");
 useEffect(()=>{adminFetch<{data:any}>("/api/admin/platform-settings").then(r=>setForm(r.data)).catch(e=>setMessage(e.message)).finally(()=>setLoading(false));},[]);
 async function save(){setSaving(true);setMessage("");try{await adminFetch("/api/admin/platform-settings",{method:"PUT",body:JSON.stringify(form)});setMessage("Platform settings saved.");}catch(e){setMessage(e instanceof Error?e.message:"Failed to save.");}finally{setSaving(false);}}
 const fields=[["transaction_fee_percent","Transaction fee %"],["supplier_transaction_fee_percent","Supplier fee %"],["withdrawal_fee_percent","Withdrawal fee %"],["withdrawal_fee_fixed","Withdrawal fixed fee"],["hold_days","Hold period (days)"],["api_monthly_order_limit","API monthly order limit"],["supplier_monthly_product_limit","Supplier monthly product limit"]];
 return <AppShell area="admin"><div className="max-w-4xl space-y-6"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#10069F]">Platform</p><h1 className="mt-2 text-3xl font-bold text-[#0A0440]">Business settings</h1><p className="mt-2 text-sm text-slate-500">Centralize NewVelion fees, holds and usage limits.</p></div>{message&&<div className="rounded-[10px] bg-blue-50 p-4 text-sm text-blue-800">{message}</div>}<Card><div className="grid gap-5 p-6 sm:grid-cols-2">{fields.map(([key,label])=><label key={key} className="text-sm font-semibold text-slate-700">{label}<input type="number" min="0" value={form[key]??0} onChange={e=>setForm({...form,[key]:e.target.value})} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"/></label>)}</div><div className="flex justify-end border-t p-5"><button disabled={saving||loading} onClick={()=>void save()} className="rounded-lg bg-[#10069F] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving?"Saving...":"Save settings"}</button></div></Card></div></AppShell>
}