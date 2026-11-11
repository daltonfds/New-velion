"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Dialog from "@/components/ui/Dialog";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { supabase } from "@/lib/supabase";
import { getSellerFinancialSummary } from "@/lib/services/seller-financials";

type Sale = {
  id: string;
  vendido_em: string;
  status: string | null;
  valor_venda: number | null;
  comissao_vendedor: number | null;
  vendedor_id: string;
  product_id: string;
  product?: {
    nome: string;
    moeda: string;
  } | {
    nome: string;
    moeda: string;
  }[] | null;
};

const money = (value: number) =>
  `R${new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)}`;

export default function SellerDashboardPage() {
  const db = supabase;

  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [wallet, setWallet] = useState({
    disponivel: 0,
    retido: 0,
    reservado: 0,
    saldo_total: 0,
  });
  const [userName, setUserName] = useState("Seller");
  const [activationPopupOpen, setActivationPopupOpen] = useState(false);
  const [activationPopupKey, setActivationPopupKey] = useState("");
  const [goalTarget, setGoalTarget] = useState(10000);
  const [financialSummary, setFinancialSummary] = useState<Awaited<ReturnType<typeof getSellerFinancialSummary>> | null>(null);
  const [dailyPerformance, setDailyPerformance] = useState<
    { day: string; commission: number; sales_count: number; gross_sales: number }[]
  >([]);

  useEffect(() => {
    const savedGoal = Number(window.localStorage.getItem("newvelion-30day-commission-goal"));
    if (Number.isFinite(savedGoal) && savedGoal > 0) setGoalTarget(savedGoal);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: { session } } = await db.auth.getSession();
      const user = session?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const [
        { data: profile },
        { data: salesData },
        { data: dailyData, error: dailyError },
        financialSummary,
      ] = await Promise.all([
        supabase.from("profiles")
          .select("full_name,nome_completo,sales_activation_status,first_sale_at")
          .eq("id", user.id).maybeSingle(),
        supabase.from("sales")
          .select("id,vendido_em,status,valor_venda,comissao_vendedor,valor_garantia,vendedor_id,product_id")
          .eq("vendedor_id", user.id).order("vendido_em", { ascending: false }),
        supabase.rpc("get_seller_daily_performance", { p_vendedor_id: user.id, p_days: 30 }),
        getSellerFinancialSummary(user.id),
      ]);

      const name =
        profile?.full_name ||
        profile?.nome_completo ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Seller";

      setUserName(name);
      const activationKey = `newvelion-seller-activation-popup:${user.id}`;
      setActivationPopupKey(activationKey);
      if (profile?.sales_activation_status === "active" && profile?.first_sale_at && !window.localStorage.getItem(activationKey)) {
        window.localStorage.setItem(activationKey, "1");
        setActivationPopupOpen(true);
      }

      const canonicalWallet = {
        disponivel: Number(financialSummary.available_balance ?? 0),
        retido: Number(financialSummary.guarantee_retained ?? 0),
        reservado: Number(financialSummary.reserved ?? 0),
        saldo_total: Number(financialSummary.total_balance ?? 0),
      };

      setSales((salesData || []) as Sale[]);
      setWallet(canonicalWallet);
      setFinancialSummary(financialSummary);

      if (dailyError) {
        console.error("Seller daily performance:", dailyError);
        setDailyPerformance([]);
      } else {
        setDailyPerformance(
          (dailyData || []).map((row) => ({
            day: row.day,
            commission: Number(row.commission || 0),
            sales_count: Number(row.sales_count || 0),
            gross_sales: Number(row.gross_sales || 0),
          }))
        );
      }
      setLoading(false);
    }

    load();
  }, []);

  const recentSales = useMemo(
    () => [...sales].sort((a, b) => new Date(b.vendido_em || 0).getTime() - new Date(a.vendido_em || 0).getTime()),
    [sales]
  );

  const totalSales = financialSummary?.gross_sales ?? 0;
  const totalCommission = financialSummary?.commission_earned ?? 0;
  const totalBalance = financialSummary?.total_balance ?? 0;
  const commissionLast30Days = dailyPerformance.reduce((sum, item) => sum + item.commission, 0);
  const goalProgress = goalTarget > 0 ? Math.min(100, (commissionLast30Days / goalTarget) * 100) : 0;


  const chartPoints = useMemo(() => {
    const max = Math.max(
      ...dailyPerformance.map((item) => item.commission),
      1
    );

    return dailyPerformance.map((item, index) => ({
      ...item,
      x: (index / Math.max(dailyPerformance.length - 1, 1)) * 100,
      y: 100 - (item.commission / max) * 88,
    }));
  }, [dailyPerformance]);

  const chartPath = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");



  const peak = Math.max(...dailyPerformance.map((item) => item.commission), 0);
  const areaPath = chartPath ? `${chartPath} L 100 100 L 0 100 Z` : "";
  const statusVariant = (status: string | null) => {
    const value = (status || "").toLowerCase();
    if (["paga", "paid", "approved", "completed", "success"].includes(value)) return "success" as const;
    if (value === "reembolsada") return "warning" as const;
    if (value === "cancelada") return "danger" as const;
    return "info" as const;
  };

  return (
    <AppShell area="seller">
      <Dialog
        open={activationPopupOpen}
        onClose={() => { if (activationPopupKey) window.localStorage.setItem(activationPopupKey, "1"); setActivationPopupOpen(false); }}
        title="Congratulations — your account is active!"
        description="Your first confirmed sale has activated your Newvelion seller account. You can now continue growing your business."
        className="sm:max-w-md"
        footer={
          <Button onClick={() => { if (activationPopupKey) window.localStorage.setItem(activationPopupKey, "1"); setActivationPopupOpen(false); }}>
            Continue to dashboard
          </Button>
        }
      />

      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
              Welcome back, {userName}
            </h1>
            <p className="mt-1.5 text-sm text-ink-500">
              Sales, commission and wallet balance for the last 30 days.
            </p>
          </div>

          <Link
            href="/dashboard/seller/marketplace"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Browse marketplace
          </Link>
        </div>

        <p className="mb-3 mt-8 text-xs font-medium text-ink-500">Seller sales wallet · separate from affiliate rewards</p>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <Card className="p-6 md:col-span-2 xl:col-span-1">
            <p className="text-sm font-medium text-ink-500">Available balance</p>
            {loading ? (
              <Skeleton className="mt-4 h-10 w-40" />
            ) : (
              <p className="mt-3 text-4xl font-semibold text-ink-900">{money(wallet.disponivel)}</p>
            )}
            <p className="mt-2 text-sm text-ink-500">Ready for withdrawal</p>
            <Link
              href="/dashboard/seller/withdrawals"
              className="mt-5 inline-flex text-sm font-semibold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition duration-150"
            >
              Withdraw funds
            </Link>
          </Card>

          {[
            { label: "Pending balance", value: money(wallet.retido), note: "Guarantee currently retained" },
            { label: "Commission earned", value: money(totalCommission), note: "Confirmed commission from paid sales" },
            { label: "Paid sales", value: (financialSummary?.sales_count ?? 0).toString(), note: `${money(totalSales)} in sales revenue` },
          ].map((item) => (
            <Card key={item.label} className="p-5">
              <p className="text-sm font-medium text-ink-500">{item.label}</p>
              {loading ? (
                <Skeleton className="mt-4 h-8 w-28" />
              ) : (
                <p className="mt-3 text-2xl font-semibold text-ink-900">{item.value}</p>
              )}
              <p className="mt-1.5 text-xs text-ink-500">{item.note}</p>
            </Card>
          ))}
        </section>

        <section className="mt-8 grid items-start gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card className="p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-base font-semibold text-ink-900">Sales performance</h2>
                <p className="mt-1 text-sm text-ink-500">
                  Daily commission generated from paid sales over the last 30 days.
                </p>
              </div>

              <span className="rounded-md bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600">Live data</span>
            </div>

            <div className="mt-8">
              <div className="relative h-64 w-full pl-12">
                <span className="absolute left-0 top-0 text-xs text-ink-500">{money(peak)}</span>
                <span className="absolute bottom-0 left-0 text-xs text-ink-500">R0</span>
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={`Daily commission over the last 30 days, peak ${money(peak)}`}
                >
                  {[12, 34, 56, 78].map((y) => (
                    <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#E6E7EE" strokeWidth="0.35" />
                  ))}

                  {areaPath && <path d={areaPath} fill="#10069F" fillOpacity="0.07" />}

                  <path
                    d={chartPath}
                    fill="none"
                    stroke="#10069F"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />

                  {chartPoints.map((point) => (
                    <circle
                      key={point.day}
                      cx={point.x}
                      cy={point.y}
                      r="1.4"
                      fill="#FFFFFF"
                      stroke="#10069F"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    >
                      <title>{`${point.day}: ${money(point.commission)}`}</title>
                    </circle>
                  ))}
                </svg>
              </div>

              <div className="mt-3 flex justify-between pl-12 text-xs text-ink-500">
                {chartPoints
                  .filter((_, index) => [0, 5, 10, 15, 20, 25, 29].includes(index))
                  .map((point) => (
                    <span key={point.day}>
                      {new Date(`${point.day}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  ))}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand-600">30-day goal</p>
                  <h2 className="mt-1 text-base font-semibold text-ink-900">Commission progress</h2>
                </div>
                <label className="text-xs font-medium text-ink-500">
                  Target (R)
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={goalTarget}
                    onChange={(event) => {
                      const next = Math.max(1, Number(event.target.value) || 1);
                      setGoalTarget(next);
                      window.localStorage.setItem("newvelion-30day-commission-goal", String(next));
                    }}
                    className="mt-1 block min-h-10 w-28 rounded-lg border border-ink-300 px-3 text-sm font-semibold text-ink-900 transition-colors duration-150 hover:border-ink-400 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                    aria-label="30-day commission goal in rand"
                  />
                </label>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-3 text-sm">
                <span className="text-xl font-semibold text-ink-900">{money(commissionLast30Days)}</span>
                <span className="text-ink-500">{Math.round(goalProgress)}% of {money(goalTarget)}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-50" role="progressbar" aria-label="30-day commission goal progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(goalProgress)}>
                <div className="h-full rounded-full bg-brand-600 transition-[width] duration-300" style={{ width: `${goalProgress}%` }} />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-base font-semibold text-ink-900">Wallet position</h2>
              <p className="mt-1 text-sm text-ink-500">Current allocation of your account balance.</p>

              <div className="mt-6 space-y-4">
                {[
                  ["Available", wallet.disponivel, "bg-brand-600"],
                  ["Retained", wallet.retido, "bg-brand-300"],
                  ["Reserved", wallet.reservado, "bg-ink-300"],
                ].map(([label, value, color]) => {
                  const total = wallet.disponivel + wallet.retido + wallet.reservado;
                  const percent = total > 0 ? (Number(value) / total) * 100 : 0;

                  return (
                    <div key={String(label)}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="font-medium text-ink-600">{label}</span>
                        <span className="text-ink-900">{money(Number(value))}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-ink-200 pt-4">
                <span className="text-sm text-ink-500">Total balance</span>
                <span className="text-lg font-semibold text-ink-900">{money(totalBalance)}</span>
              </div>
            </Card>
          </div>
        </section>

        <section className="mt-8">
          <Card className="overflow-hidden p-0">
            <div className="flex flex-col justify-between gap-3 border-b border-ink-200 px-6 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold text-ink-900">Recent sales</h2>
                <p className="mt-1 text-sm text-ink-500">Latest transactions recorded for your account.</p>
              </div>

              <Link
                href="/dashboard/seller/sales"
                className="text-sm font-semibold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition duration-150"
              >
                View all sales
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 px-6 py-6" aria-busy="true">
                {[0, 1, 2, 3].map((row) => (
                  <Skeleton key={row} className="h-9 w-full" />
                ))}
              </div>
            ) : recentSales.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No paid sales yet"
                  description="Transactions from affiliate links and connected sales channels appear here when recorded. Pending and completed sales are shown with their current status."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ink-50 text-xs text-ink-500">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-medium">Date</th>
                      <th scope="col" className="px-6 py-3 font-medium">Sale value</th>
                      <th scope="col" className="px-6 py-3 font-medium">Commission</th>
                      <th scope="col" className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {recentSales.slice(0, 6).map((sale) => (
                      <tr key={sale.id} className="transition-colors duration-150 hover:bg-ink-50">
                        <td className="px-6 py-4 text-ink-500">{new Date(sale.vendido_em).toLocaleDateString("en-GB")}</td>
                        <td className="px-6 py-4 font-medium text-ink-900">{money(Number(sale.valor_venda || 0))}</td>
                        <td className="px-6 py-4 font-medium text-emerald-700">{money(Number(sale.comissao_vendedor || 0))}</td>
                        <td className="px-6 py-4">
                          <Badge variant={statusVariant(sale.status)}>
                            {["paga", "paid", "approved", "completed", "success"].includes((sale.status || "").toLowerCase()) ? "Paid" : (sale.status || "Pending").replaceAll("_", " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
