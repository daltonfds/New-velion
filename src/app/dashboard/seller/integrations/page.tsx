"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";

const integrations = [
  {
    name: "Shopify",
    description:
      "Connect your Shopify store to Newvelion to sync products, orders, inventory, and fulfillment.",
    href: "/dashboard/seller/integrations/shopify",
    status: "Available",
  },
];

export default function SellerIntegrationsPage() {
  return (
    <AppShell area="seller" title="Integrations" subtitle="Connect Newvelion to the platforms you use to sell.">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#003B95]">
            Seller
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Integrations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Conecte o Newvelion às plataformas e ferramentas que você utiliza
            para administrar suas vendas.
          </p>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Available integrations
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {integrations.map((integration) => (
              <Link
                key={integration.name}
                href={integration.href}
                className="group rounded-[12px] border border-[#DDE5EF] bg-white p-6 transition hover:border-[#0078E8] hover:bg-[#EAF3FF]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-white">
                      <svg
                        viewBox="0 0 48 48"
                        className="h-11 w-11"
                        aria-label="Shopify"
                        role="img"
                      >
                        <path
                          fill="#95BF47"
                          d="M37.6 9.4c-.1-.6-.6-.9-1-.9-.4 0-4.8-.3-4.8-.3s-3-3-3.3-3.3c-.3-.3-.9-.2-1.1-.1-.1 0-.7.2-1.7.5-1-2.9-2.8-5.6-6-5.6-5.6h-.1c-.9 0-1.9.4-2.7 1.1-.7.7-1.3 1.7-1.7 2.8-.3.1-.6.2-.9.3-.8.2-1.7.5-2.6.8-2.6.8-5.3 1.6-5.4 1.6-.5.2-.5.2-.6.7-.1.4-4.8 36.9-4.8 36.9l27.6 4.8 13.5-3.3-10.1-38.1z"
                        />
                        <path
                          fill="#5E8E3E"
                          d="M36.6 8.5c-.4 0-4.8-.3-4.8-.3s-3-3-3.3-3.3c-.1-.1-.2-.2-.4-.2v40.1l13.5-3.3-10.1-38.1c.4 0 4.7.3 5.1.3z"
                        />
                        <path
                          fill="#fff"
                          d="M24.4 15.4l-1.8 5.4s-1.6-.9-3.6-.9c-2.9 0-3 1.8-3 2.3 0 2.5 6.5 3.4 6.5 9.1 0 4.5-2.8 7.3-6.7 7.3-4.7 0-7.1-2.9-7.1-2.9l1.3-4.3s2.5 2.1 4.6 2.1c1.4 0 2-.9 2-1.6 0-2.1-5.3-3-5.3-8.2 0-4.4 3.2-8.7 9.7-8.7 2.5 0 3.4.4 3.4.4z"
                        />
                      </svg>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-slate-900">
                      {integration.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {integration.description}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {integration.status}
                  </span>
                </div>

                <div className="mt-6 text-sm font-semibold text-[#006CE5] group-hover:text-[#003B95]">
                  Configure integration →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
