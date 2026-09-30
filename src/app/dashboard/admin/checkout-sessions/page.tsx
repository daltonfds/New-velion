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
};

export default function AdminCheckoutSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadSessions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("checkout_sessions")
      .select(
        "id,created_at,status,full_name,phone,whatsapp,email,country,province,city,postal_code,address,address_reference,amount,currency,seller_id,product_id,affiliate_link"
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
                          onClick={() => setSelected(session)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          View
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
                onClick={() =>
                  updateStatus(selected.id, "paid_pending_review")
                }
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800"
              >
                Mark payment received
              </button>

              <button
                type="button"
                onClick={() => updateStatus(selected.id, "approved")}
                className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Approve
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
