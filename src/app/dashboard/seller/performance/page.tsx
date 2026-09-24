"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  getAffiliateClicks,
  getAffiliateConversions,
  getAffiliateProducts,
  getAffiliateSales,
} from "@/lib/newvelion-api";

type Period = "today" | "7d" | "30d" | "month" | "all";

type AffiliateProduct = {
  id: string;
  referral_code?: string | null;
  affiliate_code?: string | null;
  affiliate_link?: string | null;
  product?: {
    id: string;
    name_en?: string | null;
    name_pt?: string | null;
    image_url?: string | null;
    price?: number | null;
  } | null;
};

type Click = {
  id: string;
  affiliate_product_id?: string | null;
  product_id?: string | null;
  referral_code?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;
  destination?: string | null;
  referrer?: string | null;
  created_at?: string | null;
};

type Conversion = {
  id: string;
  affiliate_product_id?: string | null;
  product_id?: string | null;
  referral_code?: string | null;
  amount?: number | null;
  status?: string | null;
  created_at?: string | null;
};

type Sale = {
  id: string;
  product_id?: string | null;
  amount?: number | null;
  status?: string | null;
  created_at?: string | null;
  order_reference?: string | null;
};

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(value);
}

function dateLabel(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function shortDate(value: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
  }).format(value);
}

function periodStart(period: Period) {
  const now = new Date();

  if (period === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "7d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "30d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return new Date(0);
}

function inPeriod(value: string | null | undefined, period: Period) {
  if (period === "all") return true;
  if (!value) return false;

  return new Date(value) >= periodStart(period);
}

function productName(product?: AffiliateProduct["product"] | null) {
  return product?.name_en || product?.name_pt || "Unknown product";
}

function sourceName(referrer?: string | null) {
  if (!referrer) return "Direct";

  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.length > 32 ? `${referrer.slice(0, 29)}...` : referrer;
  }
}

