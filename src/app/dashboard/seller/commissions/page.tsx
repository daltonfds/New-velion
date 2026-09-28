"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
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
  const [commissions, setCommissions] = useState<Commission[]>(
    [],
  );
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
        setError(
          "You must be signed in to view your commissions.",
        );
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("sales")
        .select(
          `
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
          `,
        )
        .eq("vendedor_id", user.id)
        .order("vendido_em", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      setCommissions(
        ((data ?? []) as unknown) as Commission[],
      );
      setLoading(false);
    }

    load();
  }, []);

  const filteredCommissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return commissions.filter((commission) => {
      const productName =
        commission.product?.nome?.toLowerCase() || "";

      const id = commission.id.toLowerCase();

      const matchesSearch =
        !query ||
        productName.includes(query) ||
        id.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        commission.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [commissions, search, statusFilter]);

  const metrics = useMemo(() => {
    const paid = commissions.filter(
      (commission) => commission.status === "paga",
    );

    const totalCommission = paid.reduce(
      (total, commission) =>
        total +
        Number(commission.comissao_vendedor || 0),
      0,
    );

    const totalSalesValue = paid.reduce(
      (total, commission) =>
        total + Number(commission.valor_venda || 0),
      0,
    );

    const retainedGuarantee = paid.reduce(
      (total, commission) =>
        total + Number(commission.valor_garantia || 0),
      0,
    );

    const refunded = commissions
      .filter(
        (commission) =>
          commission.status === "reembolsada",
      )
      .reduce(
        (total, commission) =>
          total +
          Number(commission.comissao_vendedor || 0),
        0,
      );

    return {
      totalCommission,
      totalSalesValue,
      retainedGuarantee,
      refunded,
      paidCount: paid.length,
    };
  }, [commissions]);

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
            Commissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track commissions generated from your affiliate
            sales.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card>
            <p className="text-sm text-slate-500">
              Total Commission
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatMoney(metrics.totalCommission)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Sales Value
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatMoney(metrics.totalSalesValue)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Paid Sales
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {metrics.paidCount}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Guarantee Retained
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatMoney(metrics.retainedGuarantee)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Refunded Commission
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatMoney(metrics.refunded)}
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
              placeholder="Search by product or sale ID..."
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
              Loading commissions...
            </div>
          ) : filteredCommissions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-medium text-slate-900">
                No commissions found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Commissions will appear here after your
                affiliate sales are recorded.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
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
                      Commission
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Guarantee
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCommissions.map(
                    (commission) => (
                      <tr
                        key={commission.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">
                            #{commission.id.slice(0, 8)}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">
                            {commission.product?.nome ||
                              "Unknown product"}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatMoney(
                            Number(
                              commission.valor_venda || 0,
                            ),
                            commission.product?.moeda ||
                              "ZAR",
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {formatMoney(
                            Number(
                              commission.comissao_vendedor ||
                                0,
                            ),
                            commission.product?.moeda ||
                              "ZAR",
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatMoney(
                            Number(
                              commission.valor_garantia ||
                                0,
                            ),
                            commission.product?.moeda ||
                              "ZAR",
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <Badge>
                            {formatStatus(
                              commission.status,
                            )}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(
                            commission.vendido_em,
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
