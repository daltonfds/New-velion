"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";

interface Seller {
  id: string;
  email: string | null;
  nome_completo: string | null;
  full_name: string | null;
  pais: string | null;
  country: string | null;
  country_code: string | null;
  country_calling_code: string | null;
  telefone: string | null;
  phone_number: string | null;
  phone_e164: string | null;
  whatsapp_number: string | null;
  whatsapp_e164: string | null;
  avatar_url: string | null;
  kyc_status: string | null;
  status: string | null;
  sales_activation_status: string | null;
  primary_company_id: string | null;
  created_at: string;
  updated_at: string;
  sales_count: number;
  gross_sales: number;
  commission_earned: number;
  commission_available: number;
  guarantee_retained: number;
  reserved: number;
  withdrawn: number;
  available_balance: number;
  total_balance: number;
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase.rpc(
        "get_admin_seller_overview",
      );

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const baseSellers = (data ?? []).map((seller: Seller) => ({
        ...seller,
        sales_count: Number(seller.sales_count ?? 0),
        gross_sales: Number(seller.gross_sales ?? 0),
        commission_earned: Number(seller.commission_earned ?? 0),
        commission_available: Number(seller.commission_available ?? 0),
        guarantee_retained: Number(seller.guarantee_retained ?? 0),
        reserved: Number(seller.reserved ?? 0),
        withdrawn: Number(seller.withdrawn ?? 0),
        available_balance: Number(seller.available_balance ?? 0),
        total_balance: Number(seller.total_balance ?? 0),
      }));
      const { data: activationRows } = baseSellers.length
        ? await supabase.from("profiles").select("id,sales_activation_status").in("id", baseSellers.map((seller: Seller) => seller.id))
        : { data: [] };
      const activationById = new Map((activationRows ?? []).map((profile: { id: string; sales_activation_status: string | null }) => [profile.id, profile.sales_activation_status]));
      setSellers(baseSellers.map((seller: Seller) => ({
        ...seller,
        sales_activation_status: activationById.get(seller.id) || "inactive",
      })));

      setLoading(false);
    }

    load();
  }, []);

  const filteredSellers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sellers.filter((seller) => {
      const name = (
        seller.nome_completo ||
        seller.full_name ||
        ""
      ).toLowerCase();

      const email = (seller.email || "").toLowerCase();

      const phone = (
        seller.telefone ||
        seller.phone_number ||
        seller.phone_e164 ||
        ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        seller.id.toLowerCase().includes(query);

      const matchesKyc =
        kycFilter === "all" ||
        (seller.kyc_status || "").toLowerCase() ===
          kycFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (seller.sales_activation_status || "inactive").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesKyc && matchesStatus;
    });
  }, [sellers, search, kycFilter, statusFilter]);

  const totals = useMemo(
    () =>
      sellers.reduce(
        (acc, seller) => ({
          sales: acc.sales + seller.sales_count,
          revenue: acc.revenue + seller.gross_sales,
          commissions:
            acc.commissions + seller.commission_earned,
          available:
            acc.available + seller.available_balance,
          retained:
            acc.retained + seller.guarantee_retained,
          totalBalance:
            acc.totalBalance + seller.total_balance,
        }),
        {
          sales: 0,
          revenue: 0,
          commissions: 0,
          available: 0,
          retained: 0,
          totalBalance: 0,
        },
      ),
    [sellers],
  );

  const verifiedSellers = sellers.filter(
    (seller) =>
      (seller.kyc_status || "").toLowerCase() === "approved",
  ).length;

  const activeSellers = sellers.filter(
    (seller) => (seller.sales_activation_status || "inactive").toLowerCase() === "active",
  ).length;

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Sellers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage affiliate sellers, verification status, and
            financial performance.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Card>
            <p className="text-sm text-slate-500">Total Sellers</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {sellers.length}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Verified Sellers
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {verifiedSellers}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">Sales-Active Sellers</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {activeSellers}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">Sales</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {totals.sales}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">Revenue</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              R{totals.revenue.toFixed(2)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">Commissions</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              R{totals.commissions.toFixed(2)}
            </p>
          </Card>
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search by name, email, phone, or ID..."
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
              <option value="not_started">Not started</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">All sales activation states</option>
              <option value="active">Active — first sale made</option>
              <option value="inactive">Inactive — no sale yet</option>
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
              <table className="w-full min-w-[1500px]">
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
                      Account status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Sales activation
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
                      Available
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Retained
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Total Balance
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Registered
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSellers.map((seller) => {
                    const name =
                      seller.nome_completo ||
                      seller.full_name ||
                      "Unnamed seller";

                    return (
                      <tr
                        key={seller.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {name}
                          </div>
                          {seller.email && (
                            <div className="mt-1 text-xs text-slate-500">
                              {seller.email}
                            </div>
                          )}
                          <div className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                            {seller.id}
                          </div>
                          {(seller.telefone ||
                            seller.phone_number ||
                            seller.phone_e164) && (
                            <div className="mt-1 text-xs text-slate-500">
                              {seller.telefone ||
                                seller.phone_number ||
                                seller.phone_e164}
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
                          <Badge>{seller.status || "active"}</Badge>
                        </td>

                        <td className="px-6 py-4">
                          <Badge>{(seller.sales_activation_status || "inactive") === "active" ? "Active — first sale" : "Inactive — no sale"}</Badge>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {seller.sales_count}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          R{seller.gross_sales.toFixed(2)}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          R{seller.commission_earned.toFixed(2)}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          R{seller.available_balance.toFixed(2)}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          R{seller.guarantee_retained.toFixed(2)}
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          R{seller.total_balance.toFixed(2)}
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
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-sm text-slate-500">
                Total sales revenue
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                R{totals.revenue.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total seller commissions
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                R{totals.commissions.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Available to sellers
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                R{totals.available.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Seller balances
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                R{totals.totalBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
