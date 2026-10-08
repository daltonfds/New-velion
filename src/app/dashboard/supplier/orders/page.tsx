"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supplierFetch } from "@/lib/supplier-client";

type Order = { id: string; status: string; total: number; currency: string; customer: Record<string, unknown>; shipping_address: Record<string, unknown>; tracking_number: string | null; carrier: string | null; tracking_url: string | null; created_at: string };

const nextActions: Record<string, string[]> = { pending: ["confirmed","cancelled"], confirmed: ["processing","cancelled"], processing: ["packed","cancelled"], packed: ["shipped"], shipped: ["in_transit"], in_transit: ["delivered","failed"], failed: ["processing"] };

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const load = () => supplierFetch<{ data: Order[] }>("/api/supplier/orders").then((r) => setOrders(r.data)).catch((e) => setError(e instanceof Error ? e.message : "Failed to load orders."));

  useEffect(() => { void load(); }, []);

  async function advance(order: Order, status: string) {
    setBusy(order.id); setError("");
    try { await supplierFetch("/api/supplier/orders/" + order.id + "/status", { method: "PATCH", body: JSON.stringify({ status, tracking_number: order.tracking_number, carrier: order.carrier, tracking_url: order.tracking_url }) }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not update order."); }
    finally { setBusy(""); }
  }

  return (
    <AppShell area="supplier">
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-[#0A0440]">Orders & fulfillment</h1><p className="mt-1 text-sm text-slate-500">Process orders assigned to your products and keep customers updated.</p></div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <div className="space-y-4">
          {orders.map((order) => {
            const customer = order.customer || {};
            const address = order.shipping_address || {};
            return <Card key={order.id} className="p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#10069F]">Order #{order.id.slice(0,8)}</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{String(customer.name || customer.full_name || "Customer")}</h2>
                  <p className="mt-1 text-sm text-slate-500">{String(address.address || address.line1 || "")}, {String(address.city || "")}</p>
                  <p className="mt-3 font-semibold text-slate-900">{Number(order.total).toLocaleString()} {order.currency}</p>
                </div>
                <div className="lg:text-right"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#10069F]">{order.status}</span><p className="mt-2 text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</p></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {(nextActions[order.status] || []).map((status) => <button key={status} disabled={busy === order.id} onClick={() => void advance(order,status)} className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F7F8FA] disabled:opacity-50">{busy === order.id ? "Updating..." : status.replace("_"," ")}</button>)}
              </div>
              {order.tracking_number && <p className="mt-3 text-xs text-slate-500">Tracking: {order.tracking_number} · {order.carrier || "Carrier"}</p>}
            </Card>;
          })}
          {orders.length === 0 && <Card><div className="py-14 text-center text-sm text-slate-500">No orders are waiting for fulfillment.</div></Card>}
        </div>
      </div>
    </AppShell>
  );
}
