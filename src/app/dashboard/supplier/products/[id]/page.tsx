"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supplierFetch } from "@/lib/supplier-client";

export default function SupplierProductDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { supplierFetch<{data:Record<string,unknown>}>("/api/supplier/products/" + id).then((r)=>setProduct(r.data)).catch((e)=>setError(e instanceof Error?e.message:"Failed to load product.")); }, [id]);

  async function submit() {
    setSaving(true); setError("");
    try { const r=await supplierFetch<{data:Record<string,unknown>}>("/api/supplier/products/"+id,{method:"PATCH",body:JSON.stringify({action:"submit"})}); setProduct(r.data); }
    catch(e){setError(e instanceof Error?e.message:"Could not submit product.");}
    finally{setSaving(false);}
  }

  if (!product) return <AppShell area="supplier"><div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">{error || "Loading product..."}</div></AppShell>;

  const status=String(product.supplier_status||"draft");
  return <AppShell area="supplier"><div className="mx-auto max-w-4xl space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link href="/dashboard/supplier/products" className="text-sm font-semibold text-blue-600">← Products</Link><h1 className="mt-3 text-2xl font-bold text-[#16294F]">{String(product.nome)}</h1><p className="mt-1 text-sm text-slate-500">Product status: {status}</p></div>{["draft","rejected"].includes(status)&&<button disabled={saving} onClick={()=>void submit()} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving?"Submitting...":"Submit for review"}</button>}</div>
    {error&&<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <div className="grid gap-5 sm:grid-cols-2">
      {[["Price",String(product.preco)+" "+String(product.moeda)],["Cost",String(product.preco_custo)+" "+String(product.moeda)],["Stock",String(Number(product.estoque||0)-Number(product.reserved_estoque||0))],["Seller commission",String(product.supplier_commission_rate||0)+"%"],["Minimum seller price",String(product.supplier_min_selling_price||product.preco)],["Suggested seller price",String(product.supplier_suggested_price||product.preco)]].map(([label,value])=><Card key={label} className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-lg font-bold text-slate-900">{value}</p></Card>)}
    </div>
    {product.supplier_rejection_reason&&<Card><div className="p-5"><p className="text-sm font-semibold text-red-700">Review feedback</p><p className="mt-2 text-sm text-slate-600">{String(product.supplier_rejection_reason)}</p></div></Card>}
    <Card><div className="space-y-4 p-6"><div><p className="text-sm font-semibold text-slate-900">Description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{String(product.descricao||"")}</p></div><div><p className="text-sm font-semibold text-slate-900">Checkout</p><a href={String(product.checkout_url)} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-blue-600">{String(product.checkout_url)}</a></div></div></Card>
  </div></AppShell>;
}
