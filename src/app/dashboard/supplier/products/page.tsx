"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supplierFetch } from "@/lib/supplier-client";

type Product = { id: string; nome: string; preco: number; moeda: string; estoque: number; reserved_estoque: number; supplier_status: string; supplier_rejection_reason: string | null };

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const load = () => supplierFetch<{ data: Product[] }>("/api/supplier/products").then((r) => setProducts(r.data)).catch((e) => setError(e instanceof Error ? e.message : "Failed to load products."));

  useEffect(() => { void load(); }, []);

  async function submit(id: string) {
    setError("");
    try { await supplierFetch("/api/supplier/products/" + id, { method: "PATCH", body: JSON.stringify({ action: "submit" }) }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not submit product."); }
  }

  const visible = filter === "all" ? products : products.filter((item) => item.supplier_status === filter);

  return (
    <AppShell area="supplier">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><h1 className="text-2xl font-bold text-[#16294F]">Products</h1><p className="mt-1 text-sm text-slate-500">Create products and submit them for NewVelion approval.</p></div>
          <Link href="/dashboard/supplier/products/new" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Add product</Link>
        </div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <div className="flex flex-wrap gap-2">
          {["all","draft","pending_review","approved","rejected","suspended"].map((item) => <button key={item} onClick={() => setFilter(item)} className={"rounded-lg border px-3 py-2 text-sm " + (filter === item ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600")}>{item.replace("_"," ")}</button>)}
        </div>
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-slate-100">
            {visible.map((product) => (
              <div key={product.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div><Link href={"/dashboard/supplier/products/" + product.id} className="font-semibold text-slate-900 hover:text-blue-600">{product.nome}</Link><p className="text-sm text-slate-500">{product.preco} {product.moeda} · {product.estoque - product.reserved_estoque} available</p>{product.supplier_rejection_reason && <p className="mt-1 text-xs text-red-600">{product.supplier_rejection_reason}</p>}</div>
                <div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{product.supplier_status}</span>{["draft","rejected"].includes(product.supplier_status) && <button onClick={() => void submit(product.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Submit review</button>}</div>
              </div>
            ))}
            {visible.length === 0 && <div className="px-5 py-14 text-center text-sm text-slate-500">No products in this state.</div>}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