export default function SellerPerformancePage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [productRows, clickRows, conversionRows, saleRows] =
        await Promise.all([
          getAffiliateProducts(),
          getAffiliateClicks(),
          getAffiliateConversions(),
          getAffiliateSales(),
        ]);

      setProducts(Array.isArray(productRows) ? productRows : []);
      setClicks(Array.isArray(clickRows) ? clickRows : []);
      setConversions(Array.isArray(conversionRows) ? conversionRows : []);
      setSales(Array.isArray(saleRows) ? saleRows : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load affiliate performance."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const productMap = useMemo(() => {
    const map = new Map<string, AffiliateProduct>();

    products.forEach((item) => {
      if (item.product?.id) map.set(item.product.id, item);
      if (item.id) map.set(item.id, item);
    });

    return map;
  }, [products]);

  const periodClicks = useMemo(
    () => clicks.filter((item) => inPeriod(item.created_at, period)),
    [clicks, period]
  );

  const periodConversions = useMemo(
    () => conversions.filter((item) => inPeriod(item.created_at, period)),
    [conversions, period]
  );

  const periodSales = useMemo(
    () => sales.filter((item) => inPeriod(item.created_at, period)),
    [sales, period]
  );

  const visitors = useMemo(() => {
    const ids = new Set<string>();

    periodClicks.forEach((click) => {
      if (click.visitor_id) ids.add(`visitor:${click.visitor_id}`);
      else if (click.session_id) ids.add(`session:${click.session_id}`);
      else ids.add(`click:${click.id}`);
    });

    return ids.size;
  }, [periodClicks]);

  const conversionRate = useMemo(() => {
    if (!periodClicks.length) return 0;
    return (periodConversions.length / periodClicks.length) * 100;
  }, [periodClicks.length, periodConversions.length]);

  const saleRevenue = useMemo(
    () =>
      periodSales
        .filter((sale) =>
          ["paid", "completed", "delivered"].includes(
            sale.status || "paid"
          )
        )
        .reduce((total, sale) => total + Number(sale.amount || 0), 0),
    [periodSales]
  );

  const chartData = useMemo(() => {
    const days = period === "today" ? 1 : period === "7d" ? 7 : 14;
    const now = new Date();

    if (period === "30d" || period === "month") {
      const start = periodStart(period);
      const diff = Math.max(
        1,
        Math.ceil(
          (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
        ) + 1
      );

      const count = Math.min(diff, 30);

      return Array.from({ length: count }, (_, index) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (count - 1 - index));
        date.setHours(0, 0, 0, 0);

        const key = date.toISOString().slice(0, 10);

        return {
          date: shortDate(date),
          clicks: periodClicks.filter(
            (item) => item.created_at?.slice(0, 10) === key
          ).length,
          conversions: periodConversions.filter(
            (item) => item.created_at?.slice(0, 10) === key
          ).length,
          sales: periodSales.filter(
            (item) => item.created_at?.slice(0, 10) === key
          ).length,
        };
      });
    }

    return Array.from({ length: days }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (days - 1 - index));
      date.setHours(0, 0, 0, 0);

      const key = date.toISOString().slice(0, 10);

      return {
        date: shortDate(date),
        clicks: periodClicks.filter(
          (item) => item.created_at?.slice(0, 10) === key
        ).length,
        conversions: periodConversions.filter(
          (item) => item.created_at?.slice(0, 10) === key
        ).length,
        sales: periodSales.filter(
          (item) => item.created_at?.slice(0, 10) === key
        ).length,
      };
    });
  }, [period, periodClicks, periodConversions, periodSales]);

  const productPerformance = useMemo(() => {
    const rows = products.map((affiliate) => {
      const productId = affiliate.product?.id || affiliate.id;
      const referral =
        affiliate.referral_code || affiliate.affiliate_code || "";

      const productClicks = periodClicks.filter(
        (item) =>
          item.product_id === productId ||
          item.affiliate_product_id === affiliate.id ||
          item.referral_code === referral
      );

      const productConversions = periodConversions.filter(
        (item) =>
          item.product_id === productId ||
          item.affiliate_product_id === affiliate.id ||
          item.referral_code === referral
      );

      const productSales = periodSales.filter(
        (item) => item.product_id === productId
      );

      return {
        id: affiliate.id,
        name: productName(affiliate.product),
        image: affiliate.product?.image_url || null,
        referral,
        clicks: productClicks.length,
        conversions: productConversions.length,
        sales: productSales.length,
        rate: productClicks.length
          ? (productConversions.length / productClicks.length) * 100
          : 0,
      };
    });

    const query = search.trim().toLowerCase();

    return rows
      .filter((row) => {
        if (!query) return true;

        return (
          row.name.toLowerCase().includes(query) ||
          row.referral.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.clicks - a.clicks);
  }, [
    products,
    periodClicks,
    periodConversions,
    periodSales,
    search,
  ]);

  const trafficSources = useMemo(() => {
    const counts = new Map<string, number>();

    periodClicks.forEach((click) => {
      const source = sourceName(click.referrer);
      counts.set(source, (counts.get(source) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([source, clicks]) => ({ source, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 6);
  }, [periodClicks]);

  const destinationBreakdown = useMemo(() => {
    const counts = new Map<string, number>();

    periodClicks.forEach((click) => {
      const destination = click.destination || "product";
      counts.set(destination, (counts.get(destination) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, value]) => ({
      name:
        name.charAt(0).toUpperCase() +
        name.slice(1).replaceAll("_", " "),
      value,
    }));
  }, [periodClicks]);

  const latestClicks = useMemo(
    () =>
      [...periodClicks]
        .sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        )
        .slice(0, 12),
    [periodClicks]
  );

  const periodLabel =
    period === "today"
      ? "Today"
      : period === "7d"
        ? "Last 7 days"
        : period === "30d"
          ? "Last 30 days"
          : period === "month"
            ? "This month"
            : "All time";

  return (
    <DashboardShell
      area="seller"
      activeKey="performance"
      title="Clicks & Conversions"
      subtitle="Track traffic, conversions and sales generated by your affiliate links."
    >
      <div className="space-y-6">
        <section className="rounded-[28px] bg-[#3B2FE0] p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                Affiliate performance
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Know exactly what your links are doing.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                Monitor clicks, unique visitors, conversions and sales
                generated through your selected products.
              </p>
            </div>

            <button
              onClick={() => void load()}
              disabled={loading}
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#3B2FE0] hover:bg-white/90 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Refresh data"}
            </button>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["today", "Today"],
              ["7d", "7 days"],
              ["30d", "30 days"],
              ["month", "This month"],
              ["all", "All time"],
            ] as [Period, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                period === value
                  ? "bg-[#3B2FE0] text-white"
                  : "border border-[#e8e8ef] bg-white text-[#4B5563] hover:border-[#3B2FE0]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Clicks", periodClicks.length.toLocaleString(), "Total affiliate link clicks"],
            ["Visitors", visitors.toLocaleString(), "Unique visitors/sessions"],
            ["Conversions", periodConversions.length.toLocaleString(), "Tracked conversions"],
            ["Sales", periodSales.length.toLocaleString(), "Recorded affiliate sales"],
            ["Conversion rate", `${conversionRate.toFixed(2)}%`, "Conversions ÷ clicks"],
          ].map(([label, value, description]) => (
            <div
              key={label}
              className="rounded-2xl border border-[#ececf3] bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-[#9CA3AF]">{label}</p>
              <p className="mt-2 text-3xl font-extrabold text-[#1A1A2E]">
                {value}
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">{description}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#ececf3] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#9CA3AF]">Sales revenue</p>
            <p className="mt-2 text-2xl font-extrabold text-[#1A1A2E]">
              {money(saleRevenue)}
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">{periodLabel}</p>
          </div>

          <div className="rounded-2xl border border-[#ececf3] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#9CA3AF]">Active affiliate products</p>
            <p className="mt-2 text-2xl font-extrabold text-[#1A1A2E]">
              {products.length}
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Products currently selected
            </p>
          </div>

          <div className="rounded-2xl border border-[#ececf3] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#9CA3AF]">Funnel</p>
            <p className="mt-2 text-2xl font-extrabold text-[#1A1A2E]">
              {periodClicks.length} → {periodConversions.length} →{" "}
              {periodSales.length}
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Clicks → conversions → sales
            </p>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#ececf3] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B2FE0]">
              Traffic evolution
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-[#1A1A2E]">
              Clicks, conversions and sales
            </h3>
          </div>

          <div className="h-[330px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-[#9CA3AF]">
                Loading performance...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="clicks" name="Clicks" fill="#3B2FE0" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="conversions" name="Conversions" fill="#7C3AED" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="sales" name="Sales" fill="#111827" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[#ececf3] bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B2FE0]">
              Traffic sources
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-[#1A1A2E]">
              Where clicks come from
            </h3>

            <div className="mt-6 space-y-4">
              {trafficSources.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#9CA3AF]">
                  No traffic source data yet.
                </p>
              ) : (
                trafficSources.map((item) => (
                  <div key={item.source}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#1A1A2E]">
                        {item.source}
                      </span>
                      <span className="font-bold text-[#4B5563]">
                        {item.clicks}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F0F0F5]">
                      <div
                        className="h-full rounded-full bg-[#3B2FE0]"
                        style={{
                          width: `${Math.max(
                            4,
                            (item.clicks /
                              Math.max(1, trafficSources[0]?.clicks || 1)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#ececf3] bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B2FE0]">
              Click destinations
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-[#1A1A2E]">
              Product, checkout and materials
            </h3>

            <div className="mt-5 h-[220px]">
              {destinationBreakdown.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#9CA3AF]">
                  No click data yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={destinationBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {destinationBreakdown.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={
                            ["#3B2FE0", "#7C3AED", "#111827", "#6B7280"][
                              index % 4
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-[#4B5563]">
              {destinationBreakdown.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background:
                        ["#3B2FE0", "#7C3AED", "#111827", "#6B7280"][
                          index % 4
                        ],
                    }}
                  />
                  {item.name}: {item.value}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#ececf3] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#f0f0f5] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B2FE0]">
                Product performance
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-[#1A1A2E]">
                Performance by affiliate product
              </h3>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product or referral..."
              className="h-11 w-full rounded-xl border border-[#e7e7ef] bg-[#F5F6F8] px-4 text-sm text-[#1A1A2E] outline-none focus:border-[#3B2FE0] focus:bg-white sm:w-[280px]"
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-[#9CA3AF]">
              Loading products...
            </div>
          ) : productPerformance.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold text-[#1A1A2E]">
                No affiliate performance yet
              </p>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                Select products and start sharing your affiliate links.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-[#f0f0f5] bg-[#F8F8FB]">
                  <tr>
                    {[
                      "Product",
                      "Referral code",
                      "Clicks",
                      "Conversions",
                      "Sales",
                      "Conversion rate",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {productPerformance.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#f5f5f8] last:border-0 hover:bg-[#FAFAFC]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EFFF] text-xs font-bold text-[#3B2FE0]">
                              NV
                            </div>
                          )}
                          <span className="font-bold text-[#1A1A2E]">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-[#4B5563]">
                        {item.referral || "—"}
                      </td>

                      <td className="px-5 py-4 font-bold text-[#1A1A2E]">
                        {item.clicks}
                      </td>

                      <td className="px-5 py-4 font-bold text-[#1A1A2E]">
                        {item.conversions}
                      </td>

                      <td className="px-5 py-4 font-bold text-[#1A1A2E]">
                        {item.sales}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[#F0EFFF] px-3 py-1 text-xs font-bold text-[#3B2FE0]">
                          {item.rate.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-[24px] border border-[#ececf3] bg-white shadow-sm">
          <div className="border-b border-[#f0f0f5] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B2FE0]">
              Recent traffic
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-[#1A1A2E]">
              Latest affiliate clicks
            </h3>
          </div>

          {latestClicks.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#9CA3AF]">
              No clicks recorded for this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-[#f0f0f5] bg-[#F8F8FB]">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                      Product
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                      Referral code
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                      Source
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                      Destination
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {latestClicks.map((click) => {
                    const affiliate =
                      productMap.get(click.product_id || "") ||
                      productMap.get(click.affiliate_product_id || "");

                    return (
                      <tr
                        key={click.id}
                        className="border-b border-[#f5f5f8] last:border-0"
                      >
                        <td className="px-5 py-4 font-semibold text-[#1A1A2E]">
                          {productName(affiliate?.product)}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-[#4B5563]">
                          {click.referral_code || affiliate?.referral_code || "—"}
                        </td>
                        <td className="px-5 py-4 text-[#4B5563]">
                          {sourceName(click.referrer)}
                        </td>
                        <td className="px-5 py-4 capitalize text-[#4B5563]">
                          {(click.destination || "product").replaceAll(
                            "_",
                            " "
                          )}
                        </td>
                        <td className="px-5 py-4 text-[#4B5563]">
                          {dateLabel(click.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
