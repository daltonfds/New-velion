"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

type Supplier = { user_id:string; company_name:string; responsible_name:string; country_name:string|null; approval_status:string; rejection_reason:string|null; created_at:string };

async function api(path:string, init:RequestInit={}) {
  const {data:{session}}=await supabase.auth.getSession();
  const response=await fetch(path,{...init,headers:{Authorization:"Bearer "+(session?.access_token||""),"Content-Type":"application/json",...(init.headers||{})}});
  const body=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(body.error||"Request failed.");
  return body;
}

export default function AdminSuppliersPage(){
  const [items,setItems]=useState<Supplier[]>([]);
  const [error,setError]=useState("");
  const load=()=>api("/api/admin/suppliers").then((r)=>setItems(r.data||[])).catch((e)=>setError(e.message));
  useEffect(()=>{void load()},[]);
  async function change(id:string,status:string){setError("");try{await api("/api/admin/suppliers/"+id+"/status",{method:"PATCH",body:JSON.stringify({status})});await load()}catch(e){setError(e instanceof Error?e.message:"Could not update supplier.")}}
  return <AppShell area="admin"><div className="space-y-6"><div><h1 className="text-2xl font-bold text-[#16294F]">Suppliers</h1><p className="mt-1 text-sm text-slate-500">Review suppliers, producers and their business applications.</p></div>{error&&<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<Card className="overflow-hidden p-0"><div className="divide-y divide-slate-100">{items.map((item)=><div key={item.user_id} className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-semibold text-slate-900">{item.company_name}</p><p className="text-sm text-slate-500">{item.responsible_name} · {item.country_name||"Country not set"}</p><p className="mt-1 text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</p>{item.rejection_reason&&<p className="mt-2 text-xs text-red-600">{item.rejection_reason}</p>}</div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{item.approval_status}</span>{item.approval_status!=="approved"&&<button onClick={()=>void change(item.user_id,"approved")} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Approve</button>}{item.approval_status!=="under_review"&&item.approval_status!=="approved"&&<button onClick={()=>void change(item.user_id,"under_review")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Review</button>}{item.approval_status!=="rejected"&&<button onClick={()=>void change(item.user_id,"rejected")} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600">Reject</button>}{item.approval_status==="approved"&&<button onClick={()=>void change(item.user_id,"suspended")} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700">Suspend</button>}</div></div>)}{items.length===0&&<div className="py-14 text-center text-sm text-slate-500">No supplier applications yet.</div>}</div></Card></div></AppShell>
}
