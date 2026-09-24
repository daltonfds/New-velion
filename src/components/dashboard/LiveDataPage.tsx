"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";

type Row = Record<string, unknown>;

type Props = {
  area: "seller" | "supplier" | "admin";
  activeKey: Parameters<typeof DashboardShell>[0]["activeKey"];
  title: string;
  subtitle: string;
  loader: () => Promise<unknown>;
  columns?: string[];
};

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  const text = String(value);

  if (text.length > 80) {
    return `${text.slice(0, 77)}...`;
  }

  return text;
}

function normalizeRows(value: unknown): Row[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is Row =>
        typeof item === "object" && item !== null && !Array.isArray(item)
    );
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return ((value as { data: unknown[] }).data).filter(
      (item): item is Row =>
        typeof item === "object" && item !== null && !Array.isArray(item)
    );
  }

  if (value && typeof value === "object") {
    return [value as Row];
  }

  return [];
}

export default function LiveDataPage({
  area,
  activeKey,
  title,
  subtitle,
  loader,
  columns,
}: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await loader();
      setRows(normalizeRows(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return rows;

    return rows.filter((row) =>
      Object.values(row).some((value) =>
        formatValue(value).toLowerCase().includes(query)
      )
    );
  }, [rows, search]);

  const keys = useMemo(() => {
    if (columns?.length) return columns;

    const set = new Set<string>();

    rows.slice(0, 30).forEach((row) => {
      Object.keys(row).forEach((key) => set.add(key));
    });

    return Array.from(set).slice(0, 8);
  }, [rows, columns]);

  return (
    <DashboardShell
      area={area}
      activeKey={activeKey}
      title={title}
      subtitle={subtitle}
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] bg-[#3B2FE0] p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
            NewVelion Seller
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome to NewVelion
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
            Discover products, promote offers, generate affiliate links and
            grow your sales from one workspace.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/marketplace"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#3B2FE0] hover:bg-white/90"
            >
              Explore marketplace
            </a>

            <a
              href="/dashboard/seller/products"
              className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              My products
            </a>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#ececf3] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#9CA3AF]">Live records</p>
            <p className="mt-2 text-3xl font-extrabold text-[#1A1A2E]">
              {rows.length}
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Live data from NewVelion
            </p>
          </div>

          <div className="rounded-2xl border border-[#ececf3] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#9CA3AF]">Workspace</p>
            <p className="mt-2 text-3xl font-extrabold text-[#1A1A2E]">
              Seller
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Affiliate commerce
            </p>
          </div>

          <div className="rounded-2xl border border-[#ececf3] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#9CA3AF]">Currency</p>
            <p className="mt-2 text-3xl font-extrabold text-[#1A1A2E]">
              ZAR
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              South African Rand
            </p>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#ececf3] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#f0f0f5] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B2FE0]">
                Live data
              </p>

              <h3 className="mt-1 text-xl font-extrabold text-[#1A1A2E]">
                {title}
              </h3>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search..."
                className="h-11 rounded-xl border border-[#e7e7ef] bg-[#F5F6F8] px-4 text-sm text-[#1A1A2E] outline-none focus:border-[#3B2FE0] focus:bg-white"
              />

              <button
                onClick={() => void load()}
                disabled={loading}
                className="h-11 rounded-xl bg-[#3B2FE0] px-5 text-sm font-bold text-white hover:bg-[#3025C0] disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-sm text-[#9CA3AF]">
              Loading live data...
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-[#1A1A2E]">No data found</p>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                Your live Seller data will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-[#f0f0f5] bg-[#F8F8FB]">
                  <tr>
                    {keys.map((key) => (
                      <th
                        key={key}
                        className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]"
                      >
                        {key.replaceAll("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {visibleRows.map((row, index) => (
                    <tr
                      key={String(row.id ?? index)}
                      className="border-b border-[#f5f5f8] last:border-0 hover:bg-[#FAFAFC]"
                    >
                      {keys.map((key) => (
                        <td
                          key={key}
                          className="max-w-[280px] px-5 py-4 text-[#4B5563]"
                        >
                          {formatValue(row[key])}
                        </td>
                      ))}
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
