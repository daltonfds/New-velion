"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileCheck2,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getAdminStats, type AdminStats } from "@/lib/newvelion-api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStats() {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const counts = stats?.counts;

  const cards = [
    {
      label: "Total Users",
      value: counts?.profiles,
      icon: Users,
      href: "/dashboard/admin/users",
    },
    {
      label: "Products",
      value: counts?.products,
      icon: Package,
      href: "/dashboard/admin/products",
    },
    {
      label: "Sales",
      value: counts?.sales,
      icon: ShoppingCart,
      href: "/dashboard/admin/transactions",
    },
    {
      label: "Commissions",
      value: counts?.commissions,
      icon: DollarSign,
      href: "/dashboard/admin/commissions",
    },
  ];

  const operational = [
    {
      label: "Withdrawals",
      value: counts?.withdrawals,
      icon: Wallet,
      href: "/dashboard/admin/withdrawals",
    },
    {
      label: "Disputes",
      value: counts?.disputes,
      icon: AlertTriangle,
      href: "/dashboard/admin/disputes",
    },
    {
      label: "KYC Submissions",
      value: counts?.kyc_submissions,
      icon: FileCheck2,
      href: "/dashboard/admin/kyc",
    },
    {
      label: "Analytics Events",
      value: counts?.analytics_events,
      icon: Activity,
      href: "/dashboard/admin/analytics",
    },
  ];

  return (
    <DashboardShell
      area="admin"
      activeKey="dashboard"
      title="Admin Dashboard"
      subtitle="Manage and monitor the NewVelion marketplace."
    >
      <div className="space-y-6">
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                <BarChart3 className="h-3.5 w-3.5" />
                Live platform overview
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Platform control center
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Real-time information from your NewVelion database.
              </p>
            </div>

            <button
              onClick={loadStats}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <h2 className="font-bold text-red-900">
                  Could not load dashboard
                </h2>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  onClick={loadStats}
                  className="mt-3 text-sm font-bold text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.label}
                href={card.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-slate-100 p-2.5">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-700" />
                </div>

                <p className="mt-5 text-sm text-slate-500">{card.label}</p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  {loading
                    ? "—"
                    : typeof card.value === "number"
                      ? card.value.toLocaleString()
                      : "0"}
                </p>
              </Link>
            );
          })}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div>
            <h2 className="font-bold text-slate-950">Platform operations</h2>
            <p className="mt-1 text-sm text-slate-500">
              Live records currently stored in NewVelion.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {operational.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-slate-600" />
                    <ArrowUpRight className="h-4 w-4 text-slate-300" />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-950">
                    {loading
                      ? "—"
                      : typeof item.value === "number"
                        ? item.value.toLocaleString()
                        : "0"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Link
            href="/dashboard/admin/users"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
          >
            <Users className="h-5 w-5 text-slate-600" />
            <h2 className="mt-4 font-bold text-slate-950">User Management</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Manage sellers, suppliers and administrator accounts.
            </p>
          </Link>

          <Link
            href="/dashboard/admin/products"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
          >
            <Package className="h-5 w-5 text-slate-600" />
            <h2 className="mt-4 font-bold text-slate-950">
              Marketplace Control
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Review products and control marketplace availability.
            </p>
          </Link>

          <Link
            href="/dashboard/admin/analytics"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
          >
            <BarChart3 className="h-5 w-5 text-slate-600" />
            <h2 className="mt-4 font-bold text-slate-950">
              Analytics
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Inspect platform events and performance data.
            </p>
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5">
              <CheckCircle2 className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Database connection
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Dashboard statistics are loaded from the authenticated
                NewVelion API and Supabase database. No demo statistics are
                used on this page.
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                {loading ? (
                  <>
                    <Clock3 className="h-3.5 w-3.5" />
                    Loading live data
                  </>
                ) : error ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Connection error
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Live data connected
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
