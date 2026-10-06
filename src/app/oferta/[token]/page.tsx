"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Offer = {
  offer_id: string;
  offer_token: string;
  pricing_mode: "fixed" | "custom";
  sale_price: number;
  base_price_zar: number;
  seller_margin_zar: number;
  currency: "ZAR";
  product: {
    id: string;
    nome: string;
    slug: string;
    descricao: string;
    fotos: string[];
    moeda: string;
    pricing_mode: string;
  };
};

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function ExternalOfferPage() {
  const params = useParams<{ token: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.token) return;

    fetch(`/api/public/external-offers/${encodeURIComponent(params.token)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message || "Offer unavailable.");
        return payload.data as Offer;
      })
      .then(setOffer)
      .catch((err) => setError(err instanceof Error ? err.message : "Offer unavailable."))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return <main className="min-h-screen bg-slate-50 px-4 py-16 text-center text-slate-500">Loading offer...</main>;
  }

  if (error || !offer) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Offer unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">{error || "This offer is no longer active."}</p>
        </div>
      </main>
    );
  }

  const image = offer.product.fotos?.[0];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2">
        <div className="min-h-[320px] bg-slate-100">
          {image ? (
            <img src={image} alt={offer.product.nome} className="h-full min-h-[320px] w-full object-cover" />
          ) : null}
        </div>

        <div className="p-7 sm:p-10">
          <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            {offer.pricing_mode === "custom" ? "Custom Pricing" : "Fixed Offer"}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{offer.product.nome}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">{offer.product.descricao}</p>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs text-slate-500">Selling price</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{money(offer.sale_price)}</p>
            {offer.pricing_mode === "custom" && (
              <p className="mt-2 text-xs text-slate-500">Offer base: {money(offer.base_price_zar)}</p>
            )}
          </div>

          <Link
            href={`/produto/${encodeURIComponent(offer.product.slug)}?offer=${encodeURIComponent(offer.offer_token)}`}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Continue to product
          </Link>
        </div>
      </div>
    </main>
  );
}
