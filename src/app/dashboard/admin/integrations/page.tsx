"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";

type Platform = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  api_key: string;
  webhook_url: string | null;
  sellers: number;
  products: number;
  orders: number;
  last_activity: string | null;
};

type Credentials = {
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
};

type IntegrationOrder = {
  id: string;
  platform_id: string;
  external_order_id: string;
  status: string;
  currency: string;
  total: number;
  tracking_number: string | null;
  carrier: string | null;
  platform: { name: string; slug: string } | null;
  created_at: string;
};

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "in_transit",
  "delivered",
  "cancelled",
  "failed",
  "returned",
];

export default function AdminIntegrationsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [orders, setOrders] = useState<IntegrationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    webhook_url: "",
  });

  async function authHeaders() {
    const { data } = await supabase.auth.getSession();
    return {
      "content-type": "application/json",
      ...(data.session?.access_token
        ? { authorization: `Bearer ${data.session.access_token}` }
        : {}),
    };
  }

  async function load() {
    setLoading(true);
    setError("");

    try {
      const headers = await authHeaders();
      const [platformResponse, orderResponse] = await Promise.all([
        fetch("/api/admin/integrations/platforms", { headers, cache: "no-store" }),
        fetch("/api/admin/integrations/orders", { headers, cache: "no-store" }),
      ]);

      const platformJson = await platformResponse.json();
      const orderJson = await orderResponse.json();

      if (!platformResponse.ok) throw new Error(platformJson.error || "Could not load platforms.");
      if (!orderResponse.ok) throw new Error(orderJson.error || "Could not load orders.");

      setPlatforms(platformJson.data ?? []);
      setOrders(orderJson.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load integrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createPlatform() {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const headers = await authHeaders();
      const response = await fetch("/api/admin/integrations/platforms", {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });
      const json = await response.json();

      if (!response.ok) throw new Error(json.error || "Could not create platform.");

      setCredentials(json.credentials);
      setNotice("Platform created. Store the credentials shown below.");
      setForm({ name: "", slug: "", description: "", webhook_url: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create platform.");
    } finally {
      setSaving(false);
    }
  }

  async function platformAction(id: string, action: string) {
    setError("");
    setNotice("");

    try {
      const headers = await authHeaders();
      const response = await fetch(`/api/admin/integrations/platforms/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ action }),
      });
      const json = await response.json();

      if (!response.ok) throw new Error(json.error || "Action failed.");

      if (json.credentials) {
        setCredentials(json.credentials);
        setNotice("New credentials generated. Store them now.");
      } else {
        setNotice("Platform updated.");
      }

      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    }
  }

  async function updateOrder(id: string, status: string) {
    try {
      const headers = await authHeaders();
      const response = await fetch(`/api/admin/integrations/orders/${id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not update order.");
      setNotice("Order status updated and webhook queued.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update order.");
    }
  }

  return (
    <AppShell area="admin">
      <div className="space-y-7">
        <div>
          <p className="text-sm font-medium text-blue-600">Infrastructure</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Platform Integrations</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Connect external marketplaces and seller platforms to NewVelion products, stock and fulfillment.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Connect a platform</h2>
            <p className="mt-1 text-sm text-slate-500">
              Credentials are generated once and secrets are never displayed again.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ["name", "Platform name", "Example Marketplace"],
              ["slug", "Slug", "example-marketplace"],
              ["webhook_url", "Webhook URL", "https://example.com/webhooks/newvelion"],
            ].map(([key, label, placeholder]) => (
              <label key={key} className="text-sm font-medium text-slate-700">
                {label}
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
                />
              </label>
            ))}

            <label className="text-sm font-medium text-slate-700 md:col-span-2">
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What this platform uses NewVelion for"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <button
            type="button"
            disabled={saving || !form.name}
            onClick={createPlatform}
            className="mt-5 rounded-lg bg-[#16294F] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create platform"}
          </button>
        </section>

        {credentials && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div>
              <h2 className="text-lg font-semibold text-amber-950">Save these credentials now</h2>
              <p className="mt-1 text-sm text-amber-800">
                NewVelion stores only hashes/encrypted secrets. These values will not be shown again.
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {Object.entries(credentials).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-amber-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{key}</p>
                  <code className="mt-1 block break-all text-sm text-slate-900">{value}</code>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCredentials(null)}
              className="mt-4 rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900"
            >
              Hide credentials
            </button>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-900">Connected platforms</h2>
            <p className="mt-1 text-sm text-slate-500">{platforms.length} platform(s)</p>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-slate-500">Loading integrations...</div>
          ) : platforms.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">No external platforms connected yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {platforms.map((platform) => (
                <div key={platform.id} className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900">{platform.name}</h3>
                        <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {platform.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{platform.slug}</p>
                      <p className="mt-3 text-xs text-slate-500">API key: {platform.api_key}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        ["Sellers", platform.sellers],
                        ["Products", platform.products],
                        ["Orders", platform.orders],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-slate-200 px-4 py-3">
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="mt-1 font-semibold text-slate-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {platform.status !== "active" && (
                      <button
                        type="button"
                        onClick={() => platformAction(platform.id, "activate")}
                        className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700"
                      >
                        Activate
                      </button>
                    )}
                    {platform.status === "active" && (
                      <button
                        type="button"
                        onClick={() => platformAction(platform.id, "suspend")}
                        className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700"
                      >
                        Suspend
                      </button>
                    )}
                    {platform.status !== "revoked" && (
                      <button
                        type="button"
                        onClick={() => platformAction(platform.id, "revoke")}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
                      >
                        Revoke
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => platformAction(platform.id, "rotate")}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      Rotate credentials
                    </button>
                    <button
                      type="button"
                      onClick={() => platformAction(platform.id, "regenerate_webhook_secret")}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      Regenerate webhook secret
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-semibold text-slate-900">External orders</h2>
            <p className="mt-1 text-sm text-slate-500">
              Orders received through the Integration API and their fulfillment status.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">No integration orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Platform</th>
                    <th className="px-5 py-4 font-semibold">External order</th>
                    <th className="px-5 py-4 font-semibold">Total</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Tracking</th>
                    <th className="px-5 py-4 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-5 py-4 font-medium">{order.platform?.name || "Platform"}</td>
                      <td className="px-5 py-4 font-mono text-xs">{order.external_order_id}</td>
                      <td className="px-5 py-4 font-semibold">{order.total.toLocaleString()} {order.currency}</td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => void updateOrder(order.id, e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {order.tracking_number || "—"}
                        {order.carrier ? ` · ${order.carrier}` : ""}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
