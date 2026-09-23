"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FolderTree,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  AdminCategory,
  getAdminCategories,
} from "@/lib/newvelion-api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");
      setCategories(await getAdminCategories());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter(
      (category) =>
        String(category.name_en || "")
          .toLowerCase()
          .includes(query) ||
        String(category.name_pt || "")
          .toLowerCase()
          .includes(query) ||
        String(category.slug || "")
          .toLowerCase()
          .includes(query)
    );
  }, [categories, search]);

  const active = categories.filter(
    (category) => category.active !== false
  ).length;

  return (
    <DashboardShell
      area="admin"
      activeKey="categories"
      title="Categories"
      subtitle="Manage marketplace product categories"
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
              Categories
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Marketplace categories.
            </p>
          </div>

          <button
            onClick={loadCategories}
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

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total Categories", categories.length],
            ["Active Categories", active],
            ["Hidden Categories", categories.length - active],
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
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category name or slug..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
            />
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
              <FolderTree size={32} className="text-slate-300" />
              <h3 className="mt-3 font-semibold text-slate-900">
                No categories found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                No categories match your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {["Category", "Portuguese", "Slug", "Status", "Created"].map(
                      (head) => (
                        <th
                          key={head}
                          className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                        >
                          {head}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FolderTree size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {category.name_en || "Unnamed category"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {category.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {category.name_pt || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {category.slug || "—"}
                      </td>

                      <td className="px-5 py-4">
                        {category.active !== false ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={13} />
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            Hidden
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {category.created_at
                          ? new Date(
                              category.created_at
                            ).toLocaleDateString()
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
          {filtered.length} categories displayed · Connected to live platform
          data
        </div>
      </div>
    </DashboardShell>
  );
}
