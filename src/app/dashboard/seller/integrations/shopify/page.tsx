"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const SHOPIFY_API =
  "https://ndtitpmkfbouvaiforfx.supabase.co/functions/v1/shopify";

type ShopifyStore = {
  id: string;
  shop_domain: string;
  shop_name?: string | null;
  status?: string | null;
};

export default function ShopifyIntegrationPage() {
  const [shop, setShop] = useState("");
  const [stores, setStores] = useState<ShopifyStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  async function loadStores() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Sessão não encontrada.");
      }

      const response = await fetch(`${SHOPIFY_API}/api/stores`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível carregar as lojas.");
      }

      setStores(Array.isArray(data?.stores) ? data.stores : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar integração.");
    } finally {
      setLoading(false);
    }
  }

  async function connectShopify() {
    setConnecting(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Sessão não encontrada.");
      }

      const normalizedShop = shop
        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "");

      if (!normalizedShop) {
        throw new Error("Digite o domínio da sua loja Shopify.");
      }

      const response = await fetch(`${SHOPIFY_API}/api/connect`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shop: normalizedShop,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível iniciar a conexão.");
      }

      if (!data?.authUrl) {
        throw new Error("URL de autorização Shopify não recebida.");
      }

      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao conectar Shopify.");
      setConnecting(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Seller · Integrações
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Shopify
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Conecte sua loja Shopify ao NewVelion para sincronizar produtos,
            pedidos, estoque e operações de fulfillment.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Conectar uma loja
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Informe o domínio da loja Shopify que deseja conectar.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={shop}
                onChange={(event) => setShop(event.target.value)}
                placeholder="minha-loja.myshopify.com"
                disabled={connecting}
                className="h-11 flex-1 rounded-xl border border-slate-300 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={connectShopify}
                disabled={connecting}
                className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {connecting ? "Conectando..." : "Conectar Shopify"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Lojas conectadas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Suas integrações Shopify ativas aparecerão aqui.
            </p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Carregando integrações...
            </div>
          ) : stores.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">
                Nenhuma loja Shopify conectada
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Conecte sua primeira loja acima.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {store.shop_name || store.shop_domain}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {store.shop_domain}
                    </p>
                  </div>

                  <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {store.status || "connected"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
