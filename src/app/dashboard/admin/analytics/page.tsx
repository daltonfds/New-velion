"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

interface Sale {
  id: string;
  vendedor_id: string;
  product_id: string;
  valor_venda: number;
  taxa_gateway: number;
  valor_garantia: number;
  comissao_vendedor: number;
  status: string;
  vendido_em: string;
}

interface Product {
  id: string;
  nome: string;
}

interface Profile {
  id: string;
  nome_completo: string | null;
  full_name: string | null;
}

export default function AdminAnalyticsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const [salesResult, productsResult, profilesResult] =
        await Promise.all([
          supabase
            .from("sales")
            .select(
              "id, vendedor_id, product_id, valor_venda, taxa_gateway, valor_garantia, comissao_vendedor, status, vendido_em",
            )
            .order("vendido_em", { ascending: false }),

          supabase
            .from("products")
            .select("id, nome"),

          supabase
            .from("profiles")
            .select("id, nome_completo, full_name"),
        ]);

      if (salesResult.error) {
        setError(salesResult.error.message);
        setLoading(false);
        return;
      }

      if (productsResult.error) {
        setError(productsResult.error.message);
        setLoading(false);
        return;
      }

      if (profilesResult.error) {
        setError(profilesResult.error.message);
        setLoading(false);
        return;
      }

      setSales((salesResult.data ?? []) as Sale[]);
      setProducts((productsResult.data ?? []) as Product[]);
      setProfiles((profilesResult.data ?? []) as Profile[]);
      setLoading(false);
    }

    load();
  }, []);

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

    const revenue = paid.reduce(
      (total, sale) =>
        total + Number(sale.valor_venda || 0),
      0,
    );

    const gatewayFees = paid.reduce(
      (total, sale) =>
        total + Number(sale.taxa_gateway || 0),
      0,
    );

    const guarantees = paid.reduce(
      (total, sale) =>
        total + Number(sale.valor_garantia || 0),
      0,
    );

    const commissions = paid.reduce(
      (total, sale) =>
        total + Number(sale.comissao_vendedor || 0),
      0,
    );

    const averageOrder =
      paid.length > 0 ? revenue / paid.length : 0;

    const uniqueSellers = new Set(
      paid.map((sale) => sale.vendedor_id),
    ).size;

    const uniqueProducts = new Set(
      paid.map((sale) => sale.product_id),
    ).size;

    return {
      totalSales: paid.length,
      revenue,
      gatewayFees,
      guarantees,
      commissions,
      averageOrder,
      uniqueSellers,
      uniqueProducts,
    };
  }, [filteredSales]);

  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      { sales: number; revenue: number }
    >();

    filteredSales
      .filter((sale) => sale.status === "paga")
      .forEach((sale) => {
        const current = map.get(sale.product_id) || {
          sales: 0,
          revenue: 0,
        };

        current.sales += 1;
        current.revenue += Number(sale.valor_venda || 0);

        map.set(sale.product_id, current);
      });

    return [...map.entries()]
      .map(([productId, data]) => ({
        productId,
        name:
          products.find(
            (product) => product.id === productId,
          )?.nome || "Unknown product",
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales, products]);

  const topSellers = useMemo(() => {
    const map = new Map<
      string,
      { sales: number; revenue: number; commissions: number }
    >();

    filteredSales
      .filter((sale) => sale.status === "paga")
      .forEach((sale) => {
        const current = map.get(sale.vendedor_id) || {
          sales: 0,
          revenue: 0,
          commissions: 0,
        };

        current.sales += 1;
        current.revenue += Number(sale.valor_venda || 0);
        current.commissions += Number(
          sale.comissao_vendedor || 0,
        );

        map.set(sale.vendedor_id, current);
      });

    return [...map.entries()]
      .map(([sellerId, data]) => ({
        sellerId,
        name:
          profiles.find(
            (profile) => profile.id === sellerId,
          )?.nome_completo ||
          profiles.find(
            (profile) => profile.id === sellerId,
          )?.full_name ||
          "Unknown seller",
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales, profiles]);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Platform-wide sales and performance analytics.
            </p>
          </div>

          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <p className="text-sm text-slate-500">
                  Paid Sales
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {metrics.totalSales}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-slate-500">
                  Gross Revenue
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatMoney(metrics.revenue)}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-slate-500">
                  Seller Commissions
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
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <p className="text-sm text-slate-500">
                  Gateway Fees
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {formatMoney(metrics.gatewayFees)}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-slate-500">
                  Guarantee Amount
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {formatMoney(metrics.guarantees)}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-slate-500">
                  Active Sellers With Sales
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {metrics.uniqueSellers}
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
                    Products generating the most revenue.
                  </p>
                </div>

                {topProducts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No paid sales available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div
                        key={product.productId}
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
                    Top Sellers
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Sellers generating the most revenue.
                  </p>
                </div>

                {topSellers.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No paid sales available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {topSellers.map((seller, index) => (
                      <div
                        key={seller.sellerId}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                            {index + 1}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {seller.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {seller.sales} sales ·{" "}
                              {formatMoney(
                                seller.commissions,
                              )}{" "}
                              commission
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-slate-900">
                          {formatMoney(seller.revenue)}
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
