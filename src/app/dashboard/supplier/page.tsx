"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supplierFetch } from "@/lib/supplier-client";

type Product = { id: string; nome: string; estoque: number; reserved_estoque: number; supplier_status: string; created_at: string };
type Order = { id: string; status: string; total: number; currency: string; created_at: string };

export default function SupplierDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      supplierFetch<{ data: Product[] }>("/api/supplier/products"),
      supplierFetch<{ data: Order[] }>("/api/supplier/orders?limit=100"),
    ]).then(([productResult, orderResult]) => {
      setProducts(productResult.data);
      setOrders(orderResult.data);
    }).catch((err) => setError(err instanceof Error ? err.message : "Could not load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const approved = products.filter((item) => item.supplier_status === "approved").length;
  const pending = products.filter((item) => item.supplier_status === "pending_review").length;
  const lowStock = products.filter((item) => item.estoque - item.reserved_estoque <= 5).length;
  const openOrders = orders.filter((item) => !["delivered", "cancelled", "returned"].includes(item.status)).length;
  const revenue = orders.reduce((sum, item) => sum + Number(item.total || 0), 0);

  return (
    <AppShell area="supplier">
      <div className="space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Supplier Center</p>
            <h1 className="mt-2 text-3xl font-bold text-[#16294F]">Your commerce operation</h1>
            <p className="mt-2 text-sm text-slate-500">Manage products, inventory and fulfillment from one place.</p>
          </div>
          <Link href="/dashboard/supplier/products/new" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Add product</Link>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Products", products.length],
            ["Approved", approved],
            ["Pending review", pending],
            ["Open orders", openOrders],
            ["Order value", revenue.toLocaleString()],
          ].map(([label, value]) => (
            <Card key={String(label)} className="p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "—" : value}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div><h2 className="font-semibold text-slate-900">Products</h2><p className="text-xs text-slate-500">{lowStock} low-stock items</p></div>
              <Link href="/dashboard/supplier/products" className="text-sm font-semibold text-blue-600">View all</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {products.slice(0, 5).map((product) => (
                <Link key={product.id} href={"/dashboard/supplier/products/" + product.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
                  <div><p className="font-medium text-slate-900">{product.nome}</p><p className="text-xs text-slate-500">{product.supplier_status}</p></div>
                  <span className="text-sm text-slate-600">{product.estoque - product.reserved_estoque} available</span>
                </Link>
              ))}
              {!loading && products.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-500">No products yet.</div>}
            </div>
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div><h2 className="font-semibold text-slate-900">Recent orders</h2><p className="text-xs text-slate-500">Fulfillment queue</p></div>
              <Link href="/dashboard/supplier/orders" className="text-sm font-semibold text-blue-600">View all</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between px-5 py-4">
                  <div><p className="font-medium text-slate-900">#{order.id.slice(0, 8)}</p><p className="text-xs text-slate-500">{order.status}</p></div>
                  <span className="text-sm font-semibold text-slate-900">{Number(order.total).toLocaleString()} {order.currency}</span>
                </div>
              ))}
              {!loading && orders.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-500">No fulfillment orders yet.</div>}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
