"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  RefreshCw,
  Search,
  Clock3,
  CheckCircle2,
  Wallet,
  TrendingUp,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  getAffiliateCommissions,
  getAffiliateProducts,
  getAffiliateSales,
  getFinanceSummary,
} from "@/lib/newvelion-api";

type Commission = {
  id: string;
  affiliate_id?: string | null;
  product_id?: string | null;
  sale_id?: string | null;
  rate?: number | null;
  sale_amount?: number | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  available_at?: string | null;
  created_at?: string | null;
};

type Sale = {
  id: string;
  product_id?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  order_reference?: string | null;
  created_at?: string | null;
};

type AffiliateProduct = {
  product_id?: string | null;
  referral_code?: string | null;
  product?: {
    id?: string | null;
    name_en?: string | null;
    name_pt?: string | null;
    image_url?: string | null;
    price?: number | null;
    currency?: string | null;
  } | null;
};

function money(value: number, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function date(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function normalizeStatus(status?: string | null) {
  const value = String(status || "pending").toLowerCase();

  if (["paid", "completed", "available"].includes(value)) {
    return "Paid";
  }

  if (["cancelled", "canceled", "rejected", "refunded"].includes(value)) {
    return value === "refunded" ? "Refunded" : "Cancelled";
  }

  return "Pending";
}

export default function SellerCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [finance, setFinance] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [commissionRows, saleRows, productRows, financeData] =
        await Promise.all([
          getAffiliateCommissions(),
          getAffiliateSales(),
          getAffiliateProducts(),
          getFinanceSummary(),
        ]);

      setCommissions(commissionRows || []);
      setSales(saleRows || []);
      setProducts(productRows || []);
      setFinance(financeData?.data ?? financeData ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load commission data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const productMap = useMemo(() => {
    const map = new Map<string, AffiliateProduct>();

    for (const item of products) {
      if (item.product_id) {
        map.set(item.product_id, item);
      }

      if (item.product?.id) {
        map.set(item.product.id, item);
      }
    }

    return map;
  }, [products]);

  const saleMap = useMemo(() => {
    const map = new Map<string, Sale>();

    for (const sale of sales) {
      map.set(sale.id, sale);
    }

    return map;
  }, [sales]);

  const rows = useMemo(() => {
    return commissions
      .map((commission) => {
        const sale =
          (commission.sale_id
            ? saleMap.get(commission.sale_id)
            : undefined) || undefined;

        const affiliateProduct = commission.product_id
          ? productMap.get(commission.product_id)
          : undefined;

        const product = affiliateProduct?.product;

        return {
          commission,
          sale,
          affiliateProduct,
          product,
          productName:
            product?.name_en ||
            product?.name_pt ||
            commission.product_id ||
            "Unknown product",
          saleAmount:
            Number(commission.sale_amount ?? sale?.amount ?? 0),
          commissionAmount: Number(commission.amount ?? 0),
          rate: Number(commission.rate ?? 0),
          status: normalizeStatus(commission.status),
          referralCode: affiliateProduct?.referral_code || "—",
          date: commission.created_at,
        };
      })
      .filter((row) => {
        const matchesStatus =
          status === "all" ||
          row.status.toLowerCase() === status.toLowerCase();

        const term = search.trim().toLowerCase();

        const matchesSearch =
          !term ||
          row.productName.toLowerCase().includes(term) ||
          row.referralCode.toLowerCase().includes(term) ||
          String(row.commission.sale_id || "")
            .toLowerCase()
            .includes(term);

        return matchesStatus && matchesSearch;
      });
  }, [commissions, productMap, saleMap, search, status]);

  const totalCommissions = commissions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const paidCommissions = commissions
    .filter((item) => normalizeStatus(item.status) === "Paid")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const pendingCommissions = commissions
    .filter((item) => normalizeStatus(item.status) === "Pending")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const wallet = finance?.wallet || {};

  const availableBalance = Number(
    wallet.available_balance ?? paidCommissions ?? 0,
  );

  const pendingBalance = Number(
    wallet.pending_balance ?? pendingCommissions ?? 0,
  );

  return (
    <DashboardShell
      area="seller"
      activeKey="commissions"
      title="Commissions"
      subtitle="Track exactly how much you earned from your affiliate sales."
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Seller earnings
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Commission overview
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Every commission is connected to a sale, product and referral
                code.
              </p>
            </div>

            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total commissions",
              value: money(totalCommissions),
              icon: DollarSign,
              description: "Lifetime commission generated",
            },
            {
              label: "Available",
              value: money(availableBalance),
              icon: Wallet,
              description: "Currently available balance",
            },
            {
              label: "Pending",
              value: money(pendingBalance),
              icon: Clock3,
              description: "Waiting to become available",
            },
            {
              label: "Paid",
              value: money(paidCommissions),
              icon: CheckCircle2,
              description: "Commissions marked as paid",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    {item.label}
                  </span>
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 text-2xl font-bold text-slate-950">
                  {item.value}
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Commission breakdown
                </h2>
                <p className="text-sm text-slate-500">
                  Money generated from your affiliate sales.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Total generated
                </p>
                <p className="mt-2 text-xl font-bold text-slate-950">
                  {money(totalCommissions)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Available
                </p>
                <p className="mt-2 text-xl font-bold text-emerald-600">
                  {money(availableBalance)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Pending
                </p>
                <p className="mt-2 text-xl font-bold text-amber-600">
                  {money(pendingBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Commission rate example
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sale</span>
                <span className="font-semibold text-slate-900">
                  R1,000
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-500">Seller commission</span>
                <span className="font-semibold text-slate-900">
                  20%
                </span>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">
                    Commission
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    R200
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-950">
                  Commission history
                </h2>
                <p className="text-sm text-slate-500">
                  Each record is linked to the sale that generated it.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product, referral or sale..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 sm:w-72"
                  />
                </div>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
                >
                  <option value="all">All statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {error ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-red-600">
                Failed to load commissions
              </p>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
              <button
                type="button"
                onClick={load}
                className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading commission records...
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center">
              <DollarSign className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">
                No commissions found
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Commissions will appear here when your affiliate sales
                generate earnings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Related sale</th>
                    <th className="px-5 py-4">Sale value</th>
                    <th className="px-5 py-4">Rate</th>
                    <th className="px-5 py-4">Commission</th>
                    <th className="px-5 py-4">Referral code</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr
                      key={row.commission.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {row.product?.image_url ? (
                            <img
                              src={row.product.image_url}
                              alt=""
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                              <DollarSign className="h-4 w-4 text-slate-400" />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-slate-900">
                              {row.productName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {row.commission.product_id || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {row.commission.sale_id || "—"}
                        </p>
                        {row.sale?.order_reference && (
                          <p className="mt-1 text-xs text-slate-400">
                            Order: {row.sale.order_reference}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        {money(
                          row.saleAmount,
                          row.commission.currency || "ZAR",
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {row.rate > 0 ? `${row.rate}%` : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-emerald-600">
                          {money(
                            row.commissionAmount,
                            row.commission.currency || "ZAR",
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {row.referralCode}
                        </code>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {date(row.date)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            row.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : row.status === "Pending"
                                ? "bg-amber-50 text-amber-700"
                                : row.status === "Refunded"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-red-50 text-red-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
