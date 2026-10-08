"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supplierFetch } from "@/lib/supplier-client";
import { supabase } from "@/lib/supabase";

export default function NewSupplierProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{id:string;nome:string}>>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nome:"", slug:"", descricao:"", categoria_id:"", preco:"", preco_custo:"", moeda:"ZAR",
    preco_promocional:"", comissao_afiliado:"", estoque:"0", low_stock_threshold:"5",
    supplier_min_selling_price:"", supplier_suggested_price:"", pricing_mode:"fixed", custom_pricing_floor_zar:"", checkout_url:"", fotos:"",
    fornecedor_nome:"", fornecedor_pais:"ZA", supplier_cost_amount:"", supplier_fx_rate_to_zar:"1", modo_uso:"", garantia_texto:""
  });

  useEffect(() => {
    supabase.from("categories").select("id,nome").order("ordem").order("nome").then(({data}) => setCategories(data ?? []));
  }, []);

  function field(key: keyof typeof form, value: string) { setForm((current) => ({...current, [key]: value})); }

  useEffect(() => {
    if (form.fornecedor_pais !== "CN") { field("supplier_fx_rate_to_zar", "1"); return; }
    fetch("/api/exchange-rate", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const rate = Number(data?.rate);
        if (Number.isFinite(rate) && rate > 0) field("supplier_fx_rate_to_zar", String(rate));
      })
      .catch(() => undefined);
  }, [form.fornecedor_pais]);

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const result = await supplierFetch<{data:{id:string}}>("/api/supplier/products", {
        method:"POST",
        body:JSON.stringify({
          ...form,
          preco:Number(form.preco),
          preco_custo:Number(form.preco_custo),
          preco_promocional:form.preco_promocional || null,
          comissao_afiliado:Number(form.comissao_afiliado || 0),
          estoque:Number(form.estoque || 0),
          low_stock_threshold:Number(form.low_stock_threshold || 5),
          supplier_min_selling_price:Number(form.supplier_min_selling_price || form.preco),
          pricing_mode:form.pricing_mode,
          custom_pricing_floor_zar:form.pricing_mode === "custom" && form.custom_pricing_floor_zar ? Number(form.custom_pricing_floor_zar) : null,
          supplier_suggested_price:Number(form.supplier_suggested_price || form.preco),
          supplier_country_code:form.fornecedor_pais,
          supplier_cost_amount:Number(form.supplier_cost_amount || form.preco_custo),
          supplier_fx_rate_to_zar:Number(form.supplier_fx_rate_to_zar || (form.fornecedor_pais === "ZA" ? 1 : 0)),
          fotos:form.fotos.split("\n").map((v)=>v.trim()).filter(Boolean)
        })
      });
      router.push("/dashboard/supplier/products/" + result.data.id);
    } catch(e) { setError(e instanceof Error ? e.message : "Could not create product."); }
    finally { setSaving(false); }
  }

  const inputs: Array<[keyof typeof form,string,string]> = [
    ["nome","Product name","text"],["slug","Slug","text"],["preco","Base price","number"],["preco_custo","Cost price","number"],
    ["preco_promocional","Promotional price","number"],["comissao_afiliado","Seller commission %","number"],["estoque","Stock","number"],
    ["low_stock_threshold","Low-stock threshold","number"],["supplier_min_selling_price","Minimum seller price","number"],
    ["supplier_suggested_price","Suggested seller price","number"],["custom_pricing_floor_zar","Custom pricing base (ZAR)","number"],["supplier_cost_amount","Supplier cost amount","number"],["supplier_fx_rate_to_zar","CNY → ZAR rate","number"],["checkout_url","Checkout URL","url"],["fornecedor_nome","Brand / supplier name","text"]
  ];

  return <AppShell area="supplier"><div className="mx-auto max-w-5xl space-y-6">
    <div><Link href="/dashboard/supplier/products" className="text-sm font-semibold text-[#10069F]">← Products</Link><h1 className="mt-3 text-2xl font-bold text-[#0A0440]">Add product</h1><p className="mt-1 text-sm text-slate-500">Create a draft. Approved products become available to sellers in the marketplace.</p></div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <form onSubmit={save} className="space-y-5">
      <Card><div className="grid gap-4 p-6 sm:grid-cols-2">{inputs.map(([key,label,type])=><label key={key} className="text-sm font-medium text-slate-700">{label}<input required={["nome","preco","preco_custo","checkout_url"].includes(key)} type={type} min={type==="number"?"0":undefined} step={type==="number"?"0.01":undefined} value={form[key]} onChange={(e)=>field(key,e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 outline-none focus:border-blue-500"/></label>)}
        <label className="text-sm font-medium text-slate-700">Seller pricing model<select value={form.pricing_mode} onChange={(e)=>field("pricing_mode",e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5"><option value="fixed">Fixed Offer — supplier controls price</option><option value="custom">Custom Pricing — seller/platform chooses price</option></select></label><label className="text-sm font-medium text-slate-700">Supplier country<select value={form.fornecedor_pais} onChange={(e)=>field("fornecedor_pais",e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5"><option value="ZA">South Africa (ZA) · ZAR</option><option value="CN">China (CN) · CNY</option></select></label><div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 sm:col-span-2">Customer-facing price and checkout currency are always ZAR. Chinese supplier costs are recorded in CNY and converted to ZAR using the captured FX rate.</div>
        <label className="text-sm font-medium text-slate-700">Category<select required value={form.categoria_id} onChange={(e)=>field("categoria_id",e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5"><option value="">Select category</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>
        <label className="sm:col-span-2 text-sm font-medium text-slate-700">Description<textarea value={form.descricao} onChange={(e)=>field("descricao",e.target.value)} rows={5} className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5"/></label>
        <label className="sm:col-span-2 text-sm font-medium text-slate-700">Image URLs <span className="font-normal text-slate-400">(one per line)</span><textarea value={form.fotos} onChange={(e)=>field("fotos",e.target.value)} rows={4} className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5"/></label>
        <label className="sm:col-span-2 text-sm font-medium text-slate-700">How to use<textarea value={form.modo_uso} onChange={(e)=>field("modo_uso",e.target.value)} rows={4} className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5"/></label>
        <label className="sm:col-span-2 text-sm font-medium text-slate-700">Guarantee<textarea value={form.garantia_texto} onChange={(e)=>field("garantia_texto",e.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5"/></label>
      </div></Card>
      <div className="flex justify-end gap-3"><Link href="/dashboard/supplier/products" className="rounded-lg border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancel</Link><button disabled={saving} className="rounded-lg bg-[#10069F] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Creating..." : "Create draft"}</button></div>
    </form>
  </div></AppShell>;
}
