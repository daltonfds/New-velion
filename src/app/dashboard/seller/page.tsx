"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
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
  const [salesActivationStatus, setSalesActivationStatus] = useState("inactive");
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

      const {
        data: { user },
      } = await db.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [
        { data: profile },
        { data: salesData },
        { data: dailyData, error: dailyError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name,nome_completo,sales_activation_status,first_sale_at")
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("sales")
          .select(
            "id,vendido_em,status,valor_venda,comissao_vendedor,valor_garantia,vendedor_id,product_id",
          )
          .eq("vendedor_id", user.id)
          .order("vendido_em", { ascending: false }),

        supabase.rpc("get_seller_daily_performance", {
          p_vendedor_id: user.id,
          p_days: 30,
        }),
      ]);

      const financialSummary = await getSellerFinancialSummary(user.id);

      const name =
        profile?.full_name ||
        profile?.nome_completo ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Seller";

      setUserName(name);
      setSalesActivationStatus(profile?.sales_activation_status || "inactive");

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



  return (
    <AppShell area="seller">
      <main className="min-h-screen bg-[#F5F8FC]">
        <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8 lg:py-8">
          <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-[#10069F]">
                Seller dashboard
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#0A0440]">
                Welcome back, {userName}
              </h1>
              <p className="mt-2 text-sm text-[#60708A]">
                Monitor your affiliate business, commissions and wallet in one
                place.
              </p>
            </div>

            <Link
              href="/dashboard/seller/marketplace"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#10069F] px-5 text-sm font-semibold text-white transition hover:bg-[#0B3D8F]"
            >
              Browse marketplace
            </Link>
          </div>

          <Card className={"mb-6 border p-4 shadow-none " + (salesActivationStatus === "active" ? "border-emerald-200 bg-emerald-50" : "border-blue-100 bg-[#EAF3FF]")}>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-[#001B44]">{salesActivationStatus === "active" ? "Account active — congratulations!" : "Your account is waiting for its first sale"}</p>
                <p className="mt-1 text-sm text-slate-600">{salesActivationStatus === "active" ? "Your first confirmed sale activated your sales account." : "Your account is registered, but it becomes sales-active only after your first confirmed paid sale."}</p>
              </div>
              <span className={"w-fit rounded-full px-3 py-1 text-xs font-bold " + (salesActivationStatus === "active" ? "bg-emerald-100 text-emerald-800" : "bg-white text-[#003B95]")}>{salesActivationStatus === "active" ? "ACTIVE" : "INACTIVE"}</span>
            </div>
          </Card>

          <Card className="mb-6 border border-blue-100 bg-white p-5 shadow-none">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div><p className="text-sm font-semibold text-[#003B95]">Grow with Newvelion</p><h2 className="mt-1 text-lg font-bold text-[#001B44]">Earn R50 for every referred seller’s first sale</h2><p className="mt-1 max-w-2xl text-sm text-slate-600">Join the platform affiliate program, share your referral link and unlock mystery prizes when you reach 5, 10 or 25 active referrals.</p></div>
              <Link href="/register/affiliate" className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#003B95] px-4 py-3 text-sm font-semibold text-white hover:bg-[#002B70]">Become an affiliate</Link>
            </div>
          </Card>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Available balance",
                value: money(wallet.disponivel),
                note: "Ready for withdrawal",
                accent: "bg-[#EAF7F0] text-[#18794E]",
              },
              {
                label: "Pending balance",
                value: money(wallet.retido),
                note: "Guarantee currently retained",
                accent: "bg-[#FFF7E5] text-[#9A7018]",
              },
              {
                label: "Total sales",
                value: (financialSummary?.sales_count ?? 0).toString(),
                note: "Paid sales",
                accent: "bg-[#EDF4FF] text-[#245EA8]",
              },
              {
                label: "Total commission",
                value: money(totalCommission),
                note: "Commission from paid sales",
                accent: "bg-[#F0EDFA] text-[#5E4A98]",
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="border-[#DCE3EE] bg-white p-5 shadow-none"
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-[#60708A]">
                    {item.label}
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${item.accent.split(" ")[0]}`}
                  />
                </div>

                <div className="mt-5 text-2xl font-semibold tracking-[-0.025em] text-[#0A0440]">
                  {loading ? "—" : item.value}
                </div>

                <p className="mt-1 text-xs text-[#7C8798]">{item.note}</p>
              </Card>
            ))}
          </section>

          <section className="mt-6">
            <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#003B95]">30-day goal</p>
                  <h2 className="mt-1 text-lg font-semibold text-[#001B44]">Commission progress</h2>
                  <p className="mt-1 text-sm text-[#60708A]">Track confirmed commission earned over the last 30 days.</p>
                </div>
                <label className="text-xs font-semibold text-[#60708A]">
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
                    className="mt-1 block w-36 rounded-lg border border-[#DCE3EE] px-3 py-2 text-sm font-semibold text-[#001B44] outline-none focus:border-[#0078E8]"
                    aria-label="30-day commission goal in rand"
                  />
                </label>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-[#001B44]">{money(commissionLast30Days)} earned</span>
                <span className="text-[#60708A]">{Math.round(goalProgress)}% of {money(goalTarget)}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#EAF3FF]" role="progressbar" aria-label="30-day commission goal progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(goalProgress)}>
                <div className="h-full rounded-full bg-[#0078E8] transition-[width]" style={{ width: `${goalProgress}%` }} />
              </div>
            </Card>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-base font-semibold text-[#0A0440]">
                    Sales performance
                  </h2>
                  <p className="mt-1 text-sm text-[#7C8798]">
                    Daily commission generated from paid sales over the last 30 days.
                  </p>
                </div>

                <span className="rounded-md border border-[#DCE3EE] bg-[#F8FAFD] px-3 py-1.5 text-xs font-medium text-[#60708A]">
                  Live data
                </span>
              </div>

              <div className="mt-8">
                <div className="relative h-64 w-full">
                  <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    {[12, 34, 56, 78].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        x2="100"
                        y1={y}
                        y2={y}
                        stroke="#E8EDF4"
                        strokeWidth="0.35"
                      />
                    ))}

                    <path
                      d={chartPath}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="1.2"
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
                        stroke="#2563EB"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                  </svg>
                </div>

                <div className="mt-3 flex justify-between text-[11px] text-[#8A96A8]">
                  {chartPoints
                    .filter(
                      (_, index) =>
                        index === 0 ||
                        index === 5 ||
                        index === 10 ||
                        index === 15 ||
                        index === 20 ||
                        index === 25 ||
                        index === 29
                    )
                    .map((point) => (
                      <span key={point.day}>
                        {new Date(`${point.day}T00:00:00`).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    ))}
                </div>
              </div>
            </Card>

            <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
              <div>
                <h2 className="text-base font-semibold text-[#0A0440]">
                  Wallet position
                </h2>
                <p className="mt-1 text-sm text-[#7C8798]">
                  Current allocation of your account balance.
                </p>
              </div>

              <div className="mt-8 space-y-5">
                {[
                  ["Available", wallet.disponivel, "bg-[#2B5F9E]"],
                  ["Retained", wallet.retido, "bg-[#10069F]"],
                  ["Reserved", wallet.reservado, "bg-[#8A8570]"],
                ].map(([label, value, color]) => {
                  const total =
                    wallet.disponivel + wallet.retido + wallet.reservado;

                  const percent =
                    total > 0 ? (Number(value) / total) * 100 : 0;

                  return (
                    <div key={String(label)}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-[#405579]">
                          {label}
                        </span>
                        <span className="text-[#0A0440]">
                          {money(Number(value))}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#E9EEF5]">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-[#E9EEF5] pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#60708A]">Total balance</span>
                  <span className="text-lg font-semibold text-[#0A0440]">
                    {money(
                      totalBalance
                    )}
                  </span>
                </div>
              </div>
            </Card>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
              <p className="text-sm font-medium text-[#60708A]">
                Sales revenue
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#0A0440]">
                {money(totalSales)}
              </p>
              <p className="mt-1 text-xs text-[#7C8798]">
                From paid affiliate sales
              </p>
            </Card>

            <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
              <p className="text-sm font-medium text-[#60708A]">
                Commission earned
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#0A0440]">
                {money(totalCommission)}
              </p>
              <p className="mt-1 text-xs text-[#7C8798]">
                Confirmed commission
              </p>
            </Card>

            <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
              <p className="text-sm font-medium text-[#60708A]">
                Paid conversions
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#0A0440]">
                {financialSummary?.sales_count ?? 0}
              </p>
              <p className="mt-1 text-xs text-[#7C8798]">
                Successfully completed sales
              </p>
            </Card>
          </section>

          <section className="mt-6">
            <Card className="overflow-hidden border-[#DCE3EE] bg-white p-0 shadow-none">
              <div className="flex flex-col justify-between gap-3 border-b border-[#E9EEF5] px-6 py-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-base font-semibold text-[#0A0440]">
                    Recent sales
                  </h2>
                  <p className="mt-1 text-sm text-[#7C8798]">
                    Latest transactions recorded for your account.
                  </p>
                </div>

                <Link
                  href="/dashboard/seller/sales"
                  className="text-sm font-semibold text-[#245EA8] hover:underline"
                >
                  View all sales
                </Link>
              </div>

              {loading ? (
                <div className="px-6 py-10 text-sm text-[#7C8798]">
                  Loading live records…
                </div>
              ) : recentSales.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-[#DCE3EE] bg-[#F5F8FC]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5 text-[#60708A]"
                    >
                      <path d="M4 19V5M4 19h16M8 15v-3M12 15V8M16 15v-6" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#0A0440]">
                    No paid sales yet
                  </p>
                  <p className="mx-auto mt-1 max-w-md text-sm text-[#7C8798]">
                    Transactions from affiliate links and connected sales channels appear here when recorded. Pending and completed sales are shown with their current status.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F8FAFD] text-xs uppercase tracking-wide text-[#7C8798]">
                      <tr>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Sale value</th>
                        <th className="px-6 py-3 font-medium">Commission</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9EEF5]">
                      {recentSales.slice(0, 6).map((sale) => (
                        <tr key={sale.id} className="hover:bg-[#FAFBFD]">
                          <td className="px-6 py-4 text-[#60708A]">
                            {new Date(sale.vendido_em).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-[#0A0440]">
                            {money(Number(sale.valor_venda || 0))}
                          </td>
                          <td className="px-6 py-4 font-medium text-[#18794E]">
                            {money(Number(sale.comissao_vendedor || 0))}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${["paga", "paid", "approved", "completed", "success"].includes((sale.status || "").toLowerCase()) ? "bg-[#EAF7F0] text-[#18794E]" : (sale.status || "").toLowerCase() === "reembolsada" ? "bg-amber-50 text-amber-700" : (sale.status || "").toLowerCase() === "cancelada" ? "bg-red-50 text-red-700" : "bg-[#EAF3FF] text-[#003B95]"}`}>
                              {["paga", "paid", "approved", "completed", "success"].includes((sale.status || "").toLowerCase()) ? "Paid" : (sale.status || "Pending").replaceAll("_", " ")}
                            </span>
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
      </main>
    </AppShell>
  );
}
