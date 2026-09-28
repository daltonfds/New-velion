"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { getWalletSummary } from "@/lib/services/wallet";

interface Withdrawal {
  id: string;
  valor_solicitado: number;
  taxa_percentual: number;
  taxa_fixa: number;
  valor_liquido: number;
  metodo: "bank_transfer" | "mobile_wallet";
  dados_pagamento: Record<string, unknown> | null;
  status:
    | "solicitado"
    | "em_processamento"
    | "pago"
    | "rejeitado"
    | "cancelado";
  prazo_estimado_dias: number;
  created_at: string;
  processado_em: string | null;
}

interface PayoutMethod {
  id: string;
  pais: string;
  metodo: string;
  ativo: boolean;
}

interface WalletSummary {
  disponivel: number;
  retido: number;
  reservado: number;
  saldo_total: number;
}

export default function SellerWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [wallet, setWallet] = useState<WalletSummary>({
    disponivel: 0,
    retido: 0,
    reservado: 0,
    saldo_total: 0,
  });

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<
    "bank_transfer" | "mobile_wallet"
  >("bank_transfer");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const user = await getCurrentUser();

      if (!user) {
        setError("You must be signed in to manage withdrawals.");
        setLoading(false);
        return;
      }

      const [
        walletResult,
        withdrawalsResult,
        methodsResult,
      ] = await Promise.all([
        getWalletSummary(user.id),
        supabase
          .from("withdrawals")
          .select(
            `
              id,
              valor_solicitado,
              taxa_percentual,
              taxa_fixa,
              valor_liquido,
              metodo,
              dados_pagamento,
              status,
              prazo_estimado_dias,
              created_at,
              processado_em
            `,
          )
          .eq("vendedor_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("payout_methods")
          .select("id, pais, metodo, ativo")
          .eq("ativo", true)
          .order("pais", { ascending: true }),
      ]);

      if (walletResult) {
        setWallet(walletResult);
      }

      if (withdrawalsResult.error) {
        setError(withdrawalsResult.error.message);
      } else {
        setWithdrawals(
          (withdrawalsResult.data ?? []) as Withdrawal[],
        );
      }

      if (!methodsResult.error) {
        setMethods(
          (methodsResult.data ?? []) as PayoutMethod[],
        );
      }

      setLoading(false);
    }

    load();
  }, []);

  const numericAmount = Number(amount) || 0;

  const estimatedFee = useMemo(() => {
    return numericAmount * 0.05 + (numericAmount > 0 ? 10 : 0);
  }, [numericAmount]);

  const estimatedNet = Math.max(
    numericAmount - estimatedFee,
    0,
  );

  const availableMethods = useMemo(() => {
    const unique = new Set<string>();

    return methods.filter((item) => {
      if (unique.has(item.metodo)) return false;
      unique.add(item.metodo);
      return true;
    });
  }, [methods]);

  async function requestWithdrawal() {
    setError("");
    setSuccess("");

    const user = await getCurrentUser();

    if (!user) {
      setError("You must be signed in to request a withdrawal.");
      return;
    }

    if (numericAmount <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }

    if (numericAmount > wallet.disponivel) {
      setError(
        "The withdrawal amount cannot exceed your available balance.",
      );
      return;
    }

    if (!paymentDetails.trim()) {
      setError("Enter your payment details.");
      return;
    }

    setSubmitting(true);

    try {
      let parsedDetails: Record<string, unknown>;

      try {
        parsedDetails = JSON.parse(paymentDetails);
      } catch {
        parsedDetails = {
          details: paymentDetails.trim(),
        };
      }

      const { data, error: rpcError } = await supabase.rpc(
        "server_request_withdrawal",
        {
          p_vendedor_id: user.id,
          p_valor_solicitado: numericAmount,
          p_metodo: method,
          p_dados_pagamento: parsedDetails,
        },
      );

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      setSuccess(
        "Your withdrawal request has been submitted successfully.",
      );
      setAmount("");
      setPaymentDetails("");

      const [newWallet, newWithdrawals] =
        await Promise.all([
          getWalletSummary(user.id),
          supabase
            .from("withdrawals")
            .select(
              `
                id,
                valor_solicitado,
                taxa_percentual,
                taxa_fixa,
                valor_liquido,
                metodo,
                dados_pagamento,
                status,
                prazo_estimado_dias,
                created_at,
                processado_em
              `,
            )
            .eq("vendedor_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

      setWallet(newWallet);

      if (!newWithdrawals.error) {
        setWithdrawals(
          (newWithdrawals.data ?? []) as Withdrawal[],
        );
      }

      void data;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to submit the withdrawal request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(value);
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function statusClass(status: Withdrawal["status"]) {
    if (status === "pago") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "rejeitado" || status === "cancelado") {
      return "bg-red-50 text-red-700";
    }

    if (status === "em_processamento") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-amber-50 text-amber-700";
  }

  function statusLabel(status: Withdrawal["status"]) {
    const labels: Record<Withdrawal["status"], string> = {
      solicitado: "Requested",
      em_processamento: "Processing",
      pago: "Paid",
      rejeitado: "Rejected",
      cancelado: "Cancelled",
    };

    return labels[status];
  }

  function methodLabel(value: string) {
    if (value === "mobile_wallet") {
      return "Mobile Wallet";
    }

    return "Bank Transfer";
  }

  return (
    <AppShell area="seller">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Withdrawals
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Request withdrawals and track your payout history.
          </p>
        </div>

        {error && (
          <Card>
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </Card>
        )}

        {success && (
          <Card>
            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          </Card>
        )}

        {loading ? (
          <Card>
            <div className="py-12 text-center text-sm text-slate-500">
              Loading withdrawals...
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <p className="text-sm text-slate-500">
                  Available Balance
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatMoney(wallet.disponivel)}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-slate-500">
                  Balance on Hold
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatMoney(wallet.retido)}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-slate-500">
                  Total Balance
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatMoney(wallet.saldo_total)}
                </p>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
              <Card>
                <div className="mb-5">
                  <h2 className="font-semibold text-slate-900">
                    Request Withdrawal
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Funds are subject to your account and payout requirements.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(event) =>
                        setAmount(event.target.value)
                      }
                      placeholder="0.00"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Withdrawal fee
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatMoney(estimatedFee)}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-slate-500">
                        Estimated net
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatMoney(estimatedNet)}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      Estimated fee: 5% + R10 fixed fee.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Payout Method
                    </label>

                    <select
                      value={method}
                      onChange={(event) =>
                        setMethod(
                          event.target.value as
                            | "bank_transfer"
                            | "mobile_wallet",
                        )
                      }
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
                    >
                      {availableMethods.length > 0 ? (
                        availableMethods.map((item) => (
                          <option
                            key={item.id}
                            value={item.metodo}
                          >
                            {methodLabel(item.metodo)}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="bank_transfer">
                            Bank Transfer
                          </option>
                          <option value="mobile_wallet">
                            Mobile Wallet
                          </option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Payment Details
                    </label>

                    <textarea
                      value={paymentDetails}
                      onChange={(event) =>
                        setPaymentDetails(event.target.value)
                      }
                      rows={5}
                      placeholder={
                        'Example: bank name, account holder, account number, branch'
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      You can enter plain text or JSON.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={requestWithdrawal}
                    disabled={
                      submitting ||
                      numericAmount <= 0 ||
                      numericAmount > wallet.disponivel
                    }
                    className="h-11 w-full rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Request Withdrawal"}
                  </button>
                </div>
              </Card>

              <Card>
                <div className="mb-5">
                  <h2 className="font-semibold text-slate-900">
                    Withdrawal History
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Track every withdrawal request from your account.
                  </p>
                </div>

                {withdrawals.length === 0 ? (
                  <div className="rounded-lg bg-slate-50 py-12 text-center">
                    <p className="text-sm text-slate-500">
                      No withdrawal requests yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                          <th className="pb-3 pr-4 font-medium">
                            Request
                          </th>
                          <th className="pb-3 pr-4 font-medium">
                            Amount
                          </th>
                          <th className="pb-3 pr-4 font-medium">
                            Fee
                          </th>
                          <th className="pb-3 pr-4 font-medium">
                            Net
                          </th>
                          <th className="pb-3 pr-4 font-medium">
                            Method
                          </th>
                          <th className="pb-3 pr-4 font-medium">
                            Status
                          </th>
                          <th className="pb-3 font-medium">
                            Date
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {withdrawals.map((withdrawal) => {
                          const fee =
                            Number(
                              withdrawal.taxa_fixa || 0,
                            ) +
                            Number(
                              withdrawal.valor_solicitado || 0,
                            ) *
                              (Number(
                                withdrawal.taxa_percentual || 0,
                              ) /
                                100);

                          return (
                            <tr key={withdrawal.id}>
                              <td className="py-4 pr-4">
                                <p className="font-medium text-slate-900">
                                  {withdrawal.id.slice(0, 8)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  ETA:{" "}
                                  {
                                    withdrawal.prazo_estimado_dias
                                  }{" "}
                                  days
                                </p>
                              </td>

                              <td className="py-4 pr-4 text-sm text-slate-700">
                                {formatMoney(
                                  Number(
                                    withdrawal.valor_solicitado,
                                  ),
                                )}
                              </td>

                              <td className="py-4 pr-4 text-sm text-slate-700">
                                {formatMoney(fee)}
                              </td>

                              <td className="py-4 pr-4 text-sm font-medium text-slate-900">
                                {formatMoney(
                                  Number(
                                    withdrawal.valor_liquido,
                                  ),
                                )}
                              </td>

                              <td className="py-4 pr-4 text-sm text-slate-700">
                                {methodLabel(
                                  withdrawal.metodo,
                                )}
                              </td>

                              <td className="py-4 pr-4">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                    withdrawal.status,
                                  )}`}
                                >
                                  {statusLabel(
                                    withdrawal.status,
                                  )}
                                </span>
                              </td>

                              <td className="py-4 text-sm text-slate-500">
                                {formatDate(
                                  withdrawal.created_at,
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
