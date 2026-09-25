"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CircleDollarSign,
  MousePointerClick,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  AffiliateDashboard,
  getAffiliateDashboard,
} from "@/lib/newvelion-api";

type Period = "today" | "7d" | "30d" | "month";

const periods: Array<{ key: Period; label: string }> = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "month", label: "This month" },
];

function money(value: number, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function number(value: number) {
  return new Intl.NumberFormat("en-ZA").format(Number(value || 0));
}

function dateLabel(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function dateTimeLabel(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SellerDashboardPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<AffiliateDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load(selectedPeriod = period) {
    try {
      setError("");
      setRefreshing(true);

      const result = await getAffiliateDashboard({
        period: selectedPeriod,
      });

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load(period);
  }, [period]);

  const chartData = useMemo(() => {
    const current = data?.evolution || [];
    const previous = data?.previous_evolution || [];

    return current.map((item, index) => ({
      ...item,
      label: dateLabel(item.date),
      previousRevenue: Number(previous[index]?.revenue || 0),
    }));
  }, [data]);

  const summary = data?.summary;

  const cards = [
    {
      label: "Available balance",
      value: money(
        summary?.available_balance || 0,
        data?.currency
      ),
      icon: Wallet,
      description: "Ready for withdrawal",
    },
    {
      label: "Pending balance",
      value: money(
        summary?.pending_balance || 0,
        data?.currency
      ),
      icon: CircleDollarSign,
      description: "Pending earnings",
    },
    {
      label: "Total sales",
      value: number(summary?.sales || 0),
      icon: ShoppingCart,
      description: "Sales in selected period",
    },
    {
      label: "Commissions",
      value: money(
        summary?.commissions || 0,
        data?.currency
      ),
      icon: TrendingUp,
      description: "Affiliate earnings",
    },
    {
      label: "Clicks",
      value: number(summary?.clicks || 0),
      icon: MousePointerClick,
      description: "Tracked affiliate clicks",
    },
    {
      label: "Conversions",
      value: number(summary?.conversions || 0),
      icon: BarChart3,
      description: "Tracked conversions",
    },
    {
      label: "Conversion rate",
      value: `${Number(
        summary?.conversion_rate || 0
      ).toFixed(2)}%`,
      icon: TrendingUp,
      description: "Conversions ÷ clicks",
    },
    {
      label: "Selected products",
      value: number(summary?.selected_products || 0),
      icon: Package,
      description: "Products you promote",
    },
  ];

  return (
    <DashboardShell
      area="seller"
      activeKey="dashboard"
      title="Seller Dashboard"
      subtitle="Your live affiliate business overview."
    >
      <div className="space-y-6">
        <section className="rounded-3xl bg-[#F7F7FC] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#3B2FE0]">
                Affiliate performance
              </p>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1A1A2E] sm:text-3xl">
                Welcome back
                {data?.seller?.full_name
                  ? `, ${data.seller.full_name}`
                  : ""}.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                Track sales, revenue, commissions, clicks and
                conversions from one live dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {periods.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setPeriod(item.key)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    period === item.key
                      ? "bg-[#3B2FE0] text-white shadow-sm"
                      : "bg-white text-[#6B7280] ring-1 ring-inset ring-[#e7e7ef] hover:bg-[#f1f1f7]"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <button
                onClick={() => load(period)}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-[#6B7280] ring-1 ring-inset ring-[#e7e7ef] hover:bg-[#f1f1f7] disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {error && (
          <section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </section>
        )}

        {loading ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl bg-[#F5F6F8]"
              />
            ))}
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-[#ececf3] bg-white p-5 shadow-[0_8px_30px_rgba(31,35,70,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#8A8FA3]">
                          {card.label}
                        </p>

                        <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#1A1A2E]">
                          {card.value}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F1EFFF] p-2.5 text-[#3B2FE0]">
                        <Icon size={19} />
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-[#9CA3AF]">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
              <div className="rounded-2xl border border-[#ececf3] bg-white p-5 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1A1A2E]">
                      Performance over time
                    </h3>

                    <p className="mt-1 text-sm text-[#9CA3AF]">
                      Sales, revenue, commissions and traffic.
                    </p>
                  </div>

                  <span className="rounded-lg bg-[#F5F6F8] px-3 py-1.5 text-xs font-semibold text-[#6B7280]">
                    {data?.currency || "ZAR"}
                  </span>
                </div>

                <div className="h-[330px] w-full">
                  {chartData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{
                          top: 12,
                          right: 12,
                          left: 0,
                          bottom: 4,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="salesArea"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#2563EB"
                              stopOpacity={0.22}
                            />
                            <stop
                              offset="100%"
                              stopColor="#2563EB"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          stroke="#EEF1F5"
                          strokeDasharray="0"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="label"
                          tick={{
                            fontSize: 11,
                            fill: "#8A8FA3",
                          }}
                          tickLine={false}
                          axisLine={false}
                          dy={8}
                        />

                        <YAxis
                          tick={{
                            fontSize: 11,
                            fill: "#8A8FA3",
                          }}
                          tickLine={false}
                          axisLine={false}
                          width={48}
                          tickFormatter={(value) =>
                            money(
                              Number(value || 0),
                              data?.currency
                            )
                          }
                        />

                        <Tooltip
                          cursor={{
                            stroke: "#CBD5E1",
                            strokeWidth: 1,
                          }}
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #E5E7EB",
                            boxShadow:
                              "0 8px 24px rgba(15,23,42,0.08)",
                            padding: "10px 12px",
                          }}
                          labelStyle={{
                            color: "#64748B",
                            fontSize: 12,
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                          formatter={(value, name) => [
                            money(
                              Number(value || 0),
                              data?.currency
                            ),
                            name === "revenue"
                              ? "Current period"
                              : name === "previousRevenue"
                                ? "Previous period"
                                : name === "commissions"
                                  ? "Commissions"
                                  : "Sales",
                          ]}
                        />

                        <Area
                          type="monotone"
                          dataKey="previousRevenue"
                          name="previousRevenue"
                          stroke="#CBD5E1"
                          strokeWidth={2}
                          strokeDasharray="6 5"
                          fill="none"
                          dot={false}
                          activeDot={false}
                        />

                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="revenue"
                          stroke="#2563EB"
                          strokeWidth={2.5}
                          fill="url(#salesArea)"
                          dot={false}
                          activeDot={{
                            r: 4,
                            strokeWidth: 2,
                            stroke: "#FFFFFF",
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl bg-[#F8F8FB] text-sm text-[#9CA3AF]">
                      No performance data for this period yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#ececf3] bg-white p-5 sm:p-6">
                <div>
                  <h3 className="text-lg font-extrabold text-[#1A1A2E]">
                    Period report
                  </h3>

                  <p className="mt-1 text-sm text-[#9CA3AF]">
                    Live consolidated figures.
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    [
                      "Revenue generated",
                      money(
                        summary?.revenue || 0,
                        data?.currency
                      ),
                    ],
                    [
                      "Total commissions",
                      money(
                        summary?.commissions || 0,
                        data?.currency
                      ),
                    ],
                    [
                      "Clicks",
                      number(summary?.clicks || 0),
                    ],
                    [
                      "Conversions",
                      number(summary?.conversions || 0),
                    ],
                    [
                      "Conversion rate",
                      `${Number(
                        summary?.conversion_rate || 0
                      ).toFixed(2)}%`,
                    ],
                    [
                      "Lifetime earnings",
                      money(
                        summary?.lifetime_earnings || 0,
                        data?.currency
                      ),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between border-b border-[#f0f0f5] pb-3 last:border-0 last:pb-0"
                    >
                      <span className="text-sm text-[#6B7280]">
                        {label}
                      </span>

                      <span className="text-sm font-bold text-[#1A1A2E]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-[#ececf3] bg-white p-5 sm:p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-extrabold text-[#1A1A2E]">
                    Performance by product
                  </h3>

                  <p className="mt-1 text-sm text-[#9CA3AF]">
                    Products generating affiliate activity.
                  </p>
                </div>

                {data?.performance_by_product?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#ececf3] text-xs uppercase tracking-wider text-[#9CA3AF]">
                          <th className="pb-3 font-semibold">
                            Product
                          </th>
                          <th className="pb-3 text-right font-semibold">
                            Clicks
                          </th>
                          <th className="pb-3 text-right font-semibold">
                            Sales
                          </th>
                          <th className="pb-3 text-right font-semibold">
                            Revenue
                          </th>
                          <th className="pb-3 text-right font-semibold">
                            Commission
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.performance_by_product.map(
                          (item, index) => (
                            <tr
                              key={
                                item.product_id || index
                              }
                              className="border-b border-[#f3f3f7] last:border-0"
                            >
                              <td className="py-4 font-semibold text-[#1A1A2E]">
                                {item.product_name ||
                                  item.name ||
                                  "Product"}
                              </td>

                              <td className="py-4 text-right text-[#6B7280]">
                                {number(item.clicks)}
                              </td>

                              <td className="py-4 text-right text-[#6B7280]">
                                {number(item.sales)}
                              </td>

                              <td className="py-4 text-right font-medium text-[#1A1A2E]">
                                {money(
                                  item.revenue,
                                  data.currency
                                )}
                              </td>

                              <td className="py-4 text-right font-medium text-[#3B2FE0]">
                                {money(
                                  item.commissions,
                                  data.currency
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#F8F8FB] p-8 text-center text-sm text-[#9CA3AF]">
                    No product performance data for this
                    period yet.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#ececf3] bg-white p-5 sm:p-6">
                <div className="mb-5">
                  <h3 className="text-lg font-extrabold text-[#1A1A2E]">
                    Recent sales
                  </h3>

                  <p className="mt-1 text-sm text-[#9CA3AF]">
                    Latest affiliate sales recorded by NewVelion.
                  </p>
                </div>

                {data?.recent_sales?.length ? (
                  <div className="space-y-3">
                    {data.recent_sales
                      .slice(0, 6)
                      .map((sale, index) => (
                        <div
                          key={sale.id || index}
                          className="flex items-center justify-between gap-4 rounded-xl bg-[#F8F8FB] p-3.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#1A1A2E]">
                              {sale.product_name ||
                                sale.product?.name_en ||
                                "Product sale"}
                            </p>

                            <p className="mt-1 text-xs text-[#9CA3AF]">
                              {dateTimeLabel(
                                sale.created_at
                              )}{" "}
                              · {sale.status || "pending"}
                            </p>
                          </div>

                          <span className="shrink-0 text-sm font-extrabold text-[#1A1A2E]">
                            {money(
                              sale.amount,
                              data.currency
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#F8F8FB] p-8 text-center text-sm text-[#9CA3AF]">
                    No sales recorded for this period yet.
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-[#ececf3] bg-white p-5 sm:p-6">
                <h3 className="text-lg font-extrabold text-[#1A1A2E]">
                  Recent commissions
                </h3>

                <p className="mt-1 text-sm text-[#9CA3AF]">
                  Commission earnings generated from your sales.
                </p>

                <div className="mt-5 space-y-3">
                  {data?.recent_commissions?.length ? (
                    data.recent_commissions
                      .slice(0, 6)
                      .map((commission, index) => (
                        <div
                          key={
                            commission.id || index
                          }
                          className="flex items-center justify-between gap-4 border-b border-[#f0f0f5] pb-3 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-bold text-[#1A1A2E]">
                              {commission.product_name ||
                                commission.product?.name_en ||
                                "Commission"}
                            </p>

                            <p className="mt-1 text-xs text-[#9CA3AF]">
                              {dateTimeLabel(
                                commission.created_at
                              )}{" "}
                              ·{" "}
                              {commission.status ||
                                "pending"}
                            </p>
                          </div>

                          <span className="text-sm font-extrabold text-[#3B2FE0]">
                            +
                            {money(
                              commission.amount,
                              data.currency
                            )}
                          </span>
                        </div>
                      ))
                  ) : (
                    <div className="rounded-xl bg-[#F8F8FB] p-8 text-center text-sm text-[#9CA3AF]">
                      No commissions recorded for this
                      period yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#ececf3] bg-white p-5 sm:p-6">
                <h3 className="text-lg font-extrabold text-[#1A1A2E]">
                  Account activity
                </h3>

                <p className="mt-1 text-sm text-[#9CA3AF]">
                  Recent tracked activity across your affiliate
                  account.
                </p>

                <div className="mt-5 space-y-3">
                  {data?.activity?.length ? (
                    data.activity
                      .slice(0, 8)
                      .map((item, index) => (
                        <div
                          key={item.id || index}
                          className="flex items-center gap-3 border-b border-[#f0f0f5] pb-3 last:border-0 last:pb-0"
                        >
                          <div className="rounded-lg bg-[#F1EFFF] p-2 text-[#3B2FE0]">
                            {item.type === "sale" ? (
                              <ShoppingCart size={15} />
                            ) : (
                              <MousePointerClick size={15} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1A1A2E]">
                              {item.label ||
                                item.type ||
                                "Activity"}
                            </p>

                            <p className="mt-1 text-xs text-[#9CA3AF]">
                              {dateTimeLabel(
                                item.created_at
                              )}
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="rounded-xl bg-[#F8F8FB] p-8 text-center text-sm text-[#9CA3AF]">
                      No recent activity yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
