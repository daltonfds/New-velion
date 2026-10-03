"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  preco_promocional: number | null;
  moeda: string;
  fotos: string[];
  checkout_url: string | null;
  ativo: boolean;
};

const reviews = [
  {
    name: "Faith T.",
    text: "Could feel energetic, no early fatigue anymore and the pain in my knees has been better since using Moringa.",
    product: "moringa",
  },
  {
    name: "Zandile M.",
    text: "My husband has been using it for 4 weeks and he says it makes a huge difference for his anxiety.",
    product: "anti-stress",
  },
  {
    name: "Khlófelo S.",
    text: "Lion's mane has boosted my energy and focus. This is brilliant for people who work in stressful environments.",
    product: "lion",
  },
  {
    name: "Lee-Ann T.",
    text: "Sea Moss is a fantastic product to use, there is a noticeable difference in my skin tone, energy levels.",
    product: "sea moss",
  },
  {
    name: "Stain N.",
    text: "I will never use different pills again for my Concentration. It helped me in more ways than words can say.",
    product: "concentration",
  },
  {
    name: "Riaz J.",
    text: "Noticeably works from day 1. Improved blood flow can be felt and energy levels are raised.",
    product: "horny goat",
  },
  {
    name: "Elijah S.",
    text: "Been using these Tongkat Ali pills for a bit now and honestly I feel great. More energy during the day.",
    product: "tongkat ali",
  },
];

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export default function SalesPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const productId = params.id as string;
  const affiliateLink = searchParams.get("ref") || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [photo, setPhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const { data, error: queryError } = await supabase
        .from("products")
        .select(
          "id,nome,descricao,preco,preco_promocional,moeda,fotos,checkout_url,ativo",
        )
        .eq("id", productId)
        .eq("ativo", true)
        .maybeSingle();

      if (queryError) setError(queryError.message);

      setProduct(data as Product | null);
      setLoading(false);
    }

    if (productId) loadProduct();
  }, [productId]);

  const productReviews = useMemo(() => {
    if (!product) return reviews.slice(0, 3);

    const name = product.nome.toLowerCase();

    const matched = reviews.filter((review) =>
      name.includes(review.product),
    );

    return matched.length ? matched : reviews.slice(0, 3);
  }, [product]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Loading offer...</p>
      </main>
    );
  }

  if (!product || error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-950">
            Offer unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {error || "This product is no longer available."}
          </p>
        </div>
      </main>
    );
  }

  const price = product.preco_promocional ?? product.preco;
  const oldPrice = product.preco_promocional
    ? product.preco
    : null;

  const images = product.fotos?.filter(Boolean) || [];

  return (
    <main className="min-h-screen bg-white text-slate-950">

      {/* TOP BAR */}
      <div className="bg-[#16294F] px-4 py-2 text-center text-xs font-bold tracking-wide text-white">
        THE HERBALIST • PREMIUM HERBAL WELLNESS
      </div>

      {/* HEADER */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div>
            <div className="text-lg font-black tracking-tight text-[#16294F]">
              The Herbalist
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Natural wellness
            </div>
          </div>

          <a
            href="#offer"
            className="rounded-full bg-[#16294F] px-5 py-2.5 text-xs font-bold text-white"
          >
            SHOP NOW
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-[#f8fafc]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">

          <div className="order-2 lg:order-1">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              AVAILABLE NOW
            </div>

            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              {product.nome}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              {product.descricao ||
                "A carefully selected herbal wellness product designed to complement your daily routine."}
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full bg-white px-3 py-2">
                ✓ Carefully selected
              </span>
              <span className="rounded-full bg-white px-3 py-2">
                ✓ Convenient daily use
              </span>
              <span className="rounded-full bg-white px-3 py-2">
                ✓ Secure checkout
              </span>
            </div>

            <div className="mt-8 flex items-end gap-3">
              {oldPrice && (
                <span className="text-lg text-slate-400 line-through">
                  {money(oldPrice, product.moeda)}
                </span>
              )}

              <span className="text-4xl font-black">
                {money(price, product.moeda)}
              </span>
            </div>

            <a
              href="#offer"
              className="mt-6 inline-flex min-h-14 w-full max-w-md items-center justify-center rounded-xl bg-[#16294F] px-7 text-base font-black text-white hover:bg-[#0e1d38] sm:w-auto"
            >
              GET YOURS NOW
            </a>

            <p className="mt-3 text-xs text-slate-500">
              Secure checkout • Review product information before payment
            </p>
          </div>

          {/* PRODUCT GALLERY */}
          <div className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">

              <div className="aspect-square bg-slate-100">
                {images.length ? (
                  <img
                    src={images[photo]}
                    alt={product.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Product image
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2 p-3">
                  {images.slice(0, 5).map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setPhoto(index)}
                      className={
                        "aspect-square overflow-hidden rounded-lg border " +
                        (photo === index
                          ? "border-[#16294F] ring-2 ring-[#16294F]/10"
                          : "border-slate-200")
                      }
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-b border-slate-100">
        <div className="mx-auto grid max-w-5xl grid-cols-2 sm:grid-cols-4">

          <div className="border-r border-slate-100 px-4 py-7 text-center">
            <strong className="text-xl font-black text-[#16294F]">
              125,000+
            </strong>
            <p className="mt-1 text-xs text-slate-500">
              Customers
            </p>
          </div>

          <div className="px-4 py-7 text-center sm:border-r sm:border-slate-100">
            <strong className="text-xl font-black text-[#16294F]">
              5,000+
            </strong>
            <p className="mt-1 text-xs text-slate-500">
              5-star reviews
            </p>
          </div>

          <div className="border-r border-t border-slate-100 px-4 py-7 text-center sm:border-t-0">
            <strong className="text-xl font-black text-[#16294F]">
              60 days
            </strong>
            <p className="mt-1 text-xs text-slate-500">
              Money-back guarantee
            </p>
          </div>

          <div className="border-t border-slate-100 px-4 py-7 text-center sm:border-t-0">
            <strong className="text-xl font-black text-[#16294F]">
              WhatsApp
            </strong>
            <p className="mt-1 text-xs text-slate-500">
              Daily support
            </p>
          </div>

        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16294F]">
          Why choose it
        </p>

        <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
          A simple addition to your daily wellness routine.
        </h2>

        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
          The Herbalist focuses on accessible herbal products and everyday
          wellness. Review the product information carefully and speak with a
          qualified healthcare professional when appropriate.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">

          {[
            [
              "01",
              "Selected ingredients",
              "Clear information about the product you are purchasing.",
            ],
            [
              "02",
              "Simple routine",
              "Designed around convenient everyday use.",
            ],
            [
              "03",
              "Quality focus",
              "The Herbalist states that its supplements are sourced with quality and purity in mind.",
            ],
          ].map(([number, title, text]) => (
            <div
              key={number}
              className="border border-slate-200 p-6"
            >
              <div className="font-black text-[#C99A2E]">
                {number}
              </div>

              <h3 className="mt-6 text-lg font-black">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {text}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-[#f8fafc]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">

          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16294F]">
              Customer stories
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Loved by real customers
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Selected testimonials published by The Herbalist. Individual
              experiences and results may vary.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            {productReviews.map((review) => (
              <article
                key={review.name}
                className="border border-slate-200 bg-white p-6"
              >
                <div className="tracking-widest text-[#C99A2E]">
                  ★★★★★
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-700">
                  “{review.text}”
                </p>

                <div className="mt-5 text-xs font-black">
                  {review.name}
                </div>

                <div className="mt-1 text-[11px] font-semibold text-emerald-700">
                  Verified Buyer
                </div>
              </article>
            ))}

          </div>
        </div>
      </section>

      {/* OFFER */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">

        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16294F]">
              The offer
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Everything you need to make an informed purchase.
            </h2>

            <div className="mt-8 space-y-4">

              {[
                "The product shown on this page",
                "The quantity and format described in the product information",
                "Secure checkout",
                "Available customer support",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 border-b border-slate-100 pb-4 text-sm text-slate-700"
                >
                  <span className="font-bold text-emerald-600">
                    ✓
                  </span>

                  {item}
                </div>
              ))}

            </div>
          </div>

          <div
            id="offer"
            className="border border-slate-200 bg-white p-6 sm:p-8"
          >

            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Special offer
            </div>

            <h2 className="mt-3 text-2xl font-black">
              {product.nome}
            </h2>

            {oldPrice && (
              <div className="mt-6 text-sm text-slate-400 line-through">
                {money(oldPrice, product.moeda)}
              </div>
            )}

            <div className="mt-1 text-4xl font-black">
              {money(price, product.moeda)}
            </div>

            {affiliateLink ? (
              <form
                action="/api/checkout-intents"
                method="POST"
                className="mt-7 space-y-3"
              >
                <input
                  type="hidden"
                  name="affiliate_link"
                  value={affiliateLink}
                />

                <input
                  name="full_name"
                  required
                  placeholder="Full name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16294F]"
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16294F]"
                />

                <input
                  name="phone"
                  required
                  type="tel"
                  placeholder="Phone / WhatsApp"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16294F]"
                />

                <input
                  name="country"
                  required
                  placeholder="Country"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16294F]"
                />

                <input
                  name="province"
                  required
                  placeholder="Province / State"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16294F]"
                />

                <input
                  name="city"
                  required
                  placeholder="City"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16294F]"
                />

                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Delivery address"
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16294F]"
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#16294F] px-5 py-4 text-sm font-black text-white hover:bg-[#0e1d38]"
                >
                  CONTINUE TO SECURE CHECKOUT
                </button>
              </form>
            ) : product.checkout_url ? (
              <a
                href={product.checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#16294F] px-5 py-4 text-sm font-black text-white hover:bg-[#0e1d38]"
              >
                BUY NOW
              </a>
            ) : (
              <div className="mt-7 rounded-xl bg-slate-100 px-5 py-4 text-center text-sm font-semibold text-slate-500">
                Checkout unavailable
              </div>
            )}

            <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
              Product information is for general wellness purposes and is not
              medical advice.
            </p>

          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#16294F] px-4 py-16 text-center text-white">

        <h2 className="text-3xl font-black sm:text-4xl">
          Ready to start your routine?
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">
          Review the product information and continue to secure checkout.
        </p>

        <a
          href="#offer"
          className="mt-7 inline-flex rounded-xl bg-white px-8 py-4 text-sm font-black text-[#16294F]"
        >
          GET YOURS NOW
        </a>

      </section>

      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-xs leading-5 text-slate-400">
        Consult a qualified healthcare professional before using supplements,
        especially if you are pregnant, nursing, taking medication, or have a
        medical condition.
      </footer>

      {/* MOBILE CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold">
              {product.nome}
            </div>
            <div className="text-sm font-black">
              {money(price, product.moeda)}
            </div>
          </div>

          <a
            href="#offer"
            className="rounded-lg bg-[#16294F] px-5 py-3 text-xs font-black text-white"
          >
            BUY NOW
          </a>
        </div>
      </div>

    </main>
  );
}
