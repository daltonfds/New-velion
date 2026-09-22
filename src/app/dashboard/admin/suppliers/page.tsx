"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Store,
  XCircle,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  AdminSupplier,
  getAdminSuppliers,
} from "@/lib/newvelion-api";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSuppliers() {
    try {
      setLoading(true);
      setError("");
      setSuppliers(await getAdminSuppliers());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load suppliers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesStatus =
        status === "all" ||
        String(supplier.status || "active") === status;

      const matchesSearch =
        !query ||
        String(supplier.full_name || "").toLowerCase().includes(query) ||
        String(supplier.email || "").toLowerCase().includes(query) ||
        String(supplier.country || "").toLowerCase().includes(query) ||
        String(supplier.id || "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [suppliers, search, status]);

  const totalProducts = suppliers.reduce(
    (sum, supplier) => sum + Number(supplier.products_count || 0),
    0
  );

  const totalSales = suppliers.reduce(
    (sum, supplier) => sum + Number(supplier.sales_count || 0),
    0
  );

  const totalRevenue = suppliers.reduce(
    (sum, supplier) => sum + Number(supplier.revenue || 0),
    0
  );

  return (
    <DashboardShell
      area="admin"
      activeKey="suppliers"
      title="Suppliers"
      subtitle="Manage suppliers and their marketplace operations"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>

            <h1 className="text-2xl font-bold text-slate-950">
              Suppliers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Live supplier accounts from the database.
            </p>
          </div>

          <button
            onClick={loadSuppliers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle size={18} />
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Suppliers", suppliers.length],
            [
              "Active Suppliers",
              suppliers.filter(
                (supplier) =>
                  !supplier.status || supplier.status === "active"
              ).length,
            ],
            ["Products Listed", totalProducts],
            [`Supplier Revenue`, `R ${totalRevenue.toLocaleString()}`],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{String(label)}</p>
              <p className="mt-3 text-2xl font-bold text-slate-950">
                {String(value)}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search supplier by name, email, country or ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2
                size={28}
                className="animate-spin text-blue-600"
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <Store size={32} className="text-slate-300" />

              <h3 className="mt-3 font-semibold text-slate-900">
                No suppliers found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No live supplier accounts match your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {[
                      "Supplier",
                      "Country",
                      "Products",
                      "Sales",
                      "Revenue",
                      "Status",
                    ].map((head) => (
                      <th
                        key={head}
                        className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <Store size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {supplier.full_name ||
                                "Unnamed supplier"}
                            </p>

                            <p className="text-xs text-slate-500">
                              {supplier.email || supplier.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {supplier.country || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                          <Package size={15} className="text-slate-400" />
                          {Number(
                            supplier.products_count || 0
                          ).toLocaleString()}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {Number(
                          supplier.sales_count || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        R{" "}
                        {Number(
                          supplier.revenue || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                          {supplier.status || "active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{filtered.length} suppliers displayed</span>
          <span>
            {totalSales.toLocaleString()} total sales · Live platform data
          </span>
        </div>
      </div>
    </DashboardShell>
  );
}
