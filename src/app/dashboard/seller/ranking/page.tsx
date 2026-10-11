"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

type RankingEntry = {
  seller_id: string;
  seller_name: string;
  country_code: string | null;
  sales_count: number;
  monthly_sales: number;
  monthly_commission: number;
  rank_position: number;
};

type LeaderboardData = {
  month_start: string;
  country_code: string | null;
  platform: RankingEntry[];
  country: RankingEntry[];
  country_leaders: RankingEntry[];
};

const money = (value: number) =>
  `R${new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)}`;

function RankingList({ title, subtitle, rows }: {
  title: string;
  subtitle: string;
  rows: RankingEntry[];
}) {
  return (
    <Card className="border border-blue-100 bg-white p-5 shadow-none">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#001B44]">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg bg-[#F7F8FA] p-4 text-sm text-slate-500">
          No confirmed sales recorded this month yet.
        </p>
      ) : (
        <ol className="space-y-3">
          {rows.map((row) => (
            <li key={row.seller_id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${row.rank_position === 1 ? "bg-[#FFB800] text-[#001B44]" : "bg-[#EAF3FF] text-[#003B95]"}`}>
                {row.rank_position}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{row.seller_name}</p>
                  <span className="text-xs text-slate-500">{row.country_code || "Country not set"}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {row.sales_count} {row.sales_count === 1 ? "confirmed sale" : "confirmed sales"}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-[#F7FAFF] px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Sales value</p>
                    <p className="mt-1 text-sm font-bold text-[#003B95]">{money(row.monthly_sales)}</p>
                  </div>
                  <div className="rounded-lg bg-[#F0FDF4] px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Commission</p>
                    <p className="mt-1 text-sm font-bold text-[#18794E]">{money(row.monthly_commission)}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default function SellerRankingPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadRanking = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Please sign in again to view the seller rankings.");
        setData(null);
        return;
      }
      const response = await fetch("/api/seller/leaderboards", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
      setData(result as LeaderboardData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load seller rankings.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadRanking(); }, [loadRanking]);

  const monthLabel = data?.month_start
    ? new Date(data.month_start).toLocaleDateString("en-ZA", { month: "long", year: "numeric", timeZone: "UTC" })
    : "This month";

  return (
    <AppShell area="seller" title="Seller ranking" subtitle="Monthly rankings across Newvelion and by country.">
      <main className="min-h-screen bg-[#F5F8FC]">
        <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8 lg:py-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-[#003B95]">Performance</p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#001B44]">Seller ranking</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#60708A]">
                See the top sellers in each country and across the Newvelion platform, based on confirmed sales for {monthLabel}.
              </p>
            </div>
            <button onClick={() => void loadRanking()} disabled={loading} className="inline-flex h-10 items-center justify-center rounded-lg border border-[#003B95] px-4 text-sm font-semibold text-[#003B95] hover:bg-[#EAF3FF] disabled:opacity-50">
              {loading ? "Refreshing…" : "Refresh ranking"}
            </button>
          </div>

          {error && (
            <div role="alert" className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center">
              <p>Ranking temporarily unavailable: {error}</p>
              <button onClick={() => void loadRanking()} className="font-semibold underline">Try again</button>
            </div>
          )}

          {loading && !data ? (
            <Card className="border border-blue-100 bg-white p-6 shadow-none">
              <p className="text-sm text-slate-500">Loading seller rankings…</p>
            </Card>
          ) : data ? (
            <>
              <div className="mb-5 grid gap-4 sm:grid-cols-3">
                <Card className="border border-blue-100 bg-white p-5 shadow-none">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Platform leaderboard</p>
                  <p className="mt-2 text-2xl font-bold text-[#003B95]">{data.platform.length}</p>
                  <p className="mt-1 text-sm text-slate-500">Ranked sellers this month</p>
                </Card>
                <Card className="border border-blue-100 bg-white p-5 shadow-none">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Country leaders</p>
                  <p className="mt-2 text-2xl font-bold text-[#003B95]">{data.country_leaders.length}</p>
                  <p className="mt-1 text-sm text-slate-500">Countries with confirmed sales</p>
                </Card>
                <Card className="border border-blue-100 bg-white p-5 shadow-none">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your country</p>
                  <p className="mt-2 text-2xl font-bold text-[#003B95]">{data.country_code || "—"}</p>
                  <p className="mt-1 text-sm text-slate-500">{data.country.length ? `Your country's top ${data.country.length} sellers` : "No country ranking available yet"}</p>
                </Card>
              </div>
              <div className="grid items-start gap-5 xl:grid-cols-2">
                <RankingList title="Newvelion platform ranking" subtitle={`Top sellers · ${monthLabel}`} rows={data.platform} />
                <RankingList title="Best seller in each country" subtitle="Monthly country leaders" rows={data.country_leaders} />
                <div className="xl:col-span-2">
                  <RankingList title={`Ranking in your country${data.country_code ? ` · ${data.country_code}` : ""}`} subtitle={`Country leaderboard · ${monthLabel}`} rows={data.country} />
                </div>
              </div>
            </>
          ) : !error ? (
            <Card className="border border-blue-100 bg-white p-6 shadow-none">
              <p className="text-sm text-slate-500">No ranking data is available yet.</p>
            </Card>
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}
