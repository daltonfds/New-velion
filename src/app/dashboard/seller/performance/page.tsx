"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { getSellerFinancialSummary } from "@/lib/services/seller-financials";
import { getCurrentUser } from "@/lib/auth";

interface Sale {
  id: string;
  product_id: string;
  valor_venda: number;
  comissao_vendedor: number;
  status: string;
  vendido_em: string;
  product: {
    nome: string;
    moeda: string;
  } | null;
}

export default function SellerPerformancePage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [financialSummary, setFinancialSummary] = useState<Awaited<ReturnType<typeof getSellerFinancialSummary>> | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const user = await getCurrentUser();

      if (!user) {
        setError("You must be signed in to view analytics.");
        setLoading(false);
        return;
      }

      const days =
        period === "all" ? null : Number(period.replace("d", ""));

      const financial = await getSellerFinancialSummary(user.id, days);
      setFinancialSummary(financial);

      const { data, error: queryError } = await supabase
        .from("sales")
        .select(
          `
            id,
            product_id,
            valor_venda,
            comissao_vendedor,
            status,
            vendido_em,
            product:products (
              nome,
              moeda
            )
          `,
        )
        .eq("vendedor_id", user.id)
        .order("vendido_em", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      setSales((data ?? []) as unknown as Sale[]);
      setLoading(false);
    }

    load();
  }, [period]);

  const filteredSales = useMemo(() => {
    if (period === "all") return sales;

    const now = new Date();
    const cutoff = new Date(now);

    if (period === "7d") {
      cutoff.setDate(now.getDate() - 7);
    }

    if (period === "30d") {
      cutoff.setDate(now.getDate() - 30);
    }

    if (period === "90d") {
      cutoff.setDate(now.getDate() - 90);
    }

    return sales.filter(
      (sale) => new Date(sale.vendido_em) >= cutoff,
    );
  }, [sales, period]);

  const metrics = useMemo(() => {
    const paid = filteredSales.filter(
      (sale) => sale.status === "paga",
    );

    const revenue = financialSummary?.gross_sales ?? 0;

    const commissions = financialSummary?.commission_earned ?? 0;

    const averageOrder =
      (financialSummary?.sales_count ?? 0) > 0
        ? revenue / (financialSummary?.sales_count ?? 1)
        : 0;

    const products = new Set(
      paid.map((sale) => sale.product_id),
    ).size;

    return {
      sales: financialSummary?.sales_count ?? 0,
      revenue,
      commissions,
      averageOrder,
      products,
    };
  }, [filteredSales, financialSummary]);

  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        sales: number;
        revenue: number;
        commission: number;
      }
    >();

    filteredSales
      .filter((sale) => sale.status === "paga")
      .forEach((sale) => {
        const existing = map.get(sale.product_id);

        if (existing) {
          existing.sales += 1;
          existing.revenue += Number(sale.valor_venda || 0);
          existing.commission += Number(
            sale.comissao_vendedor || 0,
          );
        } else {
          map.set(sale.product_id, {
            name:
              sale.product?.nome || "Unknown product",
            sales: 1,
            revenue: Number(sale.valor_venda || 0),
            commission: Number(
              sale.comissao_vendedor || 0,
            ),
          });
        }
      });

    return [...map.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredSales, financialSummary]);

  const dailyPerformance = useMemo(() => {
    const map = new Map<
      string,
      { sales: number; revenue: number }
    >();

    filteredSales
      .filter((sale) => sale.status === "paga")
      .forEach((sale) => {
        const date = new Date(
          sale.vendido_em,
        ).toLocaleDateString();

        const existing = map.get(date);

        if (existing) {
          existing.sales += 1;
          existing.revenue += Number(
            sale.valor_venda || 0,
          );
        } else {
          map.set(date, {
            sales: 1,
            revenue: Number(sale.valor_venda || 0),
          });
        }
      });

    return [...map.entries()]
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .slice(0, 10);
  }, [filteredSales, financialSummary]);

  const formatMoney = (
    value: number,
    currency = "ZAR",
  ) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value).replace("ZAR", "R").replace("R ", "R");

  return (
    <AppShell area="seller">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Understand your affiliate sales performance.
            </p>
          </div>

          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value)
            }
            className="h-10 rounded-lg border border-[#DDE5EF] bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        {error && (
          <Card>
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        {loading ? (
          <Card>
            <div className="py-12 text-center text-sm text-slate-500">
              Loading analytics...
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Card>
                <p className="text-sm text-slate-500">
                  Sales
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {metrics.sales}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-slate-500">
                  Revenue
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatMoney(metrics.revenue)}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-slate-500">
                  Commission
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatMoney(metrics.commissions)}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-slate-500">
                  Average Order
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatMoney(metrics.averageOrder)}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-slate-500">
                  Products Sold
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {metrics.products}
                </p>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <div className="mb-5">
                  <h2 className="font-semibold text-slate-900">
                    Top Products
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Your highest-revenue products.
                  </p>
                </div>

                {topProducts.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    No paid sales in this period.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div
                        key={`${product.name}-${index}`}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                            {index + 1}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.sales} sales
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-slate-900">
                          {formatMoney(product.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <div className="mb-5">
                  <h2 className="font-semibold text-slate-900">
                    Recent Performance
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Daily paid sales activity.
                  </p>
                </div>

                {dailyPerformance.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-500">
                    No paid sales in this period.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dailyPerformance.map((day) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between rounded-lg bg-[#F6F9FC] px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {day.date}
                          </p>
                          <p className="text-xs text-slate-500">
                            {day.sales} sales
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-slate-900">
                          {formatMoney(day.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
