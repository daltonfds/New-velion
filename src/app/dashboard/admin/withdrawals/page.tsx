"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";

interface Withdrawal {
  id: string;
  vendedor_id: string;
  valor_solicitado: number;
  taxa_percentual: number;
  taxa_fixa: number;
  valor_liquido: number;
  metodo: string;
  dados_pagamento: unknown;
  status: string;
  prazo_estimado_dias: number | null;
  created_at: string;
  processado_em: string | null;
}

interface Profile {
  id: string;
  nome_completo: string | null;
  full_name: string | null;
  pais: string | null;
  country: string | null;
  kyc_status: string | null;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const [withdrawalsResult, profilesResult] =
        await Promise.all([
          supabase
            .from("withdrawals")
            .select(
              "id, vendedor_id, valor_solicitado, taxa_percentual, taxa_fixa, valor_liquido, metodo, dados_pagamento, status, prazo_estimado_dias, created_at, processado_em",
            )
            .order("created_at", { ascending: false }),

          supabase
            .from("profiles")
            .select(
              "id, nome_completo, full_name, pais, country, kyc_status",
            ),
        ]);

      if (withdrawalsResult.error) {
        setError(withdrawalsResult.error.message);
        setLoading(false);
        return;
      }

      if (profilesResult.error) {
        setError(profilesResult.error.message);
        setLoading(false);
        return;
      }

      setWithdrawals(
        (withdrawalsResult.data ?? []) as Withdrawal[],
      );
      setProfiles((profilesResult.data ?? []) as Profile[]);
      setLoading(false);
    }

    load();
  }, []);

  const profileMap = useMemo(
    () =>
      Object.fromEntries(
        profiles.map((profile) => [
          profile.id,
          profile,
        ]),
      ),
    [profiles],
  );

  const filteredWithdrawals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return withdrawals.filter((withdrawal) => {
      const profile = profileMap[withdrawal.vendedor_id];

      const sellerName =
        profile?.nome_completo ||
        profile?.full_name ||
        "";

      const matchesSearch =
        !query ||
        withdrawal.id.toLowerCase().includes(query) ||
        sellerName.toLowerCase().includes(query) ||
        withdrawal.vendedor_id
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        withdrawal.status.toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesMethod =
        methodFilter === "all" ||
        withdrawal.metodo.toLowerCase() ===
          methodFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMethod
      );
    });
  }, [
    withdrawals,
    profileMap,
    search,
    statusFilter,
    methodFilter,
  ]);

  const summary = useMemo(() => {
    return withdrawals.reduce(
      (result, withdrawal) => {
        const requested = Number(
          withdrawal.valor_solicitado ?? 0,
        );
        const net = Number(
          withdrawal.valor_liquido ?? 0,
        );
        const percentageFee = Number(
          withdrawal.taxa_percentual ?? 0,
        );
        const fixedFee = Number(
          withdrawal.taxa_fixa ?? 0,
        );

        result.requested += requested;
        result.net += net;
        result.fees += percentageFee + fixedFee;

        if (withdrawal.status === "solicitado") {
          result.requestedCount += 1;
        }

        if (
          withdrawal.status === "em_processamento"
        ) {
          result.processingCount += 1;
        }

        if (withdrawal.status === "pago") {
          result.paidCount += 1;
          result.paid += net;
        }

        if (withdrawal.status === "rejeitado") {
          result.rejectedCount += 1;
        }

        return result;
      },
      {
        requested: 0,
        net: 0,
        fees: 0,
        paid: 0,
        requestedCount: 0,
        processingCount: 0,
        paidCount: 0,
        rejectedCount: 0,
      },
    );
  }, [withdrawals]);

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Withdrawals
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review seller withdrawal requests, fees, payment
            methods, and processing status.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm text-slate-500">
              Requested
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.requested.toFixed(2)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Net Amount
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.net.toFixed(2)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Withdrawal Fees
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.fees.toFixed(2)}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Paid Out
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {summary.paid.toFixed(2)}
            </p>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm text-slate-500">
              Requested
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {summary.requestedCount}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Processing
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {summary.processingCount}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Paid
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {summary.paidCount}
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Rejected
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {summary.rejectedCount}
            </p>
          </Card>
        </div>

        <Card>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search withdrawal or seller..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">All statuses</option>
              <option value="solicitado">Requested</option>
              <option value="em_processamento">
                Processing
              </option>
              <option value="pago">Paid</option>
              <option value="rejeitado">Rejected</option>
            </select>

            <select
              value={methodFilter}
              onChange={(event) =>
                setMethodFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">All payment methods</option>
              <option value="bank_transfer">
                Bank Transfer
              </option>
              <option value="mobile_wallet">
                Mobile Wallet
              </option>
            </select>
          </div>
        </Card>

        {error && (
          <Card>
            <p className="text-sm text-red-600">
              {error}
            </p>
          </Card>
        )}

        <Card>
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading withdrawals...
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-medium text-slate-900">
                No withdrawals found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                No withdrawal requests match the current
                filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Request
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Country
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Fees
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Net
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Method
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Requested At
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredWithdrawals.map(
                    (withdrawal) => {
                      const profile =
                        profileMap[
                          withdrawal.vendedor_id
                        ];

                      const sellerName =
                        profile?.nome_completo ||
                        profile?.full_name ||
                        "Unknown seller";

                      const fees =
                        Number(
                          withdrawal.taxa_percentual ??
                            0,
                        ) +
                        Number(
                          withdrawal.taxa_fixa ?? 0,
                        );

                      return (
                        <tr
                          key={withdrawal.id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <div className="max-w-[180px] truncate text-sm font-medium text-slate-900">
                              {withdrawal.id}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">
                              {sellerName}
                            </div>
                            {profile?.kyc_status && (
                              <div className="mt-1 text-xs text-slate-500">
                                KYC:{" "}
                                {profile.kyc_status}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {profile?.pais ||
                              profile?.country ||
                              "—"}
                          </td>

                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {Number(
                              withdrawal.valor_solicitado ??
                                0,
                            ).toFixed(2)}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {fees.toFixed(2)}
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                            {Number(
                              withdrawal.valor_liquido ??
                                0,
                            ).toFixed(2)}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-700">
                            {withdrawal.metodo}
                          </td>

                          <td className="px-6 py-4">
                            <Badge>
                              {withdrawal.status}
                            </Badge>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(
                              withdrawal.created_at,
                            ).toLocaleString()}
                          </td>
                        </tr>
                      );
                    },
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
