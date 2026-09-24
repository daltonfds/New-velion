"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Eye,
  Filter,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  getAffiliateCommissions,
  getAffiliateProducts,
  getAffiliateSales,
} from "@/lib/newvelion-api";

type Sale = {
  id?: string;
  conversion_id?: string | null;
  affiliate_id?: string | null;
  supplier_id?: string | null;
  product_id?: string | null;
  order_reference?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type AffiliateProduct = {
  id?: string;
  product_id?: string | null;
  referral_code?: string | null;
  affiliate_code?: string | null;
  status?: string | null;
  product?: {
    id?: string;
    name_en?: string | null;
    name_pt?: string | null;
    slug?: string | null;
    image_url?: string | null;
    price?: number | string | null;
    currency?: string | null;
    commission_percentage?: number | string | null;
    product_page_url?: string | null;
    checkout_url?: string | null;
  } | null;
};

type Commission = {
  id?: string;
  sale_id?: string | null;
  product_id?: string | null;
  affiliate_id?: string | null;
  sale_amount?: number | string | null;
  amount?: number | string | null;
  currency?: string | null;
  status?: string | null;
  created_at?: string | null;
};

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "Paid",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
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

function dateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function shortDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function normalizeStatus(status?: string | null) {
  const value = String(status || "Pending").trim().toLowerCase();

  if (value === "paid") return "Paid";
  if (value === "shipped") return "Shipped";
  if (value === "delivered") return "Delivered";
  if (value === "cancelled" || value === "canceled") return "Cancelled";
  if (value === "refunded") return "Refunded";
  return "Pending";
}

function statusClasses(status: string) {
  switch (status) {
    case "Paid":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "Shipped":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "Delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "Cancelled":
      return "bg-red-50 text-red-700 border-red-100";
    case "Refunded":
      return "bg-orange-50 text-orange-700 border-orange-100";
    default:
      return "bg-amber-50 text-amber-700 border-amber-100";
  }
}

function StatusIcon({ status }: { status: string }) {
  if (status === "Delivered") return <CheckCircle2 size={13} />;
  if (status === "Cancelled" || status === "Refunded") return <XCircle size={13} />;
  if (status === "Pending") return <Clock3 size={13} />;
  return <Package size={13} />;
}

export default function SellerSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [affiliateProducts, setAffiliateProducts] = useState<AffiliateProduct[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  async function load() {
    try {
      setError("");
      const [salesData, productsData, commissionsData] = await Promise.all([
        getAffiliateSales(),
        getAffiliateProducts(),
        getAffiliateCommissions(),
      ]);

      setSales(Array.isArray(salesData) ? salesData : []);
      setAffiliateProducts(Array.isArray(productsData) ? productsData : []);
      setCommissions(Array.isArray(commissionsData) ? commissionsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sales.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const productById = useMemo(() => {
    const map = new Map<string, AffiliateProduct>();

    affiliateProducts.forEach((item) => {
      if (item.product_id) map.set(item.product_id, item);
      if (item.product?.id) map.set(item.product.id, item);
    });

    return map;
  }, [affiliateProducts]);

  const commissionBySaleId = useMemo(() => {
    const map = new Map<string, number>();

    commissions.forEach((commission) => {
      if (!commission.sale_id) return;

      map.set(
        commission.sale_id,
        Number(map.get(commission.sale_id) || 0) +
          Number(commission.amount || 0)
      );
    });

    return map;
  }, [commissions]);

  const rows = useMemo(() => {
    return sales.map((sale) => {
      const affiliateProduct = sale.product_id
        ? productById.get(sale.product_id)
        : undefined;

      const commission = commissionBySaleId.get(sale.id || "") || 0;
      const saleStatus = normalizeStatus(sale.status);

      return {
        sale,
        affiliateProduct,
        product: affiliateProduct?.product,
        commission,
        status: saleStatus,
        referralCode:
          affiliateProduct?.referral_code ||
          affiliateProduct?.affiliate_code ||
          "—",
      };
    });
  }, [sales, productById, commissionBySaleId]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows
      .filter((row) => status === "All" || row.status === status)
      .filter((row) => {
        if (!query) return true;

        return [
          row.sale.id,
          row.sale.order_reference,
          row.sale.product_id,
          row.product?.name_en,
          row.product?.name_pt,
          row.referralCode,
          row.status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort(
        (a, b) =>
          new Date(b.sale.created_at || 0).getTime() -
          new Date(a.sale.created_at || 0).getTime()
      );
  }, [rows, search, status]);

  const metrics = useMemo(() => {
    const totalSales = rows.length;

    const grossSales = rows.reduce(
      (sum, row) => sum + Number(row.sale.amount || 0),
      0
    );

    const generatedCommission = rows.reduce(
      (sum, row) => sum + row.commission,
      0
    );

    const pending = rows.filter((row) => row.status === "Pending").length;
    const paid = rows.filter((row) => row.status === "Paid").length;
    const shipped = rows.filter((row) => row.status === "Shipped").length;
    const delivered = rows.filter((row) => row.status === "Delivered").length;
    const cancelled = rows.filter((row) => row.status === "Cancelled").length;
    const refunded = rows.filter((row) => row.status === "Refunded").length;

    return {
      totalSales,
      grossSales,
      generatedCommission,
      pending,
      paid,
      shipped,
      delivered,
      cancelled,
      refunded,
    };
  }, [rows]);

  const chartData = useMemo(() => {
    const grouped = new Map<string, { date: string; sales: number; revenue: number }>();

    rows.forEach((row) => {
      const date = row.sale.created_at
        ? new Date(row.sale.created_at)
        : null;

      if (!date || Number.isNaN(date.getTime())) return;

      const key = date.toISOString().slice(0, 10);
      const current = grouped.get(key) || {
        date: shortDate(date.toISOString()),
        sales: 0,
        revenue: 0,
      };

      current.sales += 1;
      current.revenue += Number(row.sale.amount || 0);
      grouped.set(key, current);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([, value]) => value);
  }, [rows]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <DashboardShell area="seller" activeKey="sales" title="Sales" subtitle="Track every sale generated through your affiliate links.">
      <div className="min-h-screen bg-[#f7f8fc] px-4 py-5 md:px-8 md:py-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <div className="rounded-[28px] bg-gradient-to-r from-[#17134a] via-[#2920a5] to-[#4a3fe4] p-6 text-white shadow-[0_20px_60px_rgba(45,38,180,0.22)] md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                  <ShoppingBag size={13} />
                  Seller Sales
                </div>

                <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                  Sales
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                  See exactly which sales happened through your affiliate links,
                  their current status, sale value and commission generated.
                </p>
              </div>

              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#2920a5] shadow-lg transition hover:bg-white/90 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh sales
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<ShoppingBag size={19} />}
              label="Total sales"
              value={number(metrics.totalSales)}
              helper="Recorded affiliate sales"
            />

            <MetricCard
              icon={<CircleDollarSign size={19} />}
              label="Sales value"
              value={money(metrics.grossSales)}
              helper="Gross value of recorded sales"
            />

            <MetricCard
              icon={<TrendingUp size={19} />}
              label="Commission generated"
              value={money(metrics.generatedCommission)}
              helper="Commission linked to sales"
            />

            <MetricCard
              icon={<CheckCircle2 size={19} />}
              label="Delivered"
              value={number(metrics.delivered)}
              helper={`${metrics.pending} pending · ${metrics.paid} paid`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-gray-950">
                    Sales performance
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Recorded sales and revenue over the latest 14 days.
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                  <TrendingUp size={18} />
                </div>
              </div>

              <div className="h-[280px]">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        formatter={(value: number | string, name: string) =>
                          name === "revenue"
                            ? [money(Number(value)), "Revenue"]
                            : [value, "Sales"]
                        }
                      />
                      <Bar
                        dataKey="sales"
                        name="sales"
                        fill="#4338ca"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl bg-gray-50 text-sm font-semibold text-gray-400">
                    No sales data yet.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-black text-gray-950">
                    Sales status
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Current state of your recorded sales.
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                  <Package size={18} />
                </div>
              </div>

              <div className="space-y-3">
                <StatusSummary label="Pending" value={metrics.pending} />
                <StatusSummary label="Paid" value={metrics.paid} />
                <StatusSummary label="Shipped" value={metrics.shipped} />
                <StatusSummary label="Delivered" value={metrics.delivered} />
                <StatusSummary label="Cancelled" value={metrics.cancelled} />
                <StatusSummary label="Refunded" value={metrics.refunded} />
              </div>
            </section>
          </div>

          <section className="rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5 md:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-950">
                    Recorded sales
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Every sale attributed to your affiliate activity.
                  </p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="relative min-w-[260px]">
                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search sale, order, product..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-[#4338ca] focus:bg-white"
                    />
                  </div>

                  <div className="relative">
                    <Filter
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      className="appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm font-bold text-gray-700 outline-none focus:border-[#4338ca]"
                    >
                      {STATUS_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item === "All" ? "All statuses" : item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-black uppercase tracking-[0.12em] text-gray-400">
                    <th className="px-5 py-4">Sale</th>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Customer / Order</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Sale value</th>
                    <th className="px-5 py-4">Referral code</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Commission</th>
                    <th className="px-5 py-4">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 9 }).map((__, cell) => (
                          <td key={cell} className="px-5 py-5">
                            <div className="h-5 animate-pulse rounded-lg bg-gray-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredRows.length ? (
                    filteredRows.map((row) => {
                      const productName =
                        row.product?.name_en ||
                        row.product?.name_pt ||
                        "Product";

                      const currency =
                        row.sale.currency ||
                        row.product?.currency ||
                        "ZAR";

                      return (
                        <tr
                          key={row.sale.id}
                          className="transition hover:bg-gray-50/70"
                        >
                          <td className="px-5 py-5">
                            <div className="max-w-[180px]">
                              <p className="truncate text-sm font-black text-gray-900">
                                {row.sale.id || "—"}
                              </p>
                              <p className="mt-1 text-xs font-medium text-gray-400">
                                Sale ID
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex min-w-[220px] items-center gap-3">
                              {row.product?.image_url ? (
                                <img
                                  src={row.product.image_url}
                                  alt={productName}
                                  className="h-11 w-11 rounded-xl object-cover ring-1 ring-gray-100"
                                />
                              ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                  <Package size={18} />
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-gray-900">
                                  {productName}
                                </p>
                                <p className="mt-1 truncate text-xs text-gray-400">
                                  {row.sale.product_id || "No product ID"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {row.sale.order_reference || "Order not provided"}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                Order reference
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <CalendarDays size={15} className="text-gray-400" />
                              <span className="text-sm font-semibold text-gray-700">
                                {dateTime(row.sale.created_at)}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <p className="whitespace-nowrap text-sm font-black text-gray-950">
                              {money(Number(row.sale.amount || 0), currency)}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <code className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-bold text-gray-700">
                              {row.referralCode}
                            </code>
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-bold ${statusClasses(
                                row.status
                              )}`}
                            >
                              <StatusIcon status={row.status} />
                              {row.status}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <p className="whitespace-nowrap text-sm font-black text-emerald-700">
                              {money(row.commission, currency)}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              Generated
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            {row.product?.slug ? (
                              <a
                                href={`/marketplace/products/${row.product.slug}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-[#4338ca] hover:text-[#4338ca]"
                              >
                                <Eye size={14} />
                                View
                              </a>
                            ) : (
                              <span className="text-xs font-semibold text-gray-400">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-16 text-center">
                        <div className="mx-auto flex max-w-md flex-col items-center">
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                            <ShoppingBag size={24} />
                          </div>
                          <h3 className="text-base font-black text-gray-900">
                            No sales found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Sales attributed to your affiliate links will appear
                            here automatically.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 px-5 py-4">
              <div className="flex flex-col gap-2 text-xs font-semibold text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {number(filteredRows.length)} of {number(rows.length)} sales
                </span>
                <span>Live records from NewVelion</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700">{icon}</div>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tracking-tight text-gray-950">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-gray-400">{helper}</p>
    </div>
  );
}

function StatusSummary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
      <span className="text-sm font-bold text-gray-600">{label}</span>
      <span className="rounded-lg bg-white px-2.5 py-1 text-sm font-black text-gray-900 shadow-sm">
        {number(value)}
      </span>
    </div>
  );
}
