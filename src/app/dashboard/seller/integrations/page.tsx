"use client";

import Link from "next/link";

const integrations = [
  {
    name: "Shopify",
    description:
      "Conecte sua loja Shopify ao NewVelion para sincronizar produtos, pedidos, estoque e fulfillment.",
    href: "/dashboard/seller/integrations/shopify",
    status: "Disponível",
  },
];

export default function SellerIntegrationsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Seller
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Integrações
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Conecte o NewVelion às plataformas e ferramentas que você utiliza
            para administrar suas vendas.
          </p>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Plataformas disponíveis
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {integrations.map((integration) => (
              <Link
                key={integration.name}
                href={integration.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700">
                      S
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

                <div className="mt-6 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  Configurar integração →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
