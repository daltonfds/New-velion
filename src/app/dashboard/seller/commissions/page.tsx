"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { getSellerFinancialSummary } from "@/lib/services/seller-financials";
import { getCurrentUser } from "@/lib/auth";

interface Commission {
  id: string;
  product_id: string;
  valor_venda: number;
  comissao_vendedor: number;
  valor_garantia: number;
  status: string;
  vendido_em: string;
  garantia_libera_em: string | null;
  product: {
    nome: string;
    moeda: string;
  } | null;
}

export default function SellerCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [financialSummary, setFinancialSummary] = useState<Awaited<ReturnType<typeof getSellerFinancialSummary>> | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const user = await getCurrentUser();

      if (!user) {
        setError("You must be signed in to view your commissions.");
        setLoading(false);
        return;
      }

      const days = period === "all" ? null : Number(period);
      const financial = await getSellerFinancialSummary(user.id, days);
      setFinancialSummary(financial);

      const { data, error: queryError } = await supabase
        .from("sales")
        .select(`
          id,
          product_id,
          valor_venda,
          comissao_vendedor,
          valor_garantia,
          status,
          vendido_em,
          garantia_libera_em,
          product:products (
            nome,
            moeda
          )
        `)
        .eq("vendedor_id", user.id)
        .order("vendido_em", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      setCommissions(((data ?? []) as unknown) as Commission[]);
      setLoading(false);
    }

    load();
  }, [period]);

  const filteredCommissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return commissions.filter((commission) => {
      const date = new Date(commission.vendido_em);
      const days = Number(period);
      const inPeriod =
        period === "all" ||
        Date.now() - date.getTime() <= days * 24 * 60 * 60 * 1000;

      const productName = commission.product?.nome?.toLowerCase() || "";
      const id = commission.id.toLowerCase();

      const matchesSearch =
        !query ||
        productName.includes(query) ||
        id.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        commission.status === statusFilter;

      return inPeriod && matchesSearch && matchesStatus;
    });
  }, [commissions, search, statusFilter, period]);

  const metrics = useMemo(() => {
    const paid = filteredCommissions.filter(
      (commission) => commission.status === "paga",
    );

    const totalCommission = financialSummary?.commission_earned ?? 0;
    const totalSalesValue = financialSummary?.gross_sales ?? 0;
    const retainedGuarantee = financialSummary?.guarantee_retained ?? 0;
    const availableCommission = financialSummary?.commission_available ?? 0;
    const totalBalance = financialSummary?.total_balance ?? 0;

    const refunded = filteredCommissions
      .filter((commission) => commission.status === "reembolsada")
      .reduce(
        (total, commission) =>
          total + Number(commission.comissao_vendedor || 0),
        0,
      );

    const pending = filteredCommissions
      .filter((commission) => commission.status !== "paga" && commission.status !== "reembolsada" && commission.status !== "cancelada")
      .reduce(
        (total, commission) =>
          total + Number(commission.comissao_vendedor || 0),
        0,
      );

    return {
      totalCommission,
      totalSalesValue,
      retainedGuarantee,
      refunded,
      pending,
      paidCount: financialSummary?.sales_count ?? 0,
      availableCommission,
      totalBalance,
    };
  }, [filteredCommissions, financialSummary]);

  const chartData = useMemo(() => {
    const now = new Date();
    const points: {
      label: string;
      commission: number;
      sales: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1,
      );

      const month = date.getMonth();
      const year = date.getFullYear();

      const monthSales = commissions.filter((commission) => {
        const sold = new Date(commission.vendido_em);
        return (
          commission.status === "paga" &&
          sold.getMonth() === month &&
          sold.getFullYear() === year
        );
      });

      points.push({
        label: date.toLocaleDateString("en-US", {
          month: "short",
        }),
        commission: monthSales.reduce(
          (sum, sale) => sum + Number(sale.comissao_vendedor || 0),
          0,
        ),
        sales: monthSales.reduce(
          (sum, sale) => sum + Number(sale.valor_venda || 0),
          0,
        ),
      });
    }

    return points;
  }, [commissions]);

  const maxChart = Math.max(
    ...chartData.map((item) => item.commission),
    1,
  );

  const productPerformance = useMemo(() => {
    const map = new Map<
      string,
      { name: string; commission: number; sales: number }
    >();

    filteredCommissions
      .filter((commission) => commission.status === "paga")
      .forEach((commission) => {
        const name = commission.product?.nome || "Unknown product";
        const current = map.get(name) || {
          name,
          commission: 0,
          sales: 0,
        };

        current.commission += Number(
          commission.comissao_vendedor || 0,
        );
        current.sales += 1;

        map.set(name, current);
      });

    return Array.from(map.values())
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 5);
  }, [filteredCommissions, financialSummary]);

  const formatMoney = (
    value: number,
    currency = "ZAR",
  ) =>
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
    if (status === "paga")
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (status === "reembolsada")
      return "border-amber-200 bg-amber-50 text-amber-700";
    if (status === "cancelada")
      return "border-red-200 bg-red-50 text-red-700";
    return "border-[#E5E7EB] bg-[#F7F8FA] text-slate-600";
  };

  return (
    <AppShell area="seller">
      <div className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#10069F]">
              Finance
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#0A0440]">
              Commissions
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Track affiliate earnings, sales performance, retained
              guarantees and commission activity.
            </p>
          </div>

          <Link
            href="/dashboard/seller/withdrawals"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#10069F] px-5 text-sm font-semibold text-white transition hover:bg-[#0B3D8F]"
          >
            View withdrawals
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Total commission", formatMoney(metrics.totalCommission), "Earned from paid sales"],
            ["Sales value", formatMoney(metrics.totalSalesValue), "Gross value generated"],
            ["Paid sales", metrics.paidCount.toString(), "Completed affiliate sales"],
            ["Guarantee retained", formatMoney(metrics.retainedGuarantee), "Currently retained"],
            ["Refunded commission", formatMoney(metrics.refunded), "Commission reversed"],
          ].map(([label, value, description]) => (
            <Card key={label} className="border-[#E5E7EB]">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {value}
              </p>
              <p className="mt-3 text-xs text-slate-400">{description}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <Card className="border-[#E5E7EB]">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Commission performance
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Paid commission generated over the last six months.
                </p>
              </div>

              <span className="rounded-full border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-1 text-xs font-medium text-slate-500">
                Live database data
              </span>
            </div>

            <div className="mt-7 h-64">
              <div className="flex h-full items-end gap-3 sm:gap-5">
                {chartData.map((item) => {
                  const height =
                    item.commission === 0
                      ? 4
                      : Math.max(
                          8,
                          (item.commission / maxChart) * 100,
                        );

                  return (
                    <div
                      key={`${item.label}-${item.commission}`}
                      className="flex h-full flex-1 flex-col justify-end"
                    >
                      <div className="mb-2 text-center text-[10px] font-medium text-slate-500">
                        {item.commission > 0
                          ? formatMoney(item.commission)
                          : "—"}
                      </div>

                      <div className="flex h-[190px] items-end">
                        <div
                          className="w-full rounded-t-md bg-[#10069F] transition-all"
                          style={{ height: `${height}%` }}
                          title={`${item.label}: ${formatMoney(item.commission)}`}
                        />
                      </div>

                      <div className="mt-3 text-center text-xs font-medium text-slate-500">
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="border-[#E5E7EB]">
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-base font-semibold text-slate-900">
                Performance summary
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Current commission position.
              </p>
            </div>

            <div className="space-y-5 pt-5">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Paid commission</span>
                  <span className="font-semibold text-slate-900">
                    {formatMoney(metrics.totalCommission)}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#10069F]"
                    style={{
                      width: `${Math.min(
                        100,
                        metrics.totalCommission > 0 ? 100 : 0,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-sm text-slate-500">
                  Pending commission
                </span>
                <span className="font-semibold text-amber-600">
                  {formatMoney(metrics.pending)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-sm text-slate-500">
                  Retained guarantee
                </span>
                <span className="font-semibold text-slate-900">
                  {formatMoney(metrics.retainedGuarantee)}
                </span>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Conversion value
                </p>
                <p className="mt-2 text-xl font-semibold text-[#0A0440]">
                  {metrics.totalSalesValue > 0
                    ? `${(
                        (metrics.totalCommission /
                          metrics.totalSalesValue) *
                        100
                      ).toFixed(1)}%`
                    : "0.0%"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Commission as a share of paid sales value.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-[#E5E7EB]">
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-base font-semibold text-slate-900">
                Top products
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Products generating the most commission.
              </p>
            </div>

            {productPerformance.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No product performance data yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {productPerformance.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-4 py-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-[#0A0440]">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {product.sales} paid{" "}
                        {product.sales === 1 ? "sale" : "sales"}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-[#0A0440]">
                      {formatMoney(product.commission)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="border-[#E5E7EB]">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Commission activity
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Recent commission records from your account.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search..."
                  className="h-9 rounded-lg border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#0A0440]"
                />

                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#0A0440]"
                >
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="180">Last 6 months</option>
                  <option value="all">All time</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#0A0440]"
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
              <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-lg bg-slate-100"
                  />
                ))}
              </div>
            ) : filteredCommissions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F7F8FA] text-[#0A0440]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                  >
                    <path d="M6 3h12v18H6z" />
                    <path d="M9 7h6M9 11h6M9 15h4" />
                  </svg>
                </div>
                <p className="mt-4 font-medium text-slate-900">
                  No commissions found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {search || statusFilter !== "all"
                    ? "Try changing your filters."
                    : "Commissions will appear here after your affiliate sales are recorded."}
                </p>
              </div>
            ) : (
              <div className="mt-2 divide-y divide-slate-100">
                {filteredCommissions.slice(0, 8).map((commission) => (
                  <div
                    key={commission.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {commission.product?.nome || "Unknown product"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        #{commission.id.slice(0, 8)} ·{" "}
                        {new Date(
                          commission.vendido_em,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                          commission.status,
                        )}`}
                      >
                        {formatStatus(commission.status)}
                      </span>

                      <span className="text-sm font-semibold text-[#0A0440]">
                        {formatMoney(
                          Number(commission.comissao_vendedor || 0),
                          commission.product?.moeda || "ZAR",
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
