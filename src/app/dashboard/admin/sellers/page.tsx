"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";

interface Seller {
  id: string;
  nome_completo: string | null;
  full_name: string | null;
  pais: string | null;
  country: string | null;
  telefone: string | null;
  phone_number: string | null;
  kyc_status: string | null;
  status: string | null;
  created_at: string;
}

interface Sale {
  vendedor_id: string;
  valor_venda: number;
  comissao_vendedor: number;
  status: string;
}

interface SellerStats {
  sales: number;
  revenue: number;
  commissions: number;
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const [sellersResult, salesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, nome_completo, full_name, pais, country, telefone, phone_number, kyc_status, status, created_at",
          )
          .eq("role", "seller")
          .order("created_at", { ascending: false }),

        supabase
          .from("sales")
          .select(
            "vendedor_id, valor_venda, comissao_vendedor, status",
          ),
      ]);

      if (sellersResult.error) {
        setError(sellersResult.error.message);
        setLoading(false);
        return;
      }

      if (salesResult.error) {
        setError(salesResult.error.message);
        setLoading(false);
        return;
      }

      setSellers((sellersResult.data ?? []) as Seller[]);
      setSales((salesResult.data ?? []) as Sale[]);
      setLoading(false);
    }

    load();
  }, []);

  const stats = useMemo(() => {
    const result: Record<string, SellerStats> = {};

    for (const sale of sales) {
      if (sale.status !== "paga") continue;

      if (!result[sale.vendedor_id]) {
        result[sale.vendedor_id] = {
          sales: 0,
          revenue: 0,
          commissions: 0,
        };
      }

      result[sale.vendedor_id].sales += 1;
      result[sale.vendedor_id].revenue += Number(sale.valor_venda ?? 0);
      result[sale.vendedor_id].commissions += Number(
        sale.comissao_vendedor ?? 0,
      );
    }

    return result;
  }, [sales]);

  const filteredSellers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sellers.filter((seller) => {
      const name = (
        seller.nome_completo ||
        seller.full_name ||
        ""
      ).toLowerCase();

      const phone = (
        seller.telefone ||
        seller.phone_number ||
        ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        phone.includes(query) ||
        seller.id.toLowerCase().includes(query);

      const matchesKyc =
        kycFilter === "all" ||
        (seller.kyc_status || "").toLowerCase() ===
          kycFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (seller.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesKyc && matchesStatus;
    });
  }, [sellers, search, kycFilter, statusFilter]);

  const totalRevenue = Object.values(stats).reduce(
    (sum, item) => sum + item.revenue,
    0,
  );

  const totalCommissions = Object.values(stats).reduce(
    (sum, item) => sum + item.commissions,
    0,
  );

  const verifiedSellers = sellers.filter(
    (seller) =>
      (seller.kyc_status || "").toLowerCase() === "approved",
  ).length;

  const activeSellers = sellers.filter(
    (seller) =>
      !seller.status ||
      seller.status.toLowerCase() === "active",
  ).length;

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Sellers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage affiliate sellers, verification status, and sales
            performance.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm text-slate-500">Total Sellers</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {sellers.length}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">Verified Sellers</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {verifiedSellers}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">Active Sellers</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {activeSellers}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">Total Commissions</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              R{totalCommissions.toFixed(2)}
            </p>
          </Card>
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search by name, phone, or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={kycFilter}
              onChange={(event) => setKycFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">All KYC statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
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
              Loading sellers...
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-medium text-slate-900">
                No sellers found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                No seller accounts match the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Country
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      KYC
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Registered
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSellers.map((seller) => {
                    const sellerStats = stats[seller.id] || {
                      sales: 0,
                      revenue: 0,
                      commissions: 0,
                    };

                    const name =
                      seller.nome_completo ||
                      seller.full_name ||
                      "Unnamed seller";

                    return (
                      <tr key={seller.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {name}
                          </div>
                          <div className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                            {seller.id}
                          </div>
                          {(seller.telefone ||
                            seller.phone_number) && (
                            <div className="mt-1 text-xs text-slate-500">
                              {seller.telefone ||
                                seller.phone_number}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {seller.pais || seller.country || "—"}
                        </td>

                        <td className="px-6 py-4">
                          <Badge>
                            {seller.kyc_status || "Not submitted"}
                          </Badge>
                        </td>

                        <td className="px-6 py-4">
                          <Badge>
                            {seller.status || "Active"}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {sellerStats.sales}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {sellerStats.revenue.toFixed(2)}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {sellerStats.commissions.toFixed(2)}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(
                            seller.created_at,
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total sales revenue
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                R{totalRevenue.toFixed(2)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">
                Total seller commissions
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                R{totalCommissions.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
