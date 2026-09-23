"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  Download,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  AdminCommission,
  getAdminCommissions,
} from "@/lib/newvelion-api";

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<AdminCommission[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCommissions() {
    try {
      setLoading(true);
      setError("");
      setCommissions(await getAdminCommissions());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load commissions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCommissions();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return commissions.filter((commission) => {
      const matchesStatus =
        status === "all" ||
        String(commission.status || "").toLowerCase() === status;

      const matchesSearch =
        !query ||
        String(commission.id || "").toLowerCase().includes(query) ||
        String(commission.affiliate_id || "")
          .toLowerCase()
          .includes(query) ||
        String(commission.product_id || "")
          .toLowerCase()
          .includes(query) ||
        String(commission.sale_id || "")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [commissions, search, status]);

  const totalGenerated = commissions.reduce(
    (sum, commission) => sum + Number(commission.amount || 0),
    0
  );

  const available = commissions
    .filter(
      (commission) =>
        String(commission.status || "").toLowerCase() === "available"
    )
    .reduce((sum, commission) => sum + Number(commission.amount || 0), 0);

  const pending = commissions
    .filter(
      (commission) =>
        String(commission.status || "").toLowerCase() === "pending"
    )
    .reduce((sum, commission) => sum + Number(commission.amount || 0), 0);

  const paid = commissions
    .filter(
      (commission) =>
        String(commission.status || "").toLowerCase() === "paid"
    )
    .reduce((sum, commission) => sum + Number(commission.amount || 0), 0);

  function exportCsv() {
    const headers = [
      "ID",
      "Affiliate",
      "Supplier",
      "Product",
      "Sale",
      "Rate",
      "Sale Amount",
      "Commission",
      "Currency",
      "Status",
      "Created",
    ];

    const rows = filtered.map((commission) => [
      commission.id,
      commission.affiliate_id || "",
      commission.supplier_id || "",
      commission.product_id || "",
      commission.sale_id || "",
      commission.rate || 0,
      commission.sale_amount || 0,
      commission.amount || 0,
      commission.currency || "",
      commission.status || "",
      commission.created_at || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "newvelion-commissions.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <DashboardShell
      area="admin"
      activeKey="commissions"
      title="Commissions"
      subtitle="Monitor affiliate commissions across the platform"
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
              Commissions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Your affiliate commission activity.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              onClick={loadCommissions}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle size={18} />
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Generated", totalGenerated],
            ["Available", available],
            ["Pending", pending],
            ["Paid", paid],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {String(label)}
              </p>

              <p className="mt-3 text-2xl font-bold text-slate-950">
                R {Number(value).toLocaleString()}
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
                placeholder="Search commission, affiliate, product or sale..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="available">Available</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
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
              <DollarSign size={32} className="text-slate-300" />

              <h3 className="mt-3 font-semibold text-slate-900">
                No commissions found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No commissions match your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {[
                      "Commission",
                      "Affiliate",
                      "Product",
                      "Sale",
                      "Rate",
                      "Commission",
                      "Status",
                      "Date",
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
                  {filtered.map((commission) => (
                    <tr
                      key={commission.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {commission.id}
                        </p>
                        <p className="text-xs text-slate-500">
                          {commission.currency || "ZAR"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {commission.affiliate_id || "—"}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {commission.product_id || "—"}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {commission.sale_id || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {Number(commission.rate || 0)}%
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-900">
                        {commission.currency || "ZAR"}{" "}
                        {Number(
                          commission.amount || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                          {commission.status || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {commission.created_at
                          ? new Date(
                              commission.created_at
                            ).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-sm text-slate-500">
          {filtered.length} commissions displayed · Connected to live
          platform data
        </div>
      </div>
    </DashboardShell>
  );
}
