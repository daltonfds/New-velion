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
  email: string | null;
  telefone: string | null;
  phone: string | null;
  whatsapp: string | null;
  kyc_status: string | null;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selected, setSelected] = useState<Withdrawal | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleWithdrawalAction = async (
    withdrawalId: string,
    action: "approve" | "reject",
  ) => {
    if (actionLoading) return;

    const confirmed = window.confirm(
      action === "approve"
        ? "Approve this withdrawal?"
        : "Reject this withdrawal? The amount will be returned to the seller's available balance.",
    );

    if (!confirmed) return;

    setActionLoading(true);

    try {
      const { error } = await supabase.rpc(
        action === "approve"
          ? "admin_approve_withdrawal"
          : "admin_reject_withdrawal",
        action === "approve"
          ? {
              p_withdrawal_id: withdrawalId,
              p_payment_reference: null,
              p_note: "Withdrawal approved by admin",
            }
          : {
              p_withdrawal_id: withdrawalId,
              p_note: "Withdrawal rejected by admin",
            },
      );

      if (error) throw error;

      await load();
    } catch (error) {
      console.error(error);
      window.alert(
        error instanceof Error ? error.message : "Failed to update withdrawal.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const load = async () => {
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
  };

  useEffect(() => {
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

      const paymentSearch = JSON.stringify(
        withdrawal.dados_pagamento ?? {},
      ).toLowerCase();

      const matchesSearch =
        !query ||
        withdrawal.id.toLowerCase().includes(query) ||
        sellerName.toLowerCase().includes(query) ||
        String(profile?.email ?? "").toLowerCase().includes(query) ||
        String(profile?.telefone ?? profile?.phone ?? "").toLowerCase().includes(query) ||
        withdrawal.vendedor_id.toLowerCase().includes(query) ||
        paymentSearch.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        withdrawal.status.toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesMethod =
        methodFilter === "all" ||
        withdrawal.metodo.toLowerCase() ===
          methodFilter.toLowerCase();

      const matchesCountry =
        countryFilter === "all" ||
        (profile?.pais || profile?.country || "") === countryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMethod &&
        matchesCountry
      );
    });
  }, [
    withdrawals,
    profileMap,
    search,
    statusFilter,
    methodFilter,
    countryFilter,
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


  async function openDetails(withdrawal: Withdrawal) {
    setSelected(withdrawal);
    setDetail(null);
    setDetailLoading(true);
    setActionError("");
    setActionNote("");
    setPaymentReference("");
    setRejectionReason("");

    const { data, error } = await supabase.rpc(
      "admin_get_withdrawal_detail",
      { p_withdrawal_id: withdrawal.id },
    );

    if (error) {
      setActionError(error.message);
    } else {
      setDetail(data);
    }

    setDetailLoading(false);
  }

  async function updateStatus(status: string) {
    if (!selected) return;

    if (status === "rejeitado" && !rejectionReason.trim()) {
      setActionError("A rejection reason is required.");
      return;
    }

    if (status === "pago" && !paymentReference.trim()) {
      setActionError("A payment reference is required before marking as paid.");
      return;
    }

    setActionLoading(true);
    setActionError("");

    const { error } = await supabase.rpc(
      "admin_update_withdrawal_status",
      {
        p_withdrawal_id: selected.id,
        p_status: status,
        p_note:
          status === "rejeitado"
            ? rejectionReason.trim()
            : actionNote.trim() || null,
        p_payment_reference:
          status === "pago"
            ? paymentReference.trim()
            : null,
      },
    );

    if (error) {
      setActionError(error.message);
      setActionLoading(false);
      return;
    }

    await load();

    const updated = withdrawals.find(
      (item) => item.id === selected.id,
    );

    if (updated) {
      const next = { ...updated, status };
      setSelected(next);
      await openDetails(next);
    }

    setActionLoading(false);
  }

  const current = detail?.withdrawal ?? selected;
  const seller = detail?.seller ?? (
    current ? profileMap[current.vendedor_id] : null
  );
  const wallet = detail?.wallet ?? {};
  const payment = current?.dados_pagamento ?? {};

  const paymentValue = (...keys: string[]) => {
    for (const key of keys) {
      if (
        payment[key] !== undefined &&
        payment[key] !== null &&
        payment[key] !== ""
      ) {
        return String(payment[key]);
      }
    }
    return "—";
  };

  const sellerName =
    seller?.nome_completo ||
    seller?.full_name ||
    "Unknown seller";

  const paymentPhone = paymentValue(
    "phone",
    "telefone",
    "wallet_number",
    "numero",
    "mobile",
    "mpesa_number",
  );

  const paymentAccount = paymentValue(
    "account_number",
    "account",
    "bank_account",
    "iban",
    "number",
  );

  const paymentHolder = paymentValue(
    "holder_name",
    "account_holder",
    "titular",
    "nome_titular",
    "name",
  );

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
          <div className="grid gap-4 md:grid-cols-4">
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
              value={countryFilter}
              onChange={(event) =>
                setCountryFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="all">All countries</option>
              {Array.from(
                new Set(
                  profiles
                    .map((profile) => profile.pais || profile.country)
                    .filter(Boolean),
                ),
              ).map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
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
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Actions
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

                          <td className="px-6 py-4">
                            <button
                              onClick={() => openDetails(withdrawal)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              View details
                            </button>
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

      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 p-4 md:p-8">
          <div className="mx-auto max-w-6xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Withdrawal
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {selected.id}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {current?.status}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelected(null);
                  setDetail(null);
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                Close
              </button>
            </div>

            {detailLoading ? (
              <div className="px-6 py-16 text-center text-sm text-slate-500">
                Loading withdrawal details...
              </div>
            ) : (
              <div className="space-y-6 p-6">
                {actionError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {actionError}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <p className="text-xs text-slate-500">
                      Requested amount
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      R{Number(current?.valor_solicitado || 0).toFixed(2)}
                    </p>
                  </Card>

                  <Card>
                    <p className="text-xs text-slate-500">
                      Platform fee
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      R{(
                        Number(current?.taxa_percentual || 0) +
                        Number(current?.taxa_fixa || 0)
                      ).toFixed(2)}
                    </p>
                  </Card>

                  <Card>
                    <p className="text-xs text-slate-500">
                      Net amount
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      R{Number(current?.valor_liquido || 0).toFixed(2)}
                    </p>
                  </Card>

                  <Card>
                    <p className="text-xs text-slate-500">
                      Converted amount
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {current?.valor_convertido
                        ? `${current.payout_currency || "MZN"} ${Number(
                            current.valor_convertido,
                          ).toFixed(2)}`
                        : "—"}
                    </p>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Withdrawal details
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        ["Withdrawal ID", current?.id],
                        ["Seller", sellerName],
                        ["Seller email", seller?.email],
                        ["Country", seller?.pais || seller?.country],
                        ["KYC status", seller?.kyc_status],
                        ["Currency", current?.wallet_currency],
                        ["Exchange rate", current?.exchange_rate],
                        ["Payment method", current?.metodo],
                        [
                          "Requested date",
                          current?.created_at
                            ? new Date(current.created_at).toLocaleString()
                            : "—",
                        ],
                        [
                          "Processing date",
                          current?.processado_em
                            ? new Date(current.processado_em).toLocaleString()
                            : "—",
                        ],
                        [
                          "Paid date",
                          current?.status === "pago" &&
                          current?.processado_em
                            ? new Date(
                                current.processado_em,
                              ).toLocaleString()
                            : "—",
                        ],
                        ["Current status", current?.status],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-lg bg-slate-50 p-3"
                        >
                          <p className="text-xs text-slate-500">
                            {label}
                          </p>
                          <p className="mt-1 break-all text-sm font-medium text-slate-900">
                            {value || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Payment destination
                    </h3>

                    <div className="mt-4 rounded-lg border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Send payment to
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {paymentPhone !== "—"
                          ? paymentPhone
                          : paymentAccount}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500">
                          Account holder
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {paymentHolder}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Phone / wallet number
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {paymentPhone}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Account / IBAN
                        </p>
                        <p className="mt-1 break-all text-sm font-medium text-slate-900">
                          {paymentAccount}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Provider
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {paymentValue(
                            "provider",
                            "bank_name",
                            "wallet_provider",
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Seller information
                    </h3>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {[
                        ["Seller", sellerName],
                        ["Email", seller?.email],
                        ["Country", seller?.pais || seller?.country],
                        ["KYC", seller?.kyc_status],
                        ["Phone", seller?.telefone || seller?.phone],
                        ["WhatsApp", seller?.whatsapp],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs text-slate-500">
                            {label}
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {value || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Seller wallet
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        [
                          "Available balance",
                          wallet.available_balance ??
                            wallet.disponivel,
                        ],
                        [
                          "Balance on hold",
                          wallet.on_hold ?? wallet.retido,
                        ],
                        [
                          "Reserved for withdrawals",
                          wallet.reserved ?? wallet.reservado,
                        ],
                        [
                          "Total balance",
                          wallet.total_balance ??
                            wallet.saldo_total,
                        ],
                        [
                          "Total earned",
                          wallet.total_earned ??
                            wallet.total_ganho,
                        ],
                        [
                          "Total withdrawn",
                          wallet.total_withdrawn ??
                            wallet.sacado,
                        ],
                        [
                          "Previous withdrawals",
                          wallet.previous_withdrawals_count ??
                            wallet.withdrawals_count,
                        ],
                        [
                          "Last withdrawal",
                          wallet.last_withdrawal_at
                            ? new Date(
                                wallet.last_withdrawal_at,
                              ).toLocaleString()
                            : "—",
                        ],
                        [
                          "KYC status",
                          seller?.kyc_status || "—",
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-lg bg-slate-50 p-3"
                        >
                          <p className="text-xs text-slate-500">
                            {label}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {typeof value === "number"
                              ? `R${value.toFixed(2)}`
                              : value || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {(current?.status === "solicitado" ||
                  current?.status === "em_processamento") && (
                  <Card>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Processing actions
                    </h3>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {current?.status === "solicitado" && (
                        <button
                          disabled={actionLoading}
                          onClick={() =>
                            updateStatus("em_processamento")
                          }
                          className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Approve / Process
                        </button>
                      )}

                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          updateStatus("rejeitado")
                        }
                        className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>

                      {current?.status === "em_processamento" && (
                        <button
                          disabled={actionLoading}
                          onClick={() =>
                            updateStatus("pago")
                          }
                          className="rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Mark as paid
                        </button>
                      )}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <textarea
                        value={actionNote}
                        onChange={(event) =>
                          setActionNote(event.target.value)
                        }
                        placeholder="Processing note"
                        className="min-h-24 rounded-lg border border-slate-200 p-3 text-sm"
                      />

                      <div className="space-y-3">
                        <input
                          value={rejectionReason}
                          onChange={(event) =>
                            setRejectionReason(event.target.value)
                          }
                          placeholder="Rejection reason"
                          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                        />

                        <input
                          value={paymentReference}
                          onChange={(event) =>
                            setPaymentReference(event.target.value)
                          }
                          placeholder="Payment reference"
                          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
                        />
                      </div>
                    </div>
                  </Card>
                )}

                <Card>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Audit history
                  </h3>

                  <div className="mt-4 divide-y divide-slate-100">
                    {(detail?.audit_log ?? []).length === 0 ? (
                      <p className="py-4 text-sm text-slate-500">
                        No audit events yet.
                      </p>
                    ) : (
                      detail.audit_log.map(
                        (event: any, index: number) => (
                          <div
                            key={event.id || index}
                            className="flex flex-wrap items-center justify-between gap-3 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {event.from_status || "New"} →{" "}
                                {event.to_status}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {event.note || "No note"}
                              </p>
                            </div>

                            <p className="text-xs text-slate-500">
                              {event.created_at
                                ? new Date(
                                    event.created_at,
                                  ).toLocaleString()
                                : "—"}
                            </p>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

    </AppShell>
  );
}
