"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { getSellerFinancialSummary } from "@/lib/services/seller-financials";
import { getCurrentUser } from "@/lib/auth";

interface Sale {
  id: string;
  vendedor_id: string;
  product_id: string;
  valor_venda: number;
  taxa_gateway: number;
  valor_garantia: number;
  comissao_vendedor: number;
  status: string;
  gateway_ref: string | null;
  vendido_em: string;
  garantia_libera_em: string | null;
  product: {
    nome: string;
    moeda: string;
  } | null;
}

const icons = {
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 19V5M4 19h16" />
      <path d="m7 15 3-4 3 2 5-7" />
    </svg>
  ),
  revenue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3v18M17 7.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3" />
    </svg>
  ),
  commission: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3v18M17 7H9.5a3 3 0 0 0 0 6H15a3 3 0 0 1 0 6H7" />
    </svg>
  ),
  fees: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M7 3h10l2 4H5l2-4Z" />
      <path d="M5 7h14v13H5zM9 11h6M9 15h4" />
    </svg>
  ),
  refund: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M9 7H5v4" />
      <path d="M5 11a7 7 0 1 0 2-5" />
      <path d="M12 9v4l3 2" />
    </svg>
  ),
};

export default function SellerSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [financialSummary, setFinancialSummary] = useState<Awaited<ReturnType<typeof getSellerFinancialSummary>> | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [financial, setFinancial] = useState<Awaited<
    ReturnType<typeof getSellerFinancialSummary>
  > | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const user = await getCurrentUser();

      if (!user) {
        setError("You must be signed in to view your sales.");
        setLoading(false);
        return;
      }

      const [financialSummary, { data, error: queryError }] =
        await Promise.all([
          getSellerFinancialSummary(user.id),
          supabase
        .from("sales")
        .select(`
          id,
          vendedor_id,
          product_id,
          valor_venda,
          taxa_gateway,
          valor_garantia,
          comissao_vendedor,
          status,
          gateway_ref,
          vendido_em,
          garantia_libera_em,
          product:products (
            nome,
            moeda
          )
        `)
        .eq("vendedor_id", user.id)
        .order("vendido_em", { ascending: false })
        ]);

      setFinancial(financialSummary);
      setFinancialSummary(financialSummary);

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      setSales(((data ?? []) as unknown) as Sale[]);
      setLoading(false);
    }

    load();
  }, []);

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const productName = sale.product?.nome?.toLowerCase() || "";
      const gatewayRef = sale.gateway_ref?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        sale.id.toLowerCase().includes(query) ||
        productName.includes(query) ||
        gatewayRef.includes(query);

      const matchesStatus =
        statusFilter === "all" || sale.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sales, search, statusFilter]);

  const metrics = useMemo(() => {
    const paid = sales.filter((sale) => sale.status === "paga");

    return {
      sales: financialSummary?.sales_count ?? 0,
      revenue: financialSummary?.gross_sales ?? 0,
      commissions: financialSummary?.commission_earned ?? 0,
      gatewayFees: paid.reduce(
        (total, sale) => total + Number(sale.taxa_gateway || 0),
        0,
      ),
      refunds: sales.filter((sale) => sale.status === "reembolsada").length,
    };
  }, [sales]);

  const formatMoney = (value: number, currency = "ZAR") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value).replace("ZAR", "R").replace("R ", "R");

  const formatStatus = (status: string) => {
    if (status === "paga") return "Paid";
    if (status === "reembolsada") return "Refunded";
    if (status === "cancelada") return "Cancelled";
    if (status === "pendente") return "Pending";
    return status;
  };

  const statusClass = (status: string) => {
    if (status === "paga") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "reembolsada") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (status === "cancelada") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-[#E5E7EB] bg-[#F7F8FA] text-slate-600";
  };

  const metricCards = [
    {
      label: "Paid sales",
      value: metrics.sales.toString(),
      icon: icons.sales,
      description: "Completed purchases",
    },
    {
      label: "Revenue",
      value: formatMoney(metrics.revenue),
      icon: icons.revenue,
      description: "Gross sales value",
    },
    {
      label: "Commissions",
      value: formatMoney(metrics.commissions),
      icon: icons.commission,
      description: "Your affiliate earnings",
    },
    {
      label: "Gateway fees",
      value: formatMoney(metrics.gatewayFees),
      icon: icons.fees,
      description: "Processing costs",
    },
    {
      label: "Refunds",
      value: metrics.refunds.toString(),
      icon: icons.refund,
      description: "Refunded orders",
    },
  ];

  return (
    <AppShell area="seller">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#10069F]">
              Sales
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0A0440]">
              Orders & Sales
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Monitor purchases generated through your affiliate links,
              commissions, fees and order status.
            </p>
          </div>

          <Link
            href="/dashboard/seller/marketplace"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#10069F] px-5 text-sm font-semibold text-white transition hover:bg-[#0B3D8F]"
          >
            Find products
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {metricCards.map((metric) => (
            <Card key={metric.label} className="border-[#E5E7EB]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {metric.value}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] text-[#0A0440]">
                  {metric.icon}
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                {metric.description}
              </p>
            </Card>
          ))}
        </div>

        <Card className="border-[#E5E7EB] p-0">
          <div className="flex flex-col gap-4 border-b border-[#E5E7EB] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Sales history
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {sales.length} total {sales.length === 1 ? "sale" : "sales"}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search sales..."
                  className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#0A0440] sm:w-72"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#0A0440]"
              >
                <option value="all">All statuses</option>
                <option value="paga">Paid</option>
                <option value="pendente">Pending</option>
                <option value="reembolsada">Refunded</option>
                <option value="cancelada">Cancelled</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-5 py-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="space-y-4 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F7F8FA] text-[#0A0440]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                >
                  <path d="M6 3h12v18H6z" />
                  <path d="M9 7h6M9 11h6M9 15h4" />
                </svg>
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-900">
                {search || statusFilter !== "all"
                  ? "No matching sales"
                  : "No sales yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search || statusFilter !== "all"
                  ? "Try changing your search or status filter."
                  : "Once customers purchase through your affiliate links, your orders, revenue and commissions will appear here."}
              </p>

              {!search && statusFilter === "all" && (
                <Link
                  href="/dashboard/seller/marketplace"
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-[#0A0440] px-5 text-sm font-semibold text-[#0A0440] transition hover:bg-[#F7F8FA]"
                >
                  Browse Marketplace
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-[#F7F8FA]/70 text-left">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Sale
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Product
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Value
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Commission
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="transition hover:bg-[#F7F8FA]/70">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            #{sale.id.slice(0, 8)}
                          </p>
                          {sale.gateway_ref && (
                            <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                              {sale.gateway_ref}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900">
                            {sale.product?.nome || "Unknown product"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {formatMoney(
                            Number(sale.valor_venda || 0),
                            sale.product?.moeda || "ZAR",
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-[#0A0440]">
                          {formatMoney(
                            Number(sale.comissao_vendedor || 0),
                            sale.product?.moeda || "ZAR",
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                              sale.status,
                            )}`}
                          >
                            {formatStatus(sale.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {new Date(sale.vendido_em).toLocaleDateString(
                            undefined,
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {sale.product?.nome || "Unknown product"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          #{sale.id.slice(0, 8)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                          sale.status,
                        )}`}
                      >
                        {formatStatus(sale.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-[#F7F8FA] p-4">
                      <div>
                        <p className="text-xs text-slate-500">Sale value</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {formatMoney(
                            Number(sale.valor_venda || 0),
                            sale.product?.moeda || "ZAR",
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Commission</p>
                        <p className="mt-1 text-sm font-semibold text-[#0A0440]">
                          {formatMoney(
                            Number(sale.comissao_vendedor || 0),
                            sale.product?.moeda || "ZAR",
                          )}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      {new Date(sale.vendido_em).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
