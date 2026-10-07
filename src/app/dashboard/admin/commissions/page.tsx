"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";

interface Sale {
  id: string;
  vendedor_id: string;
  product_id: string;
  valor_venda: number;
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

export default function AdminCommissionsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
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
              "id, vendedor_id, product_id, valor_venda, comissao_vendedor, status, vendido_em",
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

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const productName = productMap[sale.product_id] || "";
      const sellerName = profileMap[sale.vendedor_id] || "";

      const matchesSearch =
        !query ||
        sale.id.toLowerCase().includes(query) ||
        productName.toLowerCase().includes(query) ||
        sellerName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        sale.status.toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [sales, productMap, profileMap, search, statusFilter]);

  const summary = useMemo(() => {
    return sales.reduce(
      (result, sale) => {
        const commission = Number(
          sale.comissao_vendedor ?? 0,
        );
        const saleValue = Number(sale.valor_venda ?? 0);

        result.total += commission;

        if (sale.status === "paga") {
          result.paid += commission;
          result.paidSales += 1;
          result.paidRevenue += saleValue;
        }

        if (sale.status === "pendente") {
          result.pending += commission;
        }

        if (
          sale.status === "cancelada" ||
          sale.status === "reembolsada"
        ) {
          result.reversed += commission;
        }

        return result;
      },
      {
        total: 0,
        paid: 0,
        pending: 0,
        reversed: 0,
        paidSales: 0,
        paidRevenue: 0,
      },
    );
  }, [sales]);

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Commissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor seller commissions generated from platform
            sales.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm text-slate-500">
              Total Commissions
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.total.toFixed(2)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Paid Commissions
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.paid.toFixed(2)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Pending Commissions
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.pending.toFixed(2)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Paid Sales
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.paidSales}
            </p>
          </Card>
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Search seller, product, or sale ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-[#DDE5EF] bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
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
              Loading commissions...
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-medium text-slate-900">
                No commissions found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                No commission records match the current filters.
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
                      Seller
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-[#F6F9FC]"
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-[180px] truncate text-sm font-medium text-slate-900">
                          {sale.id}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {profileMap[sale.vendedor_id] ||
                          "Unknown seller"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {productMap[sale.product_id] ||
                          "Unknown product"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {Number(
                          sale.valor_venda ?? 0,
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {Number(
                          sale.comissao_vendedor ?? 0,
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <Badge>{sale.status}</Badge>
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

        <Card>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">
                Paid sales revenue
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {summary.paidRevenue.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Reversed commissions
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {summary.reversed.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Commission records
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {sales.length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
