"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";

type Item = { id:string; customer_id:string; plan_code:string; amount_zar:number; status:string; payment_reference:string|null; customer_note:string|null; created_at:string; starts_at:string|null; expires_at:string|null; profiles?:{full_name:string|null;nome_completo:string|null;country_code:string|null}|null };
type Plan = {plan_code:string;name:string;amount_zar:number;payment_url:string|null;active:boolean};

export default function AdminClubMembershipsPage() {
  const [items,setItems]=useState<Item[]>([]); const [plans,setPlans]=useState<Plan[]>([]);
  const [links,setLinks]=useState<Record<string,string>>({}); const [loading,setLoading]=useState(true);
  const [error,setError]=useState(""); const [notice,setNotice]=useState(""); const [busy,setBusy]=useState("");
  const load=useCallback(async()=>{
    setLoading(true);setError("");
    try {
      const {data:{session}}=await supabase.auth.getSession();
      if(!session?.access_token) throw new Error("Please sign in as an administrator.");
      const res=await fetch("/api/admin/club-memberships",{headers:{Authorization:`Bearer ${session.access_token}`},cache:"no-store"});
      const json=await res.json(); if(!res.ok) throw new Error(json.error||"Unable to load requests.");
      setItems(json.memberships||[]);setPlans(json.plans||[]);
      setLinks(Object.fromEntries((json.plans||[]).map((p:Plan)=>[p.plan_code,p.payment_url||""])));
    } catch(e){setError(e instanceof Error?e.message:"Unable to load requests.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void load();},[load]);
  async function saveLink(plan:Plan){
    setBusy(plan.plan_code);setError("");setNotice("");
    try {
      const {data:{session}}=await supabase.auth.getSession();if(!session?.access_token)throw new Error("Please sign in again.");
      const res=await fetch("/api/admin/club-memberships",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({action:"save_link",plan_code:plan.plan_code,payment_url:links[plan.plan_code]||""})});
      const json=await res.json();if(!res.ok)throw new Error(json.error||"Unable to save link.");
      setNotice(`Payment link saved for ${plan.name}.`);await load();
    }catch(e){setError(e instanceof Error?e.message:"Unable to save link.");}finally{setBusy("");}
  }
  async function act(item:Item,action:"approve"|"reject"){
    if(!window.confirm(action==="approve"?"Confirm that you verified the payment and activate this membership for 90 days?":"Reject this membership request?"))return;
    setBusy(item.id);setError("");setNotice("");
    try{
      const {data:{session}}=await supabase.auth.getSession();if(!session?.access_token)throw new Error("Please sign in again.");
      const res=await fetch("/api/admin/club-memberships",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({id:item.id,action})});
      const json=await res.json();if(!res.ok)throw new Error(json.error||"Unable to update membership.");
      setNotice(action==="approve"?"Membership activated for 90 days.":"Membership request rejected.");await load();
    }catch(e){setError(e instanceof Error?e.message:"Unable to update membership.");}finally{setBusy("");}
  }
  const money=(v:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR",maximumFractionDigits:0}).format(v);
  return <AppShell area="admin"><main className="mx-auto max-w-7xl p-5 lg:p-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#0078E8]">Customer benefits</p><h1 className="mt-1 text-3xl font-extrabold text-[#001B44]">Club memberships</h1><p className="mt-2 text-sm text-slate-500">Configure payment links and verify payment before activating 90-day memberships.</p></div><button onClick={()=>void load()} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold">Refresh</button></div>
    {error&&<p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">{notice}</p>}
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-extrabold">Payment links</h2><p className="mt-1 text-sm text-slate-500">Paste the HTTPS payment URL for each plan. The link can be from your chosen payment provider.</p><div className="mt-4 grid gap-4 lg:grid-cols-3">{plans.map(plan=><div key={plan.plan_code} className="rounded-xl border border-slate-200 p-4"><p className="font-bold">{plan.name} · {money(Number(plan.amount_zar))} / 3 months</p><label className="mt-3 block text-xs font-semibold text-slate-600">Payment URL<input value={links[plan.plan_code]||""} onChange={e=>setLinks(v=>({...v,[plan.plan_code]:e.target.value}))} placeholder="https://..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal"/></label><p className="mt-2 text-xs text-slate-500">{links[plan.plan_code]?"Link configured":"No payment link configured"}</p><button disabled={!!busy} onClick={()=>void saveLink(plan)} className="mt-3 w-full rounded-lg bg-[#003B95] px-3 py-2 text-sm font-bold text-white disabled:opacity-50">{busy===plan.plan_code?"Saving…":"Save payment link"}</button></div>)}</div></section>
    <div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Total requests</p><p className="mt-2 text-2xl font-extrabold">{items.length}</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Awaiting review</p><p className="mt-2 text-2xl font-extrabold">{items.filter(x=>x.status==="pending_review"||x.status==="pending_payment").length}</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Active memberships</p><p className="mt-2 text-2xl font-extrabold">{items.filter(x=>x.status==="active").length}</p></div></div>
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-200 px-5 py-4 font-bold">Membership requests</div>{loading?<p className="p-6 text-sm text-slate-500">Loading…</p>:items.length===0?<p className="p-6 text-sm text-slate-500">No membership requests yet.</p>:<div className="divide-y divide-slate-100">{items.map(item=><article key={item.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-bold text-[#001B44]">{item.profiles?.full_name||item.profiles?.nome_completo||"Customer"}</h2><p className="mt-1 text-sm text-slate-500">{item.profiles?.country_code||"Country not set"} · {new Date(item.created_at).toLocaleString("en-ZA")}</p><p className="mt-3 text-lg font-extrabold">{money(Number(item.amount_zar))} · {item.plan_code.replace("club_","Club ")}</p><p className="mt-1 text-sm">Status: <span className="font-semibold">{item.status.replaceAll("_"," ")}</span></p>{item.payment_reference&&<p className="mt-2 text-sm">Payment reference: <span className="font-semibold">{item.payment_reference}</span></p>}{item.customer_note&&<p className="mt-1 text-sm text-slate-600">Customer note: {item.customer_note}</p>}{item.expires_at&&<p className="mt-1 text-sm text-slate-500">Expires: {new Date(item.expires_at).toLocaleDateString("en-ZA")}</p>}</div>{["pending_payment","pending_review"].includes(item.status)&&<div className="flex gap-2"><button disabled={!!busy} onClick={()=>void act(item,"approve")} className="rounded-lg bg-[#003B95] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy===item.id?"Saving…":"Verify & approve"}</button><button disabled={!!busy} onClick={()=>void act(item,"reject")} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50">Reject</button></div>}</div></article>)}</div>}</section>
  </main></AppShell>;
}
