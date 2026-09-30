"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";

interface AdminStats {
  users_total: number;
  active_products: number;
  sales_total: number;
  withdrawals_total: number;
  pending_withdrawals: number;
  revenue_total: number;
  sales_today: number;
  sales_month: number;
  active_sellers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      setLoading(true);
      setError("");

      const { data, error: statsError } =
        await supabase.rpc("admin_stats");

      if (!mounted) return;

      if (statsError) {
        setError(statsError.message);
        setStats(null);
        setLoading(false);
        return;
      }

      const value = (data ?? {}) as Partial<AdminStats>;

      setStats({
        users_total: Number(value.users_total ?? 0),
        active_products: Number(value.active_products ?? 0),
        sales_total: Number(value.sales_total ?? 0),
        withdrawals_total: Number(value.withdrawals_total ?? 0),
        pending_withdrawals: Number(value.pending_withdrawals ?? 0),
        revenue_total: Number(value.revenue_total ?? 0),
        sales_today: Number(value.sales_today ?? 0),
        sales_month: Number(value.sales_month ?? 0),
        active_sellers: Number(value.active_sellers ?? 0),
      });

      setLoading(false);
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    ["Users", stats?.users_total ?? 0],
    ["Active Products", stats?.active_products ?? 0],
    ["Sales", stats?.sales_total ?? 0],
    ["Withdrawals", stats?.withdrawals_total ?? 0],
  ] as const;

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage Newvelion and monitor platform activity.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {loading ? "—" : value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Active Sellers</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {loading ? "—" : stats?.active_sellers.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Sales Today</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {loading ? "—" : stats?.sales_today.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Pending Withdrawals</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {loading ? "—" : stats?.pending_withdrawals.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
