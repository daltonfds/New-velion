"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
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

export default function SellerSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      const { data, error: queryError } = await supabase
        .from("sales")
        .select(
          `
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
          `,
        )
        .eq("vendedor_id", user.id)
        .order("vendido_em", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      setSales(
        ((data ?? []) as unknown) as Sale[],
      );
      setLoading(false);
    }

    load();
  }, []);

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const productName =
        sale.product?.nome?.toLowerCase() || "";

      const gatewayRef =
        sale.gateway_ref?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        sale.id.toLowerCase().includes(query) ||
        productName.includes(query) ||
        gatewayRef.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        sale.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sales, search, statusFilter]);

  const metrics = useMemo(() => {
    const paid = sales.filter(
      (sale) => sale.status === "paga",
    );

    const revenue = paid.reduce(
      (total, sale) =>
        total + Number(sale.valor_venda || 0),
      0,
    );

    const commissions = paid.reduce(
      (total, sale) =>
        total + Number(sale.comissao_vendedor || 0),
      0,
    );

    const gatewayFees = paid.reduce(
      (total, sale) =>
        total + Number(sale.taxa_gateway || 0),
      0,
    );

    const refunds = sales.filter(
      (sale) => sale.status === "reembolsada",
    ).length;

    return {
      sales: paid.length,
      revenue,
      commissions,
      gatewayFees,
      refunds,
    };
  }, [sales]);

  const formatMoney = (
    value: number,
    currency = "ZAR",
  ) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);

  const formatStatus = (status: string) => {
    if (status === "paga") return "Paid";
    if (status === "reembolsada") return "Refunded";
    if (status === "cancelada") return "Cancelled";
    return status;
  };

  return (
    <AppShell area="seller">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Orders & Sales
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your affiliate sales and commissions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card>
            <p className="text-sm text-slate-500">
              Paid Sales
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
              Commissions
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatMoney(metrics.commissions)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Gateway Fees
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatMoney(metrics.gatewayFees)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Refunds
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {metrics.refunds}
            </p>
          </Card>
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by product, sale ID, or gateway reference..."
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">All statuses</option>
              <option value="paga">Paid</option>
              <option value="reembolsada">
                Refunded
              </option>
              <option value="cancelada">
                Cancelled
              </option>
            </select>
          </div>
        </Card>

        {error && (
          <Card>
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        <Card>
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading sales...
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-medium text-slate-900">
                No sales found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your sales will appear here when customers
                purchase through your affiliate links.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Sale
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Product
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Sale Value
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Gateway Fee
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Sold At
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          #{sale.id.slice(0, 8)}
                        </p>
                        {sale.gateway_ref && (
                          <p className="mt-1 text-xs text-slate-400">
                            {sale.gateway_ref}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {sale.product?.nome ||
                            "Unknown product"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {formatMoney(
                          Number(sale.valor_venda || 0),
                          sale.product?.moeda || "ZAR",
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatMoney(
                          Number(sale.taxa_gateway || 0),
                          sale.product?.moeda || "ZAR",
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {formatMoney(
                          Number(
                            sale.comissao_vendedor || 0,
                          ),
                          sale.product?.moeda || "ZAR",
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <Badge>
                          {formatStatus(sale.status)}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(
                          sale.vendido_em,
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
