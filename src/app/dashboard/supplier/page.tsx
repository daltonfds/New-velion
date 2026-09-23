"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, Wallet, TrendingUp } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getSupplierMetrics } from "@/lib/newvelion-api";

type Metrics = {
  summary?: {
    products?: number;
    activeProducts?: number;
    sales?: number;
    revenue?: number;
    currency?: string;
  };
  products?: Array<{
    id: string;
    name_en?: string | null;
    name_pt?: string | null;
    price?: number | null;
    currency?: string | null;
    stock?: number | null;
    status?: string | null;
  }>;
};

export default function SupplierDashboardPage() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const result = await getSupplierMetrics();
      setData(result as Metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load supplier data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const summary = data?.summary;

  const cards = [
    {
      label: "Products",
      value: summary?.products ?? 0,
      icon: Package,
    },
    {
      label: "Active Products",
      value: summary?.activeProducts ?? 0,
      icon: TrendingUp,
    },
    {
      label: "Sales",
      value: summary?.sales ?? 0,
      icon: ShoppingCart,
    },
    {
      label: "Revenue",
      value: `R ${Number(summary?.revenue ?? 0).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
      })}`,
      icon: Wallet,
    },
  ];

  return (
    <DashboardShell
      area="supplier"
      activeKey="dashboard"
      title="Supplier Dashboard"
      subtitle="Manage your products, sales and supplier performance."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Live supplier data</p>
            <h1 className="text-2xl font-bold text-slate-950">
              Your business overview
            </h1>
          </div>

          <button
            onClick={() => void load()}
            disabled={loading}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>

                <p className="mt-5 text-sm text-slate-500">{card.label}</p>

                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {loading ? "—" : card.value}
                </p>
              </div>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-slate-950">My Products</h2>
            <p className="mt-1 text-sm text-slate-500">
              Products connected to your supplier account.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading products...
            </div>
          ) : !data?.products?.length ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-slate-600">
                      Product
                    </th>
                    <th className="px-5 py-3 font-semibold text-slate-600">
                      Price
                    </th>
                    <th className="px-5 py-3 font-semibold text-slate-600">
                      Stock
                    </th>
                    <th className="px-5 py-3 font-semibold text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {product.name_en || product.name_pt || "Unnamed product"}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        R{" "}
                        {Number(product.price ?? 0).toLocaleString("en-ZA", {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {product.stock ?? "Unlimited"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                          {product.status || "active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
