"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Session = {
  id: string;
  created_at: string;
  status: string;
  full_name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  country: string;
  province: string;
  city: string;
  postal_code: string | null;
  address: string;
  address_reference: string | null;
  amount: number;
  currency: string;
  seller_id: string;
  product_id: string;
  affiliate_link: string;
  payment_comparison_status: string;
  external_payment_reference: string | null;
  external_payment_amount: number | null;
  external_payment_currency: string | null;
  external_payment_paid_at: string | null;
  external_payment_method: string | null;
  external_customer_name: string | null;
  external_customer_phone: string | null;
  external_customer_email: string | null;
  external_payment_notes: string | null;
};

export default function AdminCheckoutSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [payment, setPayment] = useState({
    reference: "",
    amount: "",
    currency: "",
    paidAt: "",
    method: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    notes: "",
  });

  async function loadSessions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("checkout_sessions")
      .select(
        "id,created_at,status,full_name,phone,whatsapp,email,country,province,city,postal_code,address,address_reference,amount,currency,seller_id,product_id,affiliate_link,payment_comparison_status,external_payment_reference,external_payment_amount,external_payment_currency,external_payment_paid_at,external_payment_method,external_customer_name,external_customer_phone,external_customer_email,external_payment_notes"
      )
      .order("created_at", { ascending: false });

    if (!error) {
      setSessions((data || []) as Session[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSessions();
  }, []);

  function openSession(session: Session) {
    setSelected(session);
    setError(null);
    setPayment({
      reference: session.external_payment_reference || "",
      amount:
        session.external_payment_amount != null
          ? String(session.external_payment_amount)
          : String(session.amount),
      currency: session.external_payment_currency || session.currency,
      paidAt: session.external_payment_paid_at
        ? new Date(session.external_payment_paid_at).toISOString().slice(0, 16)
        : "",
      method: session.external_payment_method || "",
      customerName: session.external_customer_name || "",
      customerPhone: session.external_customer_phone || "",
      customerEmail: session.external_customer_email || "",
      notes: session.external_payment_notes || "",
    });
  }

  async function registerExternalPayment() {
    if (!selected) return;

    setPaymentSaving(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "record_external_payment",
        {
          p_session_id: selected.id,
          p_external_payment_reference: payment.reference,
          p_external_payment_amount: Number(payment.amount),
          p_external_payment_currency: payment.currency,
          p_external_payment_paid_at: payment.paidAt
            ? new Date(payment.paidAt).toISOString()
            : null,
          p_external_payment_method: payment.method || null,
          p_external_customer_name: payment.customerName || null,
          p_external_customer_phone: payment.customerPhone || null,
          p_external_customer_email: payment.customerEmail || null,
          p_external_payment_notes: payment.notes || null,
        }
      );

      if (rpcError) throw rpcError;

      await loadSessions();

      const { data: refreshed, error: refreshError } = await supabase
        .from("checkout_sessions")
        .select(
          "id,created_at,status,full_name,phone,whatsapp,email,country,province,city,postal_code,address,address_reference,amount,currency,seller_id,product_id,affiliate_link,payment_comparison_status,external_payment_reference,external_payment_amount,external_payment_currency,external_payment_paid_at,external_payment_method,external_customer_name,external_customer_phone,external_customer_email,external_payment_notes"
        )
        .eq("id", selected.id)
        .maybeSingle();

      if (refreshError) throw refreshError;

      if (refreshed) {
        openSession(refreshed as Session);
      }

      const result = Array.isArray(data) ? data[0] : data;

      if (result?.comparison_status === "mismatch") {
        setError(
          "Payment mismatch: amount or currency does not match the NewVelion order."
        );
      } else if (result?.comparison_status === "review") {
        setError(
          "Payment recorded, but the external customer information requires review."
        );
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to register external payment."
      );
    } finally {
      setPaymentSaving(false);
    }
  }

  async function updateStatus(sessionId: string, status: string) {
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Session expired. Please sign in again.");
      }

      if (status === "approved") {
        const response = await fetch("/api/admin/checkout-sessions/approve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || "Failed to approve checkout session."
          );
        }
      } else {
        const response = await fetch("/api/admin/checkout-sessions/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
            status,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || "Failed to update checkout session."
          );
        }
      }

      await loadSessions();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to update checkout session."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Checkout sessions
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Customer delivery information and affiliate attribution collected
            before external payment.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {loading ? (
            <div className="p-8 text-sm text-slate-500">
              Loading checkout sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                No checkout sessions yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Customer submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Customer
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Product
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Amount
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {session.full_name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {session.phone}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-mono text-xs text-slate-500">
                          {session.product_id.slice(0, 8)}...
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Affiliate: {session.affiliate_link}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {Number(session.amount).toLocaleString("pt-MZ", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        {session.currency}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {session.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(session.created_at).toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openSession(session)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Customer details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Session {selected.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Payment verification
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      Compare external payment
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Compare the payment received from PayJSR or another external checkout with the order captured by NewVelion.
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                    {selected.payment_comparison_status === "matched"
                      ? "Matched"
                      : selected.payment_comparison_status === "mismatch"
                        ? "Mismatch"
                        : selected.payment_comparison_status === "review"
                          ? "Needs review"
                          : "Not checked"}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">NewVelion amount</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {Number(selected.amount).toLocaleString("pt-MZ", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      {selected.currency}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">External amount</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {selected.external_payment_amount == null
                        ? "Not registered"
                        : `${Number(
                            selected.external_payment_amount
                          ).toLocaleString("pt-MZ", {
                            minimumFractionDigits: 2,
                          })} ${selected.external_payment_currency || ""}`}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">Payment reference</p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-950">
                      {selected.external_payment_reference || "Not registered"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-600">
                    External payment reference *
                    <input
                      value={payment.reference}
                      onChange={(e) =>
                        setPayment({ ...payment, reference: e.target.value })
                      }
                      placeholder="Transaction ID / payment reference"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="text-xs font-semibold text-slate-600">
                    External amount *
                    <input
                      type="number"
                      step="0.01"
                      value={payment.amount}
                      onChange={(e) =>
                        setPayment({ ...payment, amount: e.target.value })
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="text-xs font-semibold text-slate-600">
                    External currency *
                    <input
                      value={payment.currency}
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          currency: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="ZAR"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm uppercase outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="text-xs font-semibold text-slate-600">
                    Payment date
                    <input
                      type="datetime-local"
                      value={payment.paidAt}
                      onChange={(e) =>
                        setPayment({ ...payment, paidAt: e.target.value })
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="text-xs font-semibold text-slate-600">
                    Payment method
                    <input
                      value={payment.method}
                      onChange={(e) =>
                        setPayment({ ...payment, method: e.target.value })
                      }
                      placeholder="PayJSR / M-Pesa / Card"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="text-xs font-semibold text-slate-600">
                    External customer name
                    <input
                      value={payment.customerName}
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          customerName: e.target.value,
                        })
                      }
                      placeholder={selected.full_name}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="text-xs font-semibold text-slate-600">
                    External customer phone
                    <input
                      value={payment.customerPhone}
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          customerPhone: e.target.value,
                        })
                      }
                      placeholder={selected.phone}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="text-xs font-semibold text-slate-600">
                    External customer email
                    <input
                      type="email"
                      value={payment.customerEmail}
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          customerEmail: e.target.value,
                        })
                      }
                      placeholder={selected.email || "Customer email"}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="sm:col-span-2 text-xs font-semibold text-slate-600">
                    Verification notes
                    <textarea
                      rows={3}
                      value={payment.notes}
                      onChange={(e) =>
                        setPayment({ ...payment, notes: e.target.value })
                      }
                      placeholder="Optional notes about the external payment verification"
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  disabled={paymentSaving}
                  onClick={registerExternalPayment}
                  className="mt-5 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {paymentSaving
                    ? "Comparing payment..."
                    : "Register payment & compare"}
                </button>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Full name</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selected.full_name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">Phone</p>
                <p className="mt-1 text-sm text-slate-900">
                  {selected.phone}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">WhatsApp</p>
                <p className="mt-1 text-sm text-slate-900">
                  {selected.whatsapp || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">Email</p>
                <p className="mt-1 text-sm text-slate-900">
                  {selected.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">Country</p>
                <p className="mt-1 text-sm text-slate-900">
                  {selected.country}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Province / State
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selected.province}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">City</p>
                <p className="mt-1 text-sm text-slate-900">
                  {selected.city}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Postal code
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selected.postal_code || "—"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-slate-500">
                  Delivery address
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selected.address}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-slate-500">
                  Address reference
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {selected.address_reference || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Seller ID
                </p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700">
                  {selected.seller_id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Affiliate link
                </p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700">
                  {selected.affiliate_link}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-slate-500">
                  Expected order value
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {Number(selected.amount).toLocaleString("pt-MZ", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  {selected.currency}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-200 p-6">
              <button
                type="button"
                disabled={
                  selected.payment_comparison_status !== "matched" ||
                  selected.status !== "paid_pending_review"
                }
                onClick={() => updateStatus(selected.id, "approved")}
                className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Approve sale
              </button>

              <button
                type="button"
                onClick={() => updateStatus(selected.id, "rejected")}
                className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
