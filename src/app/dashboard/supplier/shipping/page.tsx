"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supplierFetch } from "@/lib/supplier-client";

type Zone={id:string;name:string;country_codes:string[];metro:boolean|null;base_rate:number;per_kg_rate:number;estimated_days:number;active:boolean};
export default function SupplierShippingPage(){
 const [profile,setProfile]=useState<any>({enabled:true,processing_days:1,free_shipping_threshold:"",default_rate:0,currency:"ZAR"});
 const [zones,setZones]=useState<Zone[]>([]);
 const [form,setForm]=useState({name:"",country_codes:"ZA",metro:"all",base_rate:"0",per_kg_rate:"0",estimated_days:"3"});
 const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [message,setMessage]=useState("");
 async function load(){const r=await supplierFetch<{data:{profile:any,zones:Zone[]}}>("/api/supplier/shipping");setProfile(r.data.profile??profile);setZones(r.data.zones??[]);setLoading(false);}
 useEffect(()=>{load().catch(e=>{setMessage(e instanceof Error?e.message:"Failed to load shipping.");setLoading(false);});},[]);
 async function save(){setSaving(true);setMessage("");try{await supplierFetch("/api/supplier/shipping",{method:"PUT",body:JSON.stringify(profile)});setMessage("Shipping settings saved.");}catch(e){setMessage(e instanceof Error?e.message:"Failed to save.");}finally{setSaving(false);}}
 async function addZone(){setSaving(true);setMessage("");try{await supplierFetch("/api/supplier/shipping",{method:"POST",body:JSON.stringify({...form,country_codes:form.country_codes.split(",").map(x=>x.trim()).filter(Boolean),metro:form.metro==="all"?null:form.metro==="metro"})});setForm({name:"",country_codes:"ZA",metro:"all",base_rate:"0",per_kg_rate:"0",estimated_days:"3"});await load();setMessage("Shipping zone added.");}catch(e){setMessage(e instanceof Error?e.message:"Failed to add zone.");}finally{setSaving(false);}}
 async function remove(id:string){await supplierFetch("/api/supplier/shipping/"+id,{method:"DELETE"});await load();}
 return <AppShell area="supplier"><div className="space-y-6">
  <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0E4AAB]">Fulfillment</p><h1 className="mt-2 text-3xl font-bold text-[#0E1F3D]">Shipping</h1><p className="mt-2 text-sm text-slate-500">Define how delivery rates and service zones are handled for your products.</p></div>
  {message&&<div className="rounded-[10px] border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}
  <Card><div className="p-6"><h2 className="font-semibold text-slate-900">Default shipping</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
   <label className="text-sm font-medium">Currency<select value={profile.currency} onChange={e=>setProfile({...profile,currency:e.target.value})} className="mt-2 w-full rounded-lg border p-3"><option>ZAR</option></select></label>
   <label className="text-sm font-medium">Default rate<input type="number" value={profile.default_rate??0} onChange={e=>setProfile({...profile,default_rate:e.target.value})} className="mt-2 w-full rounded-lg border p-3"/></label>
   <label className="text-sm font-medium">Processing days<input type="number" min="0" value={profile.processing_days??1} onChange={e=>setProfile({...profile,processing_days:e.target.value})} className="mt-2 w-full rounded-lg border p-3"/></label>
   <label className="text-sm font-medium">Free shipping above<input type="number" min="0" value={profile.free_shipping_threshold??""} onChange={e=>setProfile({...profile,free_shipping_threshold:e.target.value})} className="mt-2 w-full rounded-lg border p-3"/></label>
  </div><label className="mt-5 flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={profile.enabled!==false} onChange={e=>setProfile({...profile,enabled:e.target.checked})}/> Shipping enabled</label><button onClick={()=>void save()} disabled={saving} className="mt-5 rounded-lg bg-[#0E4AAB] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving?"Saving...":"Save settings"}</button></div></Card>
  <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]"><Card><div className="p-6"><h2 className="font-semibold text-slate-900">Add zone</h2><div className="mt-5 space-y-4">
   <input placeholder="Zone name (e.g. South Africa Metro)" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full rounded-lg border p-3 text-sm"/>
   <input placeholder="Country code: ZA" value={form.country_codes} onChange={e=>setForm({...form,country_codes:e.target.value})} className="w-full rounded-lg border p-3 text-sm"/>
   <select value={form.metro} onChange={e=>setForm({...form,metro:e.target.value})} className="w-full rounded-lg border p-3 text-sm"><option value="all">Metro + non-metro</option><option value="metro">Metro only</option><option value="nonmetro">Non-metro only</option></select>
   <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="Base rate" value={form.base_rate} onChange={e=>setForm({...form,base_rate:e.target.value})} className="rounded-lg border p-3 text-sm"/><input type="number" placeholder="Per kg" value={form.per_kg_rate} onChange={e=>setForm({...form,per_kg_rate:e.target.value})} className="rounded-lg border p-3 text-sm"/></div>
   <input type="number" placeholder="Estimated days" value={form.estimated_days} onChange={e=>setForm({...form,estimated_days:e.target.value})} className="w-full rounded-lg border p-3 text-sm"/>
   <button onClick={()=>void addZone()} disabled={saving||!form.name} className="w-full rounded-lg bg-[#0E1F3D] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Add shipping zone</button>
  </div></div></Card>
  <Card className="p-0"><div className="border-b p-5"><h2 className="font-semibold">Configured zones</h2></div>{loading?<div className="p-8 text-center text-sm text-slate-500">Loading...</div>:zones.length===0?<div className="p-8 text-center text-sm text-slate-500">No zones configured.</div>:<div className="divide-y">{zones.map(z=><div key={z.id} className="flex items-center justify-between gap-4 p-5"><div><p className="font-semibold">{z.name}</p><p className="text-xs text-slate-500">{z.country_codes.join(", ")} · {z.metro===null?"All areas":z.metro?"Metro":"Non-metro"} · {z.estimated_days} days</p></div><div className="text-right"><p className="font-semibold">{z.base_rate} + {z.per_kg_rate}/kg</p><button onClick={()=>void remove(z.id)} className="mt-1 text-xs font-semibold text-red-600">Remove</button></div></div>)}</div>}</Card></div>
 </div></AppShell>
}