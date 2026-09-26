"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  ExternalLink,
  Filter,
  Link2,
  MousePointerClick,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  getAffiliateClicks,
  getAffiliateConversions,
  getAffiliateProducts,
  getAffiliateReports,
  getAffiliateSales,
} from "@/lib/newvelion-api";
import DashboardShell from "@/components/dashboard/DashboardShell";
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

type AnyRow = Record<string, any>;

type AffiliateProduct = AnyRow & {
  id?: string;
  affiliate_id?: string;
  product_id?: string;
  referral_code?: string;
  affiliate_code?: string;
  affiliate_link?: string;
  status?: string;
  created_at?: string;
  product_page_url?: string;
  product?: AnyRow;
};

type ProductStats = {
  clicks: number;
  conversions: number;
  sales: number;
  revenue: number;
  commission: number;
};

type SelectedRow = AffiliateProduct & {
  stats: ProductStats;
};

function rows(value: any): AnyRow[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

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

function date(value?: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function shortId(value?: string) {
  if (!value) return "—";
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
}

function productName(item: AffiliateProduct) {
  const product = item.product || {};

  return (
    product.name_en ||
    product.name_pt ||
    product.name ||
    "Unnamed product"
  );
}

function productImage(item: AffiliateProduct) {
  return item.product?.image_url || null;
}

function supplierName(item: AffiliateProduct) {
  const supplier = item.supplier || item.product?.supplier || {};

  return (
    supplier.company_name ||
    supplier.name ||
    supplier.full_name ||
    "Supplier / Producer"
  );
}

function productPrice(item: AffiliateProduct) {
  const product = item.product || {};

  return Number(product.price || 0);
}

function productCurrency(item: AffiliateProduct) {
  return item.product?.currency || "ZAR";
}

function commissionRate(item: AffiliateProduct) {
  return Number(item.product?.commission_percentage || 0);
}

function statusLabel(value?: string) {
  if (!value) return "Unknown";
  return value.replaceAll("_", " ");
}

function statusClasses(value?: string) {
  const status = String(value || "").toLowerCase();

  if (status === "active" || status === "approved") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (status === "pending") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }

  if (status === "paused" || status === "inactive") {
    return "bg-gray-100 text-gray-600 border-gray-200";
  }

  return "bg-blue-50 text-blue-700 border-blue-100";
}

export default function SellerSelectedProductsPage() {
  const [items, setItems] = useState<SelectedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const [copied, setCopied] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [
        affiliateProducts,
        clicks,
        conversions,
        sales,
        reports,
      ] = await Promise.all([
        getAffiliateProducts(),
        getAffiliateClicks(),
        getAffiliateConversions(),
        getAffiliateSales(),
        getAffiliateReports(),
      ]);

      const products = rows(affiliateProducts);
      const clickRows = rows(clicks);
      const conversionRows = rows(conversions);
      const saleRows = rows(sales);

      const report = reports?.data || reports || {};
      const commissionRows = rows(report.commissions);

      const selected = products.map((item: AffiliateProduct) => {
        const productId = item.product_id || item.product?.id;
        const affiliateProductId = item.id;
        const referralCode = item.referral_code || item.affiliate_code;

        const productClicks = clickRows.filter(
          (row) =>
            row.affiliate_product_id === affiliateProductId ||
            (productId && row.product_id === productId) ||
            (referralCode && row.referral_code === referralCode)
        );

        const productConversions = conversionRows.filter(
          (row) =>
            row.affiliate_product_id === affiliateProductId ||
            (productId && row.product_id === productId) ||
            (referralCode && row.referral_code === referralCode)
        );

        const productSales = saleRows.filter(
          (row) => productId && row.product_id === productId
        );

        const productCommissions = commissionRows.filter(
          (row) => productId && row.product_id === productId
        );

        const revenue = productSales
          .filter((row) =>
            ["paid", "completed", "delivered"].includes(
              String(row.status || "paid").toLowerCase()
            )
          )
          .reduce(
            (total, row) => total + Number(row.amount || row.sale_amount || 0),
            0
          );

        const commission = productCommissions.reduce(
          (total, row) => total + Number(row.amount || 0),
          0
        );

        return {
          ...item,
          stats: {
            clicks: productClicks.length,
            conversions: productConversions.length,
            sales: productSales.length,
            revenue,
            commission,
          },
        };
      });

      setItems(selected);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load selected products."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = items.filter((item) => {
      const matchesSearch =
        !query ||
        productName(item).toLowerCase().includes(query) ||
        supplierName(item).toLowerCase().includes(query) ||
        String(item.referral_code || "")
          .toLowerCase()
          .includes(query) ||
        String(item.product_id || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "all" ||
        String(item.status || "").toLowerCase() === status;

      return matchesSearch && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sort === "sales") return b.stats.sales - a.stats.sales;
      if (sort === "clicks") return b.stats.clicks - a.stats.clicks;
      if (sort === "commission") return b.stats.commission - a.stats.commission;
      if (sort === "revenue") return b.stats.revenue - a.stats.revenue;

      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      );
    });
  }, [items, search, status, sort]);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.clicks += item.stats.clicks;
        acc.conversions += item.stats.conversions;
        acc.sales += item.stats.sales;
        acc.revenue += item.stats.revenue;
        acc.commission += item.stats.commission;
        return acc;
      },
      {
        clicks: 0,
        conversions: 0,
        sales: 0,
        revenue: 0,
        commission: 0,
      }
    );
  }, [items]);

  const activeProducts = useMemo(
    () =>
      items.filter((item) =>
        ["active", "approved"].includes(
          String(item.status || "").toLowerCase()
        )
      ).length,
    [items]
  );

  const conversionRate = totals.clicks
    ? (totals.conversions / totals.clicks) * 100
    : 0;

  const chartData = useMemo(
    () =>
      items.map((item) => ({
        name: productName(item).slice(0, 18),
        sales: item.stats.sales,
        clicks: item.stats.clicks,
        conversions: item.stats.conversions,
        commission: Number(item.stats.commission.toFixed(2)),
      })),
    [items]
  );

  const statusData = useMemo(() => {
    const map = new Map<string, number>();

    items.forEach((item) => {
      const value = statusLabel(item.status);
      map.set(value, (map.get(value) || 0) + 1);
    });

    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [items]);

  async function copy(value: string, key: string) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);

      window.setTimeout(() => {
        setCopied("");
      }, 1600);
    } catch {
      setCopied("");
    }
  }

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setSort("recent");
  };

  const hasFilters = Boolean(search || status !== "all" || sort !== "recent");

  return (
    <DashboardShell
      area="seller"
      activeKey="selectedProducts"
      title="Selected Products"
      subtitle="Your live affiliate_products portfolio and performance."
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#3025C8] via-[#3B2FE0] to-[#5B4BFF] p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                <Activity className="h-3.5 w-3.5" />
                Affiliate registry
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Selected Products
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                Every product you have actually registered for promotion.
                Manage referral links, monitor performance and track the
                commercial results of each selection.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#3B2FE0] transition hover:bg-white/90 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh data
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric
            label="Selected products"
            value={number(items.length)}
            icon={Package}
            detail="affiliate_products"
          />

          <Metric
            label="Active"
            value={number(activeProducts)}
            icon={CheckCircle2}
            detail="currently promotable"
          />

          <Metric
            label="Clicks"
            value={number(totals.clicks)}
            icon={MousePointerClick}
            detail="tracked affiliate clicks"
          />

          <Metric
            label="Conversions"
            value={number(totals.conversions)}
            icon={ShoppingCart}
            detail={`${conversionRate.toFixed(1)}% conversion rate`}
          />

          <Metric
            label="Commission generated"
            value={money(totals.commission)}
            icon={TrendingUp}
            detail={`${number(totals.sales)} sales`}
          />
        </section>

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.7fr_0.8fr]">
          <div className="rounded-[24px] border border-[#e9e9f1] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B2FE0]">
                  Performance
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-[#1A1A2E]">
                  Selected products performance
                </h2>
              </div>

              <div className="text-sm text-gray-500">
                Revenue{" "}
                <span className="font-bold text-gray-900">
                  {money(totals.revenue)}
                </span>
              </div>
            </div>

            <div className="mt-6 h-[310px]">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  Loading performance...
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No performance data yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#eeeeF4"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    />
                    <Tooltip
                      cursor={{ fill: "#F7F7FC" }}
                      contentStyle={{
                        borderRadius: 14,
                        border: "1px solid #ECECF3",
                        boxShadow: "0 8px 30px rgba(20,20,60,.08)",
                      }}
                    />
                    <Bar
                      dataKey="clicks"
                      name="Clicks"
                      fill="#A7A0FF"
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="conversions"
                      name="Conversions"
                      fill="#6C5CE7"
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="sales"
                      name="Sales"
                      fill="#3B2FE0"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#e9e9f1] bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B2FE0]">
              Portfolio
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-[#1A1A2E]">
              Selection status
            </h2>

            <div className="mt-4 h-[210px]">
              {statusData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No selected products.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={4}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            ["#3B2FE0", "#10B981", "#F59E0B", "#94A3B8"][
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

            <div className="space-y-2">
              {statusData.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5"
                >
                  <span className="text-sm capitalize text-gray-600">
                    {entry.name}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e9e9f1] bg-white shadow-sm">
          <div className="border-b border-[#f0f0f5] p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-indigo-50 p-2 text-[#3B2FE0]">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B2FE0]">
                      Live registry
                    </p>
                    <h2 className="mt-0.5 text-xl font-extrabold text-[#1A1A2E]">
                      Affiliate Products
                    </h2>
                  </div>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {filtered.length} of {items.length} registered products
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 sm:w-72">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products, supplier or referral..."
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#3B2FE0] focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((value) => !value)}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                    showFilters || hasFilters
                      ? "border-[#3B2FE0] bg-indigo-50 text-[#3B2FE0]"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasFilters && (
                    <span className="rounded-full bg-[#3B2FE0] px-1.5 py-0.5 text-[10px] text-white">
                      !
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => void load()}
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3B2FE0] px-4 text-sm font-bold text-white transition hover:bg-[#3025C0] disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-5 grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">
                    Status
                  </span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#3B2FE0]"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="paused">Paused</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">
                    Sort by
                  </span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#3B2FE0]"
                  >
                    <option value="recent">Recently selected</option>
                    <option value="sales">Most sales</option>
                    <option value="clicks">Most clicks</option>
                    <option value="conversion">Conversions</option>
                    <option value="revenue">Revenue</option>
                    <option value="commission">Commission generated</option>
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    disabled={!hasFilters}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 disabled:opacity-40"
                  >
                    <X className="h-4 w-4" />
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="mx-auto h-7 w-7 animate-spin text-[#3B2FE0]" />
              <p className="mt-3 text-sm font-medium text-gray-500">
                Loading selected products...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto h-10 w-10 text-gray-300" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No selected products found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {items.length
                  ? "Try changing your search or filters."
                  : "Select a product from the Marketplace to register it as an affiliate product."}
              </p>
              {!items.length && (
                <a
                  href="/marketplace"
                  className="mt-5 inline-flex rounded-xl bg-[#3B2FE0] px-5 py-3 text-sm font-bold text-white"
                >
                  Explore Marketplace
                </a>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] text-left">
                <thead className="border-b border-[#eeeeF4] bg-[#FAFAFC]">
                  <tr>
                    {[
                      "Product",
                      "Supplier",
                      "Status",
                      "Commission",
                      "Referral code",
                      "Links",
                      "Clicks",
                      "Conversions",
                      "Sales",
                      "Commission generated",
                      "Selected",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-5 py-4 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item, index) => {
                    const rate = commissionRate(item);
                    const clicks = item.stats.clicks;
                    const conversions = item.stats.conversions;
                    const productConversionRate = clicks
                      ? (conversions / clicks) * 100
                      : 0;

                    const affiliateLink =
                      item.affiliate_link ||
                      (item.referral_code
                        ? `${window.location.origin}/go/${item.referral_code}`
                        : "");

                    const productPage =
                      item.product_page_url ||
                      item.product?.product_page_url ||
                      (item.product?.slug
                        ? `/marketplace/products/${item.product.slug}`
                        : "");

                    return (
                      <tr
                        key={item.id || item.product_id || index}
                        className="border-b border-[#f3f3f7] align-top transition hover:bg-[#FCFCFE]"
                      >
                        <td className="px-5 py-5">
                          <div className="flex min-w-[230px] items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                              {productImage(item) ? (
                                <img
                                  src={productImage(item)}
                                  alt={productName(item)}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-gray-900">
                                {productName(item)}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                ID {shortId(item.product_id || item.product?.id)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="min-w-[150px] text-sm font-semibold text-gray-800">
                            {supplierName(item)}
                          </p>
                          {item.product?.supplier?.country && (
                            <p className="mt-1 text-xs text-gray-400">
                              {item.product.supplier.country}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${statusClasses(
                              item.status
                            )}`}
                          >
                            {statusLabel(item.status)}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-bold text-gray-900">
                            {rate}%
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {money(productPrice(item), productCurrency(item))}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              void copy(
                                item.referral_code || "",
                                `ref-${item.id}`
                              )
                            }
                            className="group inline-flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-2 font-mono text-xs font-semibold text-gray-700 transition hover:bg-indigo-50 hover:text-[#3B2FE0]"
                          >
                            <span>
                              {item.referral_code || "—"}
                            </span>
                            <Clipboard className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
                          </button>

                          {copied === `ref-${item.id}` && (
                            <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                              Copied
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex min-w-[180px] flex-col gap-2">
                            {affiliateLink && (
                              <button
                                type="button"
                                onClick={() =>
                                  void copy(
                                    affiliateLink,
                                    `affiliate-${item.id}`
                                  )
                                }
                                className="inline-flex items-center gap-2 text-left text-xs font-bold text-[#3B2FE0] hover:underline"
                              >
                                <Link2 className="h-3.5 w-3.5" />
                                {copied === `affiliate-${item.id}`
                                  ? "Affiliate link copied"
                                  : "Copy affiliate link"}
                              </button>
                            )}

                            {productPage && (
                              <a
                                href={productPage}
                                target={
                                  productPage.startsWith("http")
                                    ? "_blank"
                                    : undefined
                                }
                                rel={
                                  productPage.startsWith("http")
                                    ? "noreferrer"
                                    : undefined
                                }
                                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Product page
                              </a>
                            )}

                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-bold text-gray-900">
                            {number(clicks)}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            tracked
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-bold text-gray-900">
                            {number(conversions)}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {productConversionRate.toFixed(1)}%
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-bold text-gray-900">
                            {number(item.stats.sales)}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {money(item.stats.revenue)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-extrabold text-emerald-600">
                            {money(item.stats.commission)}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            generated
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="whitespace-nowrap text-sm font-semibold text-gray-700">
                            {date(item.created_at)}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            affiliate record
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {!loading && items.length > 0 && (
          <section className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={Users}
              title="Affiliate registry"
              text="Each row above represents a real affiliate_products registration belonging to the authenticated Seller."
            />

            <InfoCard
              icon={Link2}
              title="Referral infrastructure"
              text="Referral codes and affiliate links are connected to the actual affiliate product records."
            />

            <InfoCard
              icon={TrendingUp}
              title="Performance"
              text="Clicks, conversions, sales and commissions are calculated from the live affiliate activity records."
            />
          </section>
        )}
      </div>
    </DashboardShell>
  );
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-[#e9e9f1] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#1A1A2E]">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-indigo-50 p-2.5 text-[#3B2FE0]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">{detail}</p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e9e9f1] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-[#3B2FE0]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-bold text-[#1A1A2E]">{title}</h3>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-500">{text}</p>
    </div>
  );
}
