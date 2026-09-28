"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";

interface Transaction {
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

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
              "id, vendedor_id, product_id, valor_venda, taxa_gateway, valor_garantia, comissao_vendedor, status, gateway_ref, vendido_em, garantia_libera_em",
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

      setTransactions((salesResult.data ?? []) as Transaction[]);
      setProducts((productsResult.data ?? []) as Product[]);
      setProfiles((profilesResult.data ?? []) as Profile[]);
      setLoading(false);
    }

    load();
  }, []);

  const productMap = useMemo(
    () =>
      Object.fromEntries(
        products.map((product) => [product.id, product.nome]),
      ),
    [products],
  );

  const profileMap = useMemo(
    () =>
      Object.fromEntries(
        profiles.map((profile) => [
          profile.id,
          profile.nome_completo ||
            profile.full_name ||
            "Unnamed seller",
        ]),
      ),
    [profiles],
  );

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const productName =
        productMap[transaction.product_id] || "";

      const sellerName =
        profileMap[transaction.vendedor_id] || "";

      const gatewayRef =
        transaction.gateway_ref || "";

      const matchesSearch =
        !query ||
        transaction.id.toLowerCase().includes(query) ||
        productName.toLowerCase().includes(query) ||
        sellerName.toLowerCase().includes(query) ||
        gatewayRef.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        transaction.status.toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [
    transactions,
    productMap,
    profileMap,
    search,
    statusFilter,
  ]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (result, transaction) => {
        result.count += 1;
        result.revenue += Number(transaction.valor_venda ?? 0);
        result.gatewayFees += Number(
          transaction.taxa_gateway ?? 0,
        );
        result.guarantee += Number(
          transaction.valor_garantia ?? 0,
        );
        result.commissions += Number(
          transaction.comissao_vendedor ?? 0,
        );

        if (transaction.status === "paga") {
          result.paid += 1;
        }

        if (transaction.status === "pendente") {
          result.pending += 1;
        }

        if (transaction.status === "cancelada") {
          result.cancelled += 1;
        }

        return result;
      },
      {
        count: 0,
        paid: 0,
        pending: 0,
        cancelled: 0,
        revenue: 0,
        gatewayFees: 0,
        guarantee: 0,
        commissions: 0,
      },
    );
  }, [transactions]);

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor all sales, fees, guarantees, commissions, and
            payment references.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm text-slate-500">
              Total Transactions
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.count}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Sales Revenue
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.revenue.toFixed(2)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Seller Commissions
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.commissions.toFixed(2)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Gateway Fees
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.gatewayFees.toFixed(2)}
            </p>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm text-slate-500">Paid</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {summary.paid}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {summary.pending}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">Cancelled</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {summary.cancelled}
            </p>
          </Card>
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Search transaction, seller, product, or gateway reference..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
              <option value="pendente">Pending</option>
              <option value="cancelada">Cancelled</option>
              <option value="reembolsada">Refunded</option>
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
              Loading transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-medium text-slate-900">
                No transactions found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                There are no transactions matching the current
                filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Product
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Sale
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Gateway Fee
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Guarantee
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
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-[180px] truncate text-sm font-medium text-slate-900">
                          {transaction.id}
                        </div>
                        {transaction.gateway_ref && (
                          <div className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                            {transaction.gateway_ref}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {profileMap[transaction.vendedor_id] ||
                          "Unknown seller"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {productMap[transaction.product_id] ||
                          "Unknown product"}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {Number(
                          transaction.valor_venda ?? 0,
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {Number(
                          transaction.taxa_gateway ?? 0,
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {Number(
                          transaction.valor_garantia ?? 0,
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {Number(
                          transaction.comissao_vendedor ?? 0,
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <Badge>
                          {transaction.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(
                          transaction.vendido_em,
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
