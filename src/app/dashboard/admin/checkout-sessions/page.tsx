"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";
import { notify } from "@/lib/notify";

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
  checkout_url: string;
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
  product?: {
    nome: string;
    slug: string | null;
    fotos: string[] | null;
  } | null;
};

function money(value: number, currency: string) {
  return `${Number(value).toLocaleString("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export default function AdminCheckoutSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Session | null>(null);
  const [error, setError] = useState("");
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
    setError("");

    const { data, error: sessionsError } = await supabase
      .from("checkout_sessions")
      .select(`
        id,
        created_at,
        status,
        full_name,
        phone,
        whatsapp,
        email,
        country,
        province,
        city,
        postal_code,
        address,
        address_reference,
        amount,
        currency,
        seller_id,
        product_id,
        affiliate_link,
        checkout_url,
        payment_comparison_status,
        external_payment_reference,
        external_payment_amount,
        external_payment_currency,
        external_payment_paid_at,
        external_payment_method,
        external_customer_name,
        external_customer_phone,
        external_customer_email,
        external_payment_notes,
        products (
          nome,
          slug,
          fotos
        )
      `)
      .order("created_at", { ascending: false });

    if (sessionsError) {
      setError(sessionsError.message);
      setSessions([]);
    } else {
      const normalized = ((data || []) as any[]).map((row) => ({
        ...row,
        product: Array.isArray(row.products)
          ? row.products[0] || null
          : row.products || null,
      }));

      setSessions(normalized as Session[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSessions();
  }, []);

  function openSession(session: Session) {
    setSelected(session);
    setError("");

    setPayment({
      reference: session.external_payment_reference || "",
      amount:
        session.external_payment_amount != null
          ? String(session.external_payment_amount)
          : String(session.amount),
      currency:
        session.external_payment_currency || session.currency,
      paidAt: session.external_payment_paid_at
        ? new Date(session.external_payment_paid_at)
            .toISOString()
            .slice(0, 16)
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
    setError("");

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

      if (rpcError) {
        notify.error(
          "Falha ao registrar pagamento",
          rpcError.message
        );
        throw rpcError;
      }

      const result = Array.isArray(data) ? data[0] : data;

      if (result?.comparison_status === "mismatch") {
        notify.warning(
          "Pagamento registrado com divergência",
          "O valor ou a moeda do pagamento não corresponde ao pedido NewVelion."
        );
      } else if (result?.comparison_status === "review") {
        notify.warning(
          "Pagamento requer revisão",
          "O pagamento foi registrado, mas os dados do cliente precisam ser revisados."
        );
      } else {
        notify.success(
          "Pagamento registrado",
          "O pagamento externo foi registrado com sucesso."
        );
      }

      await loadSessions();

      const refreshed = sessions.find((item) => item.id === selected.id);

      if (refreshed) {
        openSession(refreshed);
      }

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
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Session expired. Please sign in again.");
      }

      if (status === "approved") {
        const { data, error } = await supabase.rpc(
          "approve_checkout_session",
          {
            p_session_id: sessionId,
          }
        );

        if (error) {
          console.error("Checkout approval RPC failed:", error);
          notify.error(
            "Falha ao aprovar checkout",
            error.message || "Failed to approve checkout session."
          );
          throw new Error(
            error.message || "Failed to approve checkout session."
          );
        }

        const saleId = Array.isArray(data)
          ? data[0]?.sale_id
          : data?.sale_id;

        if (!saleId) {
          notify.error(
            "Falha ao aprovar checkout",
            "O checkout foi processado, mas nenhuma venda foi criada."
          );
          throw new Error(
            "Checkout was approved but no sale was created."
          );
        }

        notify.success(
          "Checkout aprovado",
          "O checkout foi aprovado e a venda foi criada com sucesso."
        );
      } else {
        const response = await fetch(
          "/api/admin/checkout-sessions/status",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              session_id: sessionId,
              status,
            }),
          }
        );

        const responseText = await response.text();

        let result: { error?: string } = {};

        try {
          result = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          throw new Error(
            `Checkout API returned an invalid response (${response.status}).`
          );
        }

        if (!response.ok) {
          notify.error(
            status === "rejected"
              ? "Falha ao rejeitar checkout"
              : "Falha ao atualizar checkout",
            result?.error || "Failed to update checkout session."
          );
          throw new Error(
            result?.error || "Failed to update checkout session."
          );
        }

        notify.success(
          status === "rejected"
            ? "Checkout rejeitado"
            : "Checkout atualizado",
          status === "rejected"
            ? "O checkout foi rejeitado com sucesso."
            : "O status do checkout foi atualizado com sucesso."
        );
      }

      setSelected(null);
      await loadSessions();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to update checkout session."
      );
    }
  }

  const pending = sessions.filter(
    (session) => session.status === "pending"
  ).length;

  const paidReview = sessions.filter(
    (session) => session.status === "paid_pending_review"
  ).length;

  const approved = sessions.filter(
    (session) => session.status === "approved"
  ).length;

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Commerce
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Checkout sessions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Customer information captured before the external checkout.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Pending", pending],
            ["Paid / Review", paidReview],
            ["Approved", approved],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {loading ? (
            <div className="p-8 text-sm text-slate-500">
              Loading checkout sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-slate-800">
                No checkout sessions yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Customer submissions will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Customer
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Product
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Order value
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Payment
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Created
                    </th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {session.full_name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {session.email || session.phone}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {session.product?.nome || "Product"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {session.affiliate_link}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {money(Number(session.amount), session.currency)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            session.payment_comparison_status === "matched"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : session.payment_comparison_status === "mismatch"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : session.payment_comparison_status === "review"
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {session.payment_comparison_status === "matched"
                            ? "Matched"
                            : session.payment_comparison_status === "mismatch"
                              ? "Mismatch"
                              : session.payment_comparison_status === "review"
                                ? "Review"
                                : "Not checked"}
                        </span>
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
                          View details
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
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Checkout session
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {selected.product?.nome || "Product"}
                </h2>
                <p className="mt-1 break-all text-xs text-slate-500">
                  {selected.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 p-6">
              <section>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-950">
                    Customer information
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Information submitted on the NewVelion product page.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["Full name", selected.full_name],
                    ["Email", selected.email || "—"],
                    ["Phone", selected.phone],
                    ["WhatsApp", selected.whatsapp || "—"],
                    ["Country", selected.country],
                    ["Province / State", selected.province],
                    ["City", selected.city],
                    ["Postal code", selected.postal_code || "—"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-1 break-words text-sm font-medium text-slate-900">
                        {value}
                      </p>
                    </div>
                  ))}

                  <div className="rounded-lg border border-slate-200 p-4 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-slate-500">
                      Delivery address
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {selected.address}
                    </p>
                    {selected.address_reference && (
                      <p className="mt-2 text-xs text-slate-500">
                        Reference: {selected.address_reference}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Payment verification
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      Compare external payment
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                      Enter the payment information from the external checkout.
                      NewVelion compares it with the customer/order data.
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

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">
                      NewVelion order
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {money(Number(selected.amount), selected.currency)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">
                      External payment
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {selected.external_payment_amount == null
                        ? "Not registered"
                        : money(
                            Number(selected.external_payment_amount),
                            selected.external_payment_currency ||
                              selected.currency
                          )}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-500">
                      Payment reference
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-950">
                      {selected.external_payment_reference ||
                        "Not registered"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    ["External payment reference *", "reference", "text"],
                    ["External amount *", "amount", "number"],
                    ["External currency *", "currency", "text"],
                    ["Payment method", "method", "text"],
                    ["External customer name", "customerName", "text"],
                    ["External customer phone", "customerPhone", "text"],
                    ["External customer email", "customerEmail", "email"],
                  ].map(([label, key, type]) => (
                    <label
                      key={key}
                      className="text-xs font-semibold text-slate-600"
                    >
                      {label}
                      <input
                        type={type}
                        value={payment[key as keyof typeof payment]}
                        onChange={(e) =>
                          setPayment({
                            ...payment,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={
                          key === "customerName"
                            ? selected.full_name
                            : key === "customerPhone"
                              ? selected.phone
                              : key === "customerEmail"
                                ? selected.email || "Customer email"
                                : key === "currency"
                                  ? selected.currency
                                  : undefined
                        }
                        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                      />
                    </label>
                  ))}

                  <label className="text-xs font-semibold text-slate-600">
                    Payment date
                    <input
                      type="datetime-local"
                      value={payment.paidAt}
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          paidAt: e.target.value,
                        })
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                    />
                  </label>

                  <label className="sm:col-span-2 text-xs font-semibold text-slate-600">
                    Verification notes
                    <textarea
                      rows={3}
                      value={payment.notes}
                      onChange={(e) =>
                        setPayment({
                          ...payment,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Optional payment verification notes"
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
              </section>

              <section className="border-t border-slate-200 pt-6">
                <h3 className="text-sm font-semibold text-slate-950">
                  Attribution & order
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">Seller ID</p>
                    <p className="mt-1 break-all font-mono text-xs text-slate-700">
                      {selected.seller_id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Affiliate link</p>
                    <p className="mt-1 break-all font-mono text-xs text-slate-700">
                      {selected.affiliate_link}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Checkout URL</p>
                    <p className="mt-1 break-all text-xs text-slate-700">
                      {selected.checkout_url}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Session created</p>
                    <p className="mt-1 text-sm text-slate-900">
                      {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-200 p-6">
              <button
                type="button"
                disabled={
                  selected.payment_comparison_status !== "matched" ||
                  selected.status !== "paid_pending_review"
                }
                onClick={() => updateStatus(selected.id, "approved")}
                className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Approve sale
              </button>

              <button
                type="button"
                onClick={() => updateStatus(selected.id, "rejected")}
                className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
