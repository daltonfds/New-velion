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
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Records</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {rows.length}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
            />

            <button
              onClick={() => void load()}
              disabled={loading}
              className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading live data...
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {keys.map((key) => (
                      <th
                        key={key}
                        className="px-5 py-3 font-semibold text-slate-600"
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
                      className="border-b border-slate-100 last:border-0"
                    >
                      {keys.map((key) => (
                        <td
                          key={key}
                          className="max-w-[280px] px-5 py-4 text-slate-700"
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
        </div>
      </div>
    </DashboardShell>
  );
}
