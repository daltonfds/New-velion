"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  SupplierOrdersScreen,
  SUPPLIER_NAV,
  withActive,
  type Tone,
} from "@/components/ui-kit/newvelion-ui";
import { supplierFetch } from "@/lib/supplier-client";

type Order = {
  id: string;
  status: string;
  total: number;
  currency: string;
  customer: Record<string, unknown>;
  shipping_address: Record<string, unknown>;
  tracking_number: string | null;
  carrier: string | null;
  tracking_url: string | null;
  created_at: string;
};

const nextActions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped"],
  shipped: ["in_transit"],
  in_transit: ["delivered", "failed"],
  failed: ["processing"],
};

function statusTone(status: string): Tone {
  if (["delivered", "completed", "paid"].includes(status)) return "success";
  if (["cancelled", "failed"].includes(status)) return "danger";
  if (["pending", "processing", "packed"].includes(status)) return "warning";
  return "info";
}

export default function SupplierOrdersPage() {
  const pathname = usePathname();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await supplierFetch<{ data: Order[] }>("/api/supplier/orders");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function advance(order: Order, status: string) {
    setBusy(order.id);
    setError("");
    try {
      await supplierFetch("/api/supplier/orders/" + order.id + "/status", {
        method: "PATCH",
        body: JSON.stringify({
          status,
          tracking_number: order.tracking_number,
          carrier: order.carrier,
          tracking_url: order.tracking_url,
        }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update order.");
    } finally {
      setBusy("");
    }
  }

  const counts = useMemo(() => ({
    total: orders.length,
    active: orders.filter((order) => !["delivered", "cancelled", "failed"].includes(order.status)).length,
    shipped: orders.filter((order) => ["shipped", "in_transit"].includes(order.status)).length,
  }), [orders]);

  const rows = orders.map((order) => {
    const customer = order.customer || {};
    const address = order.shipping_address || {};
    const destination = [address.city, address.province, address.country]
      .filter((value) => typeof value === "string" && value.trim())
      .join(", ");
    const actions = (nextActions[order.status] || []).map((status) => (
      <button
        key={status}
        type="button"
        disabled={busy === order.id}
        onClick={() => void advance(order, status)}
        className="rounded-lg border border-ink-300 bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 disabled:opacity-50"
      >
        {busy === order.id ? "Updating…" : status.replaceAll("_", " ")}
      </button>
    ));

    return {
      id: order.id,
      ref: "#" + order.id.slice(0, 8).toUpperCase(),
      product: "—",
      destination: destination || String(customer.name || customer.full_name || "Customer"),
      status: { tone: statusTone(order.status), label: order.status.replaceAll("_", " ") },
      action: <div className="flex flex-wrap gap-2">{actions}</div>,
    };
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="ml-auto rounded-lg border border-ink-300 bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <SupplierOrdersScreen
        frame={{ nav: withActive(SUPPLIER_NAV, pathname), initial: "S" }}
        title="Orders & fulfillment"
        subtitle="Process orders assigned to your products and keep customers updated."
        kpis={[
          { label: "All orders", value: counts.total, note: "Orders assigned to your account" },
          { label: "In progress", value: counts.active, note: "Orders requiring fulfillment" },
          { label: "In transit", value: counts.shipped, note: "Orders handed to a carrier" },
        ]}
        head={["Order", "Product", "Destination", "Status", "Next action"]}
        orders={rows}
        loading={loading}
        emptyText="No orders are waiting for fulfillment."
      />
    </>
  );
}
