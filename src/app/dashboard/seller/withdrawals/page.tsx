"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";

import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  createSellerWithdrawal,
  getFinanceSummary,
  getFinanceWithdrawals,
  getSellerSettings,
} from "@/lib/newvelion-api";

type PaymentMethod = {
  id?: string;
  method?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  bank_name?: string | null;
  branch_code?: string | null;
  mobile_number?: string | null;
  destination_details?: Record<string, unknown> | null;
  status?: string | null;
};

type Withdrawal = {
  id: string;
  amount?: number | null;
  currency?: string | null;
  method?: string | null;
  status?: string | null;
  requested_at?: string | null;
  created_at?: string | null;
  payment_method_id?: string | null;
  payment_method_snapshot?: Record<string, unknown> | null;
};

const METHOD_LABELS: Record<string, string> = {
  mpesa: "M-Pesa",
  emola: "e-Mola",
  mobile_money: "Mobile Money",
  bank_transfer: "Bank Transfer",
  bank: "Bank Transfer",
  paypal: "PayPal",
  other: "Other",
};

function methodLabel(method?: string | null) {
  return METHOD_LABELS[String(method || "").toLowerCase()] || method || "Payment method";
}

function formatMoney(value: number, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function destination(method: PaymentMethod) {
  const type = String(method.method || "").toLowerCase();

  if (["mpesa", "emola", "mobile_money"].includes(type)) {
    return method.mobile_number || method.account_number || "Mobile number not set";
  }

  if (["bank", "bank_transfer"].includes(type)) {
    return method.account_number || "Account number not set";
  }

  if (type === "paypal") {
    return method.account_number || method.mobile_number || "PayPal account not set";
  }

  return (
    method.account_number ||
    method.mobile_number ||
    String(method.destination_details?.destination || "") ||
    "Destination not set"
  );
}

export default function SellerWithdrawalsPage() {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("ZAR");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedMethod = useMemo(
    () =>
      methods.find(
        (method) => String(method.id || "") === selectedMethodId
      ),
    [methods, selectedMethodId]
  );

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [finance, settings, withdrawalRows] = await Promise.all([
        getFinanceSummary(),
        getSellerSettings(),
        getFinanceWithdrawals(),
      ]);

      const wallet = finance?.data?.wallet || finance?.wallet || {};
      setBalance(Number(wallet?.available_balance ?? 0));
      setCurrency(String(wallet?.currency || finance?.data?.currency || "ZAR"));

      const savedMethods =
        settings?.data?.payment_methods ||
        settings?.payment_methods ||
        [];

      const activeMethods = Array.isArray(savedMethods)
        ? savedMethods.filter(
            (method: PaymentMethod) =>
              String(method?.status || "active").toLowerCase() === "active"
          )
        : [];

      setMethods(activeMethods);

      if (
        selectedMethodId &&
        !activeMethods.some(
          (method: PaymentMethod) => method.id === selectedMethodId
        )
      ) {
        setSelectedMethodId("");
      }

      setWithdrawals(
        Array.isArray(withdrawalRows)
          ? withdrawalRows
          : Array.isArray(withdrawalRows?.data)
            ? withdrawalRows.data
            : []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load withdrawals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function requestWithdrawal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const value = Number(amount);

    if (!selectedMethodId) {
      setError("Select a saved payment method.");
      return;
    }

    if (!value || value <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }

    if (value > balance) {
      setError("The withdrawal amount exceeds your available balance.");
      return;
    }

    setSubmitting(true);

    try {
      await createSellerWithdrawal({
        amount: value,
        paymentMethodId: selectedMethodId,
      });

      setAmount("");
      setSuccess(
        "Withdrawal request submitted successfully. Your available balance has been updated."
      );

      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create withdrawal."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardShell area="seller" activeKey="withdrawals" title="Withdrawals" subtitle="Manage your wallet withdrawals.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Finance</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Withdrawals
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Request a withdrawal using one of your saved payment methods.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Available balance
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {formatMoney(balance, currency)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Saved methods
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {methods.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Withdrawal requests
                </p>
                <p className="mt-1 text-xl font-bold text-slate-950">
                  {withdrawals.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={requestWithdrawal}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Request withdrawal
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose which saved payment method should receive this withdrawal.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Payment method
                </label>

                {methods.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-800">
                      No active payment methods
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add a payment method in Settings before requesting a withdrawal.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {methods.map((method) => {
                      const id = String(method.id || "");
                      const selected = id === selectedMethodId;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSelectedMethodId(id)}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-3">
                              <div
                                className={`rounded-xl p-2.5 ${
                                  selected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <CreditCard className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-950">
                                  {methodLabel(method.method)}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {method.account_name || "Account holder"}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {destination(method)}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`mt-1 h-5 w-5 rounded-full border-2 ${
                                selected
                                  ? "border-blue-600 bg-blue-600"
                                  : "border-slate-300"
                              }`}
                            >
                              {selected && (
                                <div className="m-1 h-2.5 w-2.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="withdrawal-amount"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Amount
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    {currency}
                  </span>
                  <input
                    id="withdrawal-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-16 pr-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>Available</span>
                  <span>{formatMoney(balance, currency)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  loading ||
                  methods.length === 0 ||
                  !selectedMethodId ||
                  !amount
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Request withdrawal
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Selected destination
            </h2>

            {selectedMethod ? (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-600 p-2.5 text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-950">
                      {methodLabel(selectedMethod.method)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Saved payment destination
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Account name</span>
                    <span className="text-right font-semibold text-slate-900">
                      {selectedMethod.account_name || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Destination</span>
                    <span className="text-right font-semibold text-slate-900">
                      {destination(selectedMethod)}
                    </span>
                  </div>

                  {selectedMethod.bank_name && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Bank</span>
                      <span className="text-right font-semibold text-slate-900">
                        {selectedMethod.bank_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <CreditCard className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Select a payment method
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  The selected saved method will be used for this withdrawal.
                </p>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Important
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your saved payment methods remain in Settings. For each withdrawal,
                you choose which active method should receive the funds.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Withdrawal history
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Live withdrawal requests from your Seller account.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center px-6 py-14 text-sm text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading withdrawals...
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Wallet className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">
                No withdrawal requests yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your withdrawal requests will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Method</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {withdrawals.map((withdrawal) => {
                    const snapshot = withdrawal.payment_method_snapshot || {};
                    const method =
                      withdrawal.method ||
                      String(snapshot.method || "—");

                    const status = String(
                      withdrawal.status || "pending"
                    ).toLowerCase();

                    return (
                      <tr key={withdrawal.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {formatDate(
                            withdrawal.requested_at || withdrawal.created_at
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">
                            {methodLabel(method)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {String(
                              snapshot.account_number ||
                                snapshot.mobile_number ||
                                ""
                            )}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-950">
                          {formatMoney(
                            Number(withdrawal.amount || 0),
                            withdrawal.currency || currency
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                              status === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : status === "paid" || status === "completed"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : status === "rejected" || status === "failed"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
