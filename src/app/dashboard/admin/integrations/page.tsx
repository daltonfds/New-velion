"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";

type Platform = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "suspended" | "revoked";
  api_key: string;
  webhook_url: string | null;
  sellers: number;
  products: number;
  orders: number;
  last_activity: string | null;
  created_at: string;
};

type Credentials = {
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
};

type IntegrationOrder = {
  id: string;
  platform_id: string;
  external_order_id: string;
  external_seller_id: string;
  status: string;
  currency: string;
  subtotal: number;
  shipping_amount: number;
  total: number;
  tracking_number: string | null;
  carrier: string | null;
  tracking_url: string | null;
  platform: { name: string; slug: string } | null;
  created_at: string;
  updated_at: string;
};

const statuses = ["pending","confirmed","processing","packed","shipped","in_transit","delivered","cancelled","failed","returned"];

function Icon({ name, size = 18 }: { name: "layers"|"store"|"box"|"orders"|"webhook"|"key"|"docs"|"plus"|"refresh"|"search"|"arrow"|"check"|"clock"; size?: number }) {
  const common = { width:size, height:size, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:1.8, strokeLinecap:"round" as const, strokeLinejoin:"round" as const };
  const paths: Record<string, React.ReactNode> = {
    layers:<><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/></>,
    store:<><path d="M4 10h16v10H4z"/><path d="M3 10 5 4h14l2 6"/><path d="M8 10v3h8v-3"/></>,
    box:<><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7"/><path d="M12 11v10"/></>,
    orders:<><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    webhook:<><path d="M8 12a4 4 0 1 1 4-4"/><path d="M16 12a4 4 0 1 1-4 4"/><path d="m12 8 4 4-4 4"/></>,
    key:<><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8"/><path d="m16 7 2 2"/></>,
    docs:<><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></>,
    plus:<><path d="M12 5v14M5 12h14"/></>,
    refresh:<><path d="M20 11a8 8 0 0 0-14.9-3M4 5v4h4"/><path d="M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4"/></>,
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    arrow:<><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    check:<><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
    clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string,string> = {
    active:"border-emerald-200 bg-emerald-50 text-emerald-700",
    delivered:"border-emerald-200 bg-emerald-50 text-emerald-700",
    confirmed:"border-blue-200 bg-blue-50 text-[#10069F]",
    processing:"border-blue-200 bg-blue-50 text-[#10069F]",
    shipped:"border-violet-200 bg-violet-50 text-violet-700",
    in_transit:"border-violet-200 bg-violet-50 text-violet-700",
    suspended:"border-amber-200 bg-amber-50 text-amber-700",
    pending:"border-amber-200 bg-amber-50 text-amber-700",
    packed:"border-[#E5E7EB] bg-[#F7F8FA] text-slate-700",
    revoked:"border-red-200 bg-red-50 text-red-700",
    cancelled:"border-red-200 bg-red-50 text-red-700",
    failed:"border-red-200 bg-red-50 text-red-700",
    returned:"border-orange-200 bg-orange-50 text-orange-700",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${map[status] || "border-[#E5E7EB] bg-[#F7F8FA] text-slate-600"}`}>{status.replace("_"," ")}</span>;
}

export default function AdminIntegrationsPage() {
  const [platforms,setPlatforms]=useState<Platform[]>([]);
  const [orders,setOrders]=useState<IntegrationOrder[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [credentials,setCredentials]=useState<Credentials|null>(null);
  const [tab,setTab]=useState<"overview"|"platforms"|"orders">("overview");
  const [query,setQuery]=useState("");
  const [selected,setSelected]=useState<Platform|null>(null);
  const [showCreate,setShowCreate]=useState(false);
  const [form,setForm]=useState({name:"",slug:"",description:"",webhook_url:""});

  async function authHeaders() {
    const {data}=await supabase.auth.getSession();
    return {"content-type":"application/json",...(data.session?.access_token?{authorization:`Bearer ${data.session.access_token}`}:{})};
  }

  async function load() {
    setLoading(true); setError("");
    try {
      const headers=await authHeaders();
      const [pr,or]=await Promise.all([
        fetch("/api/admin/integrations/platforms",{headers,cache:"no-store"}),
        fetch("/api/admin/integrations/orders?limit=100",{headers,cache:"no-store"})
      ]);
      const pj=await pr.json(), oj=await or.json();
      if(!pr.ok) throw new Error(pj.error||"Could not load platforms.");
      if(!or.ok) throw new Error(oj.error||"Could not load orders.");
      setPlatforms(pj.data??[]); setOrders(oj.data??[]);
    } catch(e){setError(e instanceof Error?e.message:"Could not load integrations.");}
    finally{setLoading(false);}
  }

  useEffect(()=>{void load();},[]);

  async function createPlatform() {
    setSaving(true); setError(""); setNotice("");
    try {
      const response=await fetch("/api/admin/integrations/platforms",{method:"POST",headers:await authHeaders(),body:JSON.stringify(form)});
      const json=await response.json();
      if(!response.ok) throw new Error(json.error||"Could not create platform.");
      setCredentials(json.credentials); setNotice("Platform connected. Save the credentials before closing this window.");
      setForm({name:"",slug:"",description:"",webhook_url:""}); setShowCreate(false); await load();
    } catch(e){setError(e instanceof Error?e.message:"Could not create platform.");}
    finally{setSaving(false);}
  }

  async function platformAction(id:string,action:string) {
    setError(""); setNotice("");
    try {
      const response=await fetch(`/api/admin/integrations/platforms/${id}`,{method:"PATCH",headers:await authHeaders(),body:JSON.stringify({action})});
      const json=await response.json();
      if(!response.ok) throw new Error(json.error||"Action failed.");
      if(json.credentials){setCredentials(json.credentials);setNotice("New credentials generated. Save them now.");}
      else setNotice("Platform updated.");
      await load();
    } catch(e){setError(e instanceof Error?e.message:"Action failed.");}
  }

  async function updateOrder(id:string,status:string) {
    try {
      const response=await fetch(`/api/admin/integrations/orders/${id}/status`,{method:"PATCH",headers:await authHeaders(),body:JSON.stringify({status})});
      const json=await response.json();
      if(!response.ok) throw new Error(json.error||"Could not update order.");
      setNotice("Order updated and webhook queued."); await load();
    } catch(e){setError(e instanceof Error?e.message:"Could not update order.");}
  }

  const filteredPlatforms=useMemo(()=>platforms.filter(p=>`${p.name} ${p.slug}`.toLowerCase().includes(query.toLowerCase())),[platforms,query]);
  const stats=useMemo(()=>({
    active:platforms.filter(p=>p.status==="active").length,
    sellers:platforms.reduce((n,p)=>n+p.sellers,0),
    products:platforms.reduce((n,p)=>n+p.products,0),
    orders:platforms.reduce((n,p)=>n+p.orders,0),
    delivered:orders.filter(o=>o.status==="delivered").length,
    pending:orders.filter(o=>["pending","confirmed","processing","packed"].includes(o.status)).length,
  }),[platforms,orders]);

  return (
    <AppShell area="admin" title="Integrations" subtitle="External sales channels and fulfillment infrastructure">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#10069F]"><Icon name="layers" size={15}/>Infrastructure / Integrations</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Platform Integrations</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Connect marketplaces and seller platforms to NewVelion Products, Stock, Orders and Fulfillment through Integration API v1.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/docs/integrations" target="_blank" className="inline-flex items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-[#F7F8FA]"><Icon name="docs" size={16}/> API docs</Link>
            <button onClick={()=>setShowCreate(true)} className="inline-flex items-center gap-2 rounded-[10px] bg-[#0A0440] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#203a6b]"><Icon name="plus" size={16}/> Connect platform</button>
          </div>
        </div>

        {error&&<div className="flex items-center justify-between rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button onClick={()=>setError("")}>×</button></div>}
        {notice&&<div className="flex items-center gap-2 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><Icon name="check" size={16}/>{notice}</div>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {label:"Connected platforms",value:platforms.length,icon:"layers" as const},
            {label:"External sellers",value:stats.sellers,icon:"store" as const},
            {label:"Mapped products",value:stats.products,icon:"box" as const},
            {label:"Integration orders",value:stats.orders,icon:"orders" as const},
          ].map(({label,value,icon})=><div key={label} className="rounded-[12px] border border-[#E5E7EB] bg-white p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8EDFF] text-[#0A0440]"><Icon name={icon} size={17}/></span></div><p className="mt-4 text-2xl font-bold text-slate-950">{loading?"—":Number(value).toLocaleString()}</p></div>)}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB]">
          <div className="flex gap-1">
            {([["overview","Overview"],["platforms","Platforms"],["orders","Orders"]] as const).map(([key,label])=><button key={key} onClick={()=>setTab(key)} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab===key?"border-[#0A0440] text-[#0A0440]":"border-transparent text-slate-500 hover:text-slate-800"}`}>{label}</button>)}
          </div>
          <button onClick={()=>void load()} className="mb-2 inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-[#F7F8FA]"><Icon name="refresh" size={14}/> Refresh</button>
        </div>

        {tab==="overview"&&(
          <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
            <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-6">
              <div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-slate-950">Integration health</h2><p className="mt-1 text-sm text-slate-500">A live view of the external sales channel layer.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">API v1 operational</span></div>
              <div className="mt-6 space-y-4">
                {[
                  ["Authentication","API key + secret validation","Secure"],
                  ["Catalog","Products, stock and mappings","Connected"],
                  ["Orders","Idempotent external order intake",`${stats.pending} active`],
                  ["Webhooks","Signed status and tracking events",`${stats.delivered} delivered`],
                ].map(([a,b,c])=><div key={a} className="flex items-center gap-4 rounded-[10px] border border-slate-100 bg-[#F7F8FA]/70 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-600"><Icon name="check" size={17}/></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">{a}</p><p className="text-xs text-slate-500">{b}</p></div><span className="text-xs font-semibold text-slate-600">{c}</span></div>)}
              </div>
            </section>
            <section className="rounded-[12px] bg-[#0A0440] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-200">Partner architecture</p>
              <h2 className="mt-3 text-xl font-bold">One API. Multiple channels.</h2>
              <p className="mt-2 text-sm leading-6 text-blue-100">External platforms own the storefront and customer sale. NewVelion owns the product, stock, fulfillment and tracking infrastructure.</p>
              <div className="mt-6 space-y-2 text-sm">{["Catalog & stock","External seller mapping","Order intake","Fulfillment status","Signed webhooks"].map(x=><div key={x} className="flex items-center gap-2"><Icon name="check" size={15}/>{x}</div>)}</div>
              <Link href="/docs/integrations" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-200">Read partner docs <Icon name="arrow" size={15}/></Link>
            </section>
          </div>
        )}

        {tab==="platforms"&&(
          <section className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#E5E7EB] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-bold text-slate-950">Connected platforms</h2><p className="mt-1 text-xs text-slate-500">{stats.active} active · {platforms.length} total</p></div>
              <div className="relative"><Icon name="search" size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search platforms..." className="w-full rounded-lg border border-[#E5E7EB] py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 sm:w-64"/></div>
            </div>
            {loading?<div className="p-10 text-center text-sm text-slate-500">Loading...</div>:filteredPlatforms.length===0?<div className="p-10 text-center"><p className="font-semibold text-slate-900">No platforms found</p><p className="mt-1 text-sm text-slate-500">Connect your first marketplace or seller platform.</p></div>:<div className="divide-y divide-slate-100">{filteredPlatforms.map(p=><button key={p.id} onClick={()=>setSelected(p)} className="w-full p-5 text-left transition hover:bg-[#F7F8FA]"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#E8EDFF] font-bold text-[#0A0440]">{p.name.slice(0,1).toUpperCase()}</div><div className="min-w-0"><div className="flex items-center gap-2"><h3 className="truncate font-semibold text-slate-900">{p.name}</h3><StatusBadge status={p.status}/></div><p className="mt-1 truncate text-xs text-slate-500">{p.slug} · {p.api_key}</p></div></div><div className="grid grid-cols-3 gap-3 sm:w-[360px]"><div><p className="text-[11px] text-slate-400">Sellers</p><p className="font-semibold">{p.sellers}</p></div><div><p className="text-[11px] text-slate-400">Products</p><p className="font-semibold">{p.products}</p></div><div><p className="text-[11px] text-slate-400">Orders</p><p className="font-semibold">{p.orders}</p></div></div><Icon name="arrow" size={17}/></div></button>)}</div>}
          </section>
        )}

        {tab==="orders"&&(
          <section className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
            <div className="border-b border-[#E5E7EB] p-5"><h2 className="font-bold text-slate-950">Integration orders</h2><p className="mt-1 text-xs text-slate-500">Orders received from connected sales channels.</p></div>
            {orders.length===0?<div className="p-10 text-center text-sm text-slate-500">No external orders yet.</div>:<div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[#F7F8FA] text-xs text-slate-500"><tr>{["Platform","External order","Seller","Total","Status","Tracking","Created"].map(h=><th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{orders.map(o=><tr key={o.id} className="hover:bg-[#F7F8FA]"><td className="px-5 py-4 font-semibold">{o.platform?.name||"—"}</td><td className="px-5 py-4 font-mono text-xs">{o.external_order_id}</td><td className="px-5 py-4 font-mono text-xs">{o.external_seller_id}</td><td className="px-5 py-4 font-semibold">{o.total.toLocaleString()} {o.currency}</td><td className="px-5 py-4"><select value={o.status} onChange={e=>void updateOrder(o.id,e.target.value)} className="rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-2 text-xs font-semibold"><option disabled>{o.status}</option>{statuses.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}</select></td><td className="px-5 py-4 text-xs text-slate-500">{o.tracking_number||"—"}{o.carrier?` · ${o.carrier}`:""}</td><td className="px-5 py-4 text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>}
          </section>
        )}

        {credentials&&<div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-2xl rounded-[12px] bg-white shadow-2xl"><div className="border-b border-[#E5E7EB] p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700"><Icon name="key" size={18}/></span><div><h2 className="font-bold text-slate-950">Save your credentials</h2><p className="text-sm text-slate-500">Secrets are shown once and cannot be recovered.</p></div></div></div><div className="space-y-3 p-6">{Object.entries(credentials).map(([k,v])=><div key={k} className="rounded-[10px] border border-[#E5E7EB] bg-[#F7F8FA] p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{k}</p><code className="mt-2 block break-all text-xs text-slate-900">{v}</code></div>)}</div><div className="flex justify-end border-t border-[#E5E7EB] p-5"><button onClick={()=>setCredentials(null)} className="rounded-lg bg-[#0A0440] px-5 py-2.5 text-sm font-semibold text-white">I saved these credentials</button></div></div></div>}

        {showCreate&&<div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-xl rounded-[12px] bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-[#E5E7EB] p-6"><div><h2 className="text-xl font-bold text-slate-950">Connect a platform</h2><p className="mt-1 text-sm text-slate-500">Create credentials for an external marketplace or sales channel.</p></div><button onClick={()=>setShowCreate(false)} className="text-2xl text-slate-400">×</button></div><div className="space-y-4 p-6">{[["name","Platform name","Example Marketplace"],["slug","Slug","example-marketplace"],["webhook_url","Webhook URL","https://example.com/webhooks/newvelion"]].map(([key,label,placeholder])=><label key={key} className="block text-sm font-semibold text-slate-700">{label}<input value={form[key as keyof typeof form]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder} className="mt-1.5 w-full rounded-[10px] border border-[#E5E7EB] px-3 py-2.5 font-normal outline-none focus:border-blue-500"/></label>)}<label className="block text-sm font-semibold text-slate-700">Description<textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="mt-1.5 w-full rounded-[10px] border border-[#E5E7EB] px-3 py-2.5 font-normal outline-none focus:border-blue-500"/></label></div><div className="flex justify-end gap-2 border-t border-[#E5E7EB] p-5"><button onClick={()=>setShowCreate(false)} className="rounded-[10px] border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={saving||!form.name} onClick={()=>void createPlatform()} className="rounded-[10px] bg-[#0A0440] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving?"Connecting...":"Connect platform"}</button></div></div></div>}

        {selected&&<div className="fixed inset-0 z-[105] flex justify-end bg-slate-950/40"><div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl"><div className="sticky top-0 border-b border-[#E5E7EB] bg-white p-6"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#E8EDFF] font-bold text-[#0A0440]">{selected.name.slice(0,1).toUpperCase()}</div><div><h2 className="font-bold text-slate-950">{selected.name}</h2><p className="text-xs text-slate-500">{selected.slug}</p></div></div><button onClick={()=>setSelected(null)} className="text-2xl text-slate-400">×</button></div></div><div className="space-y-6 p-6"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">Status</span><StatusBadge status={selected.status}/></div><div className="grid grid-cols-3 gap-3">{[["Sellers",selected.sellers],["Products",selected.products],["Orders",selected.orders]].map(([l,v])=><div key={String(l)} className="rounded-[10px] border border-[#E5E7EB] p-4"><p className="text-xs text-slate-500">{l}</p><p className="mt-1 text-xl font-bold">{v}</p></div>)}</div><div className="rounded-[10px] border border-[#E5E7EB] p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">API key</p><code className="mt-2 block break-all text-xs">{selected.api_key}</code></div><div><p className="text-sm font-semibold">Webhook endpoint</p><p className="mt-1 break-all text-sm text-slate-500">{selected.webhook_url||"Not configured"}</p></div><div><p className="text-sm font-semibold">Description</p><p className="mt-1 text-sm leading-6 text-slate-500">{selected.description||"No description provided."}</p></div><div className="border-t border-[#E5E7EB] pt-5"><p className="text-sm font-semibold">Platform actions</p><div className="mt-3 flex flex-wrap gap-2">{selected.status==="active"?<button onClick={()=>void platformAction(selected.id,"suspend")} className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700">Suspend</button>:selected.status!=="revoked"&&<button onClick={()=>void platformAction(selected.id,"activate")} className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700">Activate</button>}{selected.status!=="revoked"&&<button onClick={()=>void platformAction(selected.id,"revoke")} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">Revoke</button>}<button onClick={()=>void platformAction(selected.id,"rotate")} className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-semibold">Rotate API credentials</button><button onClick={()=>void platformAction(selected.id,"regenerate_webhook_secret")} className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-semibold">Regenerate webhook secret</button></div></div><Link href="/docs/integrations" target="_blank" className="flex items-center justify-between rounded-[10px] bg-[#F7F8FA] p-4 text-sm font-semibold text-slate-700">Open Integration API documentation <Icon name="arrow" size={16}/></Link></div></div></div>}
      </div>
    </AppShell>
  );
}
