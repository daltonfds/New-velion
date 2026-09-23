"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Download,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  AdminTransaction,
  getAdminTransactions,
} from "@/lib/newvelion-api";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");
      setTransactions(await getAdminTransactions());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transactions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesType =
        type === "all" ||
        String(transaction.type || "").toLowerCase() === type;

      const matchesStatus =
        status === "all" ||
        String(transaction.status || "").toLowerCase() === status;

      const matchesSearch =
        !query ||
        String(transaction.id || "").toLowerCase().includes(query) ||
        String(transaction.user_id || "").toLowerCase().includes(query) ||
        String(transaction.description || "")
          .toLowerCase()
          .includes(query) ||
        String(transaction.reference_id || "")
          .toLowerCase()
          .includes(query);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [transactions, search, type, status]);

  const completed = transactions.filter(
    (transaction) =>
      String(transaction.status || "").toLowerCase() === "completed"
  );

  const pending = transactions.filter(
    (transaction) =>
      String(transaction.status || "").toLowerCase() === "pending"
  );

  const volume = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  );

  const completedVolume = completed.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  );

  const pendingAmount = pending.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  );

  function exportCsv() {
    const headers = [
      "ID",
      "User",
      "Type",
      "Direction",
      "Amount",
      "Currency",
      "Status",
      "Description",
      "Created",
    ];

    const rows = filtered.map((transaction) => [
      transaction.id,
      transaction.user_id || "",
      transaction.type || "",
      transaction.direction || "",
      transaction.amount || 0,
      transaction.currency || "",
      transaction.status || "",
      transaction.description || "",
      transaction.created_at || "",
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
    anchor.download = "newvelion-transactions.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <DashboardShell
      area="admin"
      activeKey="transactions"
      title="Transactions"
      subtitle="Monitor financial transactions across the platform"
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
              Transactions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Financial transactions.
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
              onClick={loadTransactions}
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
            ["Transaction Volume", volume],
            ["Completed Volume", completedVolume],
            ["Pending Amount", pendingAmount],
            ["Transactions", transactions.length],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {String(label)}
              </p>

              <p className="mt-3 text-2xl font-bold text-slate-950">
                {label === "Transactions"
                  ? String(value)
                  : `R ${Number(value).toLocaleString()}`}
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
                placeholder="Search transaction, user, reference or description..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-500"
            >
              <option value="all">All types</option>
              <option value="sale">Sale</option>
              <option value="commission">Commission</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="refund">Refund</option>
              <option value="payment">Payment</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
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
              <CreditCard size={32} className="text-slate-300" />

              <h3 className="mt-3 font-semibold text-slate-900">
                No transactions found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No transactions match your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {[
                      "Transaction",
                      "User",
                      "Type",
                      "Amount",
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
                  {filtered.map((transaction) => {
                    const direction =
                      String(transaction.direction || "").toLowerCase();

                    return (
                      <tr
                        key={transaction.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                              {direction === "out" ? (
                                <ArrowUpRight
                                  size={18}
                                  className="text-red-500"
                                />
                              ) : (
                                <ArrowDownLeft
                                  size={18}
                                  className="text-emerald-500"
                                />
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {transaction.description ||
                                  transaction.type ||
                                  "Transaction"}
                              </p>

                              <p className="text-xs text-slate-500">
                                {transaction.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {transaction.user_id || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                            {transaction.type || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-slate-900">
                          {transaction.currency || "ZAR"}{" "}
                          {Number(
                            transaction.amount || 0
                          ).toLocaleString()}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                            {transaction.status || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {transaction.created_at
                            ? new Date(
                                transaction.created_at
                              ).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-sm text-slate-500">
          {filtered.length} transactions displayed · Connected to live
          platform data
        </div>
      </div>
    </DashboardShell>
  );
}
