"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";

type ExternalPlatform = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "suspended" | "revoked";
};

const staticIntegrations = [
  {
    key: "shopify",
    name: "Shopify",
    description: "Connect your Shopify store to sync products, orders, inventory and fulfillment.",
    href: "/dashboard/seller/integrations/shopify",
    label: "Store connection",
    kind: "shopify" as const,
  },
  {
    key: "newvelion-api",
    name: "Newvelion Integration API",
    description: "Connect external marketplaces, ecommerce sites and sales systems to Newvelion's shared product, stock, order and fulfillment infrastructure.",
    href: "/docs/integrations",
    label: "API v1 documentation",
    kind: "api" as const,
  },
];

export default function SellerIntegrationsPage() {
  const [platforms, setPlatforms] = useState<ExternalPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadPlatforms() {
      setLoading(true);
      setError("");
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("Sign in again to view available integrations.");
        const response = await fetch("/api/seller/integrations/platforms", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "Could not load external platforms.");
        if (active) setPlatforms(Array.isArray(json.data) ? json.data : []);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Could not load integrations.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadPlatforms();
    return () => { active = false; };
  }, []);

  const cards = [
    ...staticIntegrations,
    ...platforms.map((platform) => ({
      key: platform.id,
      name: platform.name,
      description: platform.description || `This platform is enabled by Newvelion administrators. Use the Integration API v1 documentation to connect its products, orders and fulfillment workflows.`,
      href: "/docs/integrations",
      label: "Connect via API",
      kind: "external" as const,
    })),
  ];

  return (
    <AppShell area="seller" title="Integrations" subtitle="Connect Newvelion to the platforms you use to sell.">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#003B95]">Seller</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Integrations</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Connect your store directly or use the Newvelion Integration API to bring product, inventory, order and tracking data from external platforms into one commerce workflow.
          </p>
        </div>

        {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Available integrations</h2>
            <button onClick={() => window.location.reload()} className="rounded-lg border border-[#DDE5EF] px-3 py-2 text-xs font-semibold text-[#003B95] hover:bg-[#EAF3FF]">Refresh</button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-[#DDE5EF] bg-white p-8 text-sm text-slate-500">Loading active integrations…</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map((integration) => (
                <Link key={integration.key} href={integration.href}
                  className="group rounded-xl border border-[#DDE5EF] bg-white p-6 transition hover:border-[#0078E8] hover:bg-[#EAF3FF]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#003B95]">
                      {integration.kind === "shopify" ? (
                        <svg viewBox="0 0 48 48" className="h-9 w-9" role="img" aria-label="Shopify">
                          <path fill="#95BF47" d="M37.6 9.4c-.1-.6-.6-.9-1-.9-.4 0-4.8-.3-4.8-.3s-3-3-3.3-3.3c-.3-.3-.9-.2-1.1-.1-.1 0-.7.2-1.7.5-1-2.9-2.8-5.6-6-5.6-5.6 0-9.4 4.3-10.8 10.7l-4.8 1.5L2.8 44.1l27.6 4.8 13.5-3.3L37.6 9.4Z"/>
                          <path fill="#5E8E3E" d="M31.8 8.2s-3-3-3.3-3.3c-.1-.1-.2-.2-.4-.2v40.1l13.5-3.3-10.1-38.1.3.8Z"/>
                        </svg>
                      ) : integration.kind === "api" ? (
                        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></svg>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {integration.kind === "external" ? "Admin enabled" : "Available"}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{integration.name}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{integration.description}</p>
                  <div className="mt-6 text-sm font-semibold text-[#006CE5] group-hover:text-[#003B95]">{integration.label} →</div>
                </Link>
              ))}
            </div>
          )}
          {!loading && !error && platforms.length === 0 && (
            <p className="mt-4 text-xs text-slate-500">No additional external platforms have been enabled by an administrator yet. The Newvelion API remains available for approved integrations.</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
