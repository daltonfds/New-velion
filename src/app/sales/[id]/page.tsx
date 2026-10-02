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

type Review = {
  name: string;
  product: string;
  text: string;
};

const reviews: Review[] = [
  {
    name: "Jacky L.",
    product: "Moringa",
    text: "Absolutely luv, no more joint pain, no fatigue, increased energy also maintaining weight control no more sweet snacking 🙌",
  },
  {
    name: "Faith T.",
    product: "Moringa",
    text: "Could feel energetic, no early fatigue anymore and the pain in my knees has been better since using Moringa tablets.",
  },
  {
    name: "Juanita V.",
    product: "Moringa",
    text: "I love this product. My belly bloat is much much better. The best it has been in years.",
  },
  {
    name: "Zandile M.",
    product: "Anti-Stress",
    text: "My husband has been using it for 4 weeks and he says it makes a huge difference for his anxiety.",
  },
  {
    name: "Khlófelo S.",
    product: "Lion's Mane",
    text: "Lion's mane has boosted my energy and focus. This is brilliant for people who work in stressful environments.",
  },
  {
    name: "Tina A.",
    product: "Lion's Mane",
    text: "My children and I have experienced incredible benefits from using this product! Improved concentration, better sleep, improved mood and many more.",
  },
  {
    name: "Lee-Ann T.",
    product: "Sea Moss",
    text: "Sea Moss is a fantastic product to use, there is a noticeable difference in my skin tone, energy levels. I absolutely love this product.",
  },
  {
    name: "Michelle E.",
    product: "Sea Moss",
    text: "I feel much better not that tired anymore and much better gut health. Sea Moss help me a lot.",
  },
  {
    name: "Celeste T.",
    product: "Sea Moss",
    text: "I've been using the Sea Moss for just two weeks, and I can already feel a noticeable difference. My skin is clearer with fewer breakouts and has a healthy glow.",
  },
  {
    name: "Stain N.",
    product: "Concentration",
    text: "I will never use different pills again for my Concentration!! Been using this for approximately 1 year now and it helped me in more ways than words can say.",
  },
  {
    name: "Getrude N.",
    product: "Concentration",
    text: "I definitely would recommend it to anyone who is struggling with Focus/concentration to try it!!",
  },
  {
    name: "Carla M.",
    product: "Concentration",
    text: "Worked from the get go. Cannot recommend this product enough!!",
  },
];

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function cleanName(value: string) {
  return value
    .replace(/60\/120 Capsules/gi, "")
    .replace(/60 Capsules/gi, "")
    .replace(/30\/60 Capsules/gi, "")
    .trim();
}

function productReviews(productName: string) {
  const name = productName.toLowerCase();

  const matches = reviews.filter((review) => {
    const source = review.product.toLowerCase();

    if (source === "moringa") return name.includes("moringa");
    if (source === "sea moss") return name.includes("sea moss");
    if (source === "lion's mane") return name.includes("lion");
    if (source === "concentration") return name.includes("concentration");
    if (source === "anti-stress") return name.includes("anti-stress");
    return false;
  });

  return matches.length ? matches : reviews.slice(0, 6);
}

export default function SalesPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const productId = String(params.id || "");
  const affiliateLink = searchParams.get("ref") || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
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

      if (queryError) {
        setError(queryError.message);
      }

      setProduct(data as Product | null);
      setLoading(false);
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const images = useMemo(
    () => product?.fotos?.filter(Boolean) || [],
    [product],
  );

  const reviewsForProduct = useMemo(
    () => (product ? productReviews(product.nome) : []),
    [product],
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#16294F]" />
          <p className="mt-4 text-sm text-slate-500">Loading your offer...</p>
        </div>
      </main>
    );
  }

  if (!product || error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black text-slate-950">
            Offer unavailable
          </h1>
          <p className="mt-3 text-sm text-slate-500">
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

  const discount =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  const productName = cleanName(product.nome);

  const genericBenefits = [
    "Easy to add to your daily routine",
    "Clear product information",
    "Secure checkout",
    "Customer support available",
  ];

  return (
    <main className="min-h-screen bg-white pb-20 text-[#111827]">

      {/* URGENCY BAR */}
      <div className="bg-[#16294F] px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-[0.12em] text-white">
        Limited offer • Secure checkout • 60-day guarantee
      </div>

      {/* SIMPLE BRAND HEADER */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div>
            <div className="text-lg font-black tracking-tight text-[#16294F]">
              The Herbalist
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Natural wellness
            </div>
          </div>

          <a
            href="#offer"
            className="rounded-lg bg-[#16294F] px-5 py-2.5 text-xs font-black text-white"
          >
            GET YOURS
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-slate-100 bg-[#f8fafc]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-7 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:py-12">

          {/* COPY */}
          <div className="order-2 lg:order-1">

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-black text-emerald-800">
                ✓ AVAILABLE NOW
              </span>

              <span className="text-sm font-bold tracking-wide text-[#C99A2E]">
                ★★★★★
              </span>

              <span className="text-xs font-semibold text-slate-500">
                Trusted by The Herbalist customers
              </span>
            </div>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#16294F]">
              The Herbalist
            </p>

            <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-6xl">
              {productName}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {product.descricao ||
                "A carefully selected herbal wellness product designed to complement your everyday routine."}
            </p>

            <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
              {genericBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 text-sm font-bold text-slate-800"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
                    ✓
                  </span>
                  {benefit}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-end gap-3">
              {oldPrice && (
                <span className="text-lg font-semibold text-slate-400 line-through">
                  {money(oldPrice, product.moeda)}
                </span>
              )}

              <span className="text-5xl font-black tracking-tight text-slate-950">
                {money(price, product.moeda)}
              </span>

              {discount && (
                <span className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-black text-red-700">
                  SAVE {discount}%
                </span>
              )}
            </div>

            <a
              href="#offer"
              className="mt-7 flex min-h-14 w-full max-w-xl items-center justify-center rounded-xl bg-[#16294F] px-8 text-base font-black text-white transition hover:bg-[#0e1d38] sm:w-auto"
            >
              YES — I WANT {productName.toUpperCase()} →
            </a>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-500">
              <span>🔒 Secure checkout</span>
              <span>✓ Customer support</span>
              <span>✓ 60-day guarantee</span>
            </div>
          </div>

          {/* PRODUCT */}
          <div className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="relative aspect-square bg-white">
                {images.length ? (
                  <img
                    src={images[selectedPhoto]}
                    alt={product.nome}
                    className="h-full w-full object-contain p-5"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Product image
                  </div>
                )}

                <div className="absolute left-4 top-4 rounded-full bg-[#16294F] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white">
                  Best seller
                </div>
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2 border-t border-slate-100 p-3">
                  {images.slice(0, 5).map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setSelectedPhoto(index)}
                      className={
                        "aspect-square overflow-hidden rounded-lg border bg-white " +
                        (selectedPhoto === index
                          ? "border-[#16294F] ring-2 ring-[#16294F]/10"
                          : "border-slate-200")
                      }
                    >
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-4">

          <div className="border-r border-slate-100 px-4 py-6 text-center">
            <div className="text-2xl font-black text-[#16294F]">
              125,000+
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-500">
              customers
            </div>
          </div>

          <div className="border-t border-slate-100 px-4 py-6 text-center sm:border-t-0 sm:border-r">
            <div className="text-2xl font-black text-[#16294F]">
              5,000+
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-500">
              5-star reviews
            </div>
          </div>

          <div className="border-r border-t border-slate-100 px-4 py-6 text-center sm:border-t-0">
            <div className="text-2xl font-black text-[#16294F]">
              60 days
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-500">
              money-back guarantee
            </div>
          </div>

          <div className="border-t border-slate-100 px-4 py-6 text-center sm:border-t-0">
            <div className="text-2xl font-black text-[#16294F]">
              WhatsApp
            </div>
            <div className="mt-1 text-[11px] font-semibold text-slate-500">
              daily support
            </div>
          </div>

        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">

        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#16294F]">
            Why people choose it
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Make your daily wellness routine simpler.
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Everything on this page is designed to answer the questions a
            customer has before buying: what it is, what it contains, how it
            fits into a routine, what customers say and how the purchase works.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">

          <div className="border border-slate-200 p-7">
            <div className="text-3xl font-black text-[#C99A2E]">01</div>
            <h3 className="mt-8 text-xl font-black">Clear product details</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Product format, images, description and available information are
              shown before checkout.
            </p>
          </div>

          <div className="border border-slate-200 p-7">
            <div className="text-3xl font-black text-[#C99A2E]">02</div>
            <h3 className="mt-8 text-xl font-black">Real customer stories</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Customer comments published by The Herbalist are displayed with
              the product they originally reviewed.
            </p>
          </div>

          <div className="border border-slate-200 p-7">
            <div className="text-3xl font-black text-[#C99A2E]">03</div>
            <h3 className="mt-8 text-xl font-black">Confidence to buy</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Guarantee, support and secure checkout information are visible
              before the customer commits.
            </p>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#f6f8fb]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">

          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#16294F]">
              Real customer feedback
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              See what customers are saying.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              These testimonials are published by The Herbalist. Individual
              experiences and results vary.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            {reviewsForProduct.slice(0, 6).map((review) => (
              <article
                key={`${review.name}-${review.product}`}
                className="relative overflow-hidden border border-slate-200 bg-white"
              >
                <div className="h-1 bg-[#C99A2E]" />

                <div className="p-7">
                  <div className="text-lg tracking-[0.2em] text-[#C99A2E]">
                    ★★★★★
                  </div>

                  <p className="mt-5 text-[15px] font-medium leading-7 text-slate-700">
                    “{review.text}”
                  </p>

                  <div className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#16294F] text-sm font-black text-white">
                      {review.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div>
                      <div className="text-sm font-black text-slate-900">
                        {review.name}
                      </div>

                      <div className="text-[11px] font-bold text-emerald-700">
                        Verified Buyer
                      </div>

                      <div className="text-[10px] font-semibold text-slate-400">
                        {review.product}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}

          </div>
        </div>
      </section>

      {/* PRODUCT EDUCATION */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">

        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#16294F]">
              What you get
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              Everything shown. Nothing hidden.
            </h2>

            <div className="mt-8 space-y-4">
              {[
                "The exact product shown in the gallery",
                "The quantity and format described on this page",
                "Product information supplied by the producer",
                "Access to the available customer support",
                "Secure checkout through the configured payment flow",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 border-b border-slate-100 pb-4"
                >
                  <span className="mt-0.5 text-lg font-black text-emerald-600">
                    ✓
                  </span>
                  <span className="text-sm font-semibold leading-6 text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden border border-slate-200 bg-white">
            {images[0] ? (
              <img
                src={images[0]}
                alt={product.nome}
                className="aspect-square w-full object-contain p-10"
              />
            ) : (
              <div className="aspect-square bg-slate-100" />
            )}
          </div>

        </div>
      </section>

      {/* GUARANTEE */}
      <section className="border-y border-slate-200 bg-[#16294F]">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center text-white sm:px-6">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/30 text-2xl">
            ✓
          </div>

          <h2 className="mt-5 text-3xl font-black sm:text-4xl">
            60-Day Money-Back Guarantee
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            The Herbalist advertises a 60-day money-back guarantee. Review the
            applicable terms before completing your purchase.
          </p>
        </div>
      </section>

      {/* OFFER */}
      <section id="offer" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">

        <div className="grid gap-10 lg:grid-cols-[1fr_430px] lg:items-start">

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#16294F]">
              Your offer
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Ready to try {productName}?
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Complete your details below and continue to secure checkout.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="border border-slate-200 p-5">
                <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Current price
                </div>
                <div className="mt-2 text-2xl font-black">
                  {money(price, product.moeda)}
                </div>
              </div>

              <div className="border border-slate-200 p-5">
                <div className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Customer care
                </div>
                <div className="mt-2 text-2xl font-black">
                  WhatsApp
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-[#16294F] bg-white p-5 sm:p-7">

            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#16294F]">
              Secure order
            </div>

            <h3 className="mt-2 text-2xl font-black">
              {productName}
            </h3>

            <div className="mt-4 flex items-end gap-3">
              {oldPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {money(oldPrice, product.moeda)}
                </span>
              )}

              <span className="text-4xl font-black">
                {money(price, product.moeda)}
              </span>
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
                  className="w-full rounded-lg border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#16294F]"
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#16294F]"
                />

                <input
                  name="phone"
                  required
                  type="tel"
                  placeholder="Phone / WhatsApp"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#16294F]"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="country"
                    required
                    placeholder="Country"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#16294F]"
                  />

                  <input
                    name="province"
                    required
                    placeholder="Province / State"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#16294F]"
                  />
                </div>

                <input
                  name="city"
                  required
                  placeholder="City"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#16294F]"
                />

                <input
                  name="postal_code"
                  placeholder="Postal code"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#16294F]"
                />

                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Delivery address"
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#16294F]"
                />

                <textarea
                  name="address_reference"
                  rows={2}
                  placeholder="Address reference / delivery instructions"
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3.5 text-sm outline-none focus:border-[#16294F]"
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#16294F] px-5 py-4 text-sm font-black text-white transition hover:bg-[#0e1d38]"
                >
                  CONTINUE TO SECURE CHECKOUT →
                </button>
              </form>
            ) : product.checkout_url ? (
              <a
                href={product.checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#16294F] px-5 py-4 text-sm font-black text-white"
              >
                BUY NOW →
              </a>
            ) : (
              <div className="mt-7 rounded-xl bg-slate-100 px-5 py-4 text-center text-sm font-bold text-slate-500">
                Checkout unavailable
              </div>
            )}

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-400">
              <div>🔒 Secure</div>
              <div>✓ Protected</div>
              <div>↩ Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-100 bg-[#f8fafc]">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">

          <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-[#16294F]">
            Questions
          </p>

          <h2 className="mt-3 text-center text-3xl font-black sm:text-4xl">
            Frequently asked questions
          </h2>

          <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200 bg-white">

            <details className="group p-5">
              <summary className="cursor-pointer list-none pr-8 text-sm font-black">
                How do I place my order?
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Complete the delivery information and continue to the configured
                secure checkout.
              </p>
            </details>

            <details className="group p-5">
              <summary className="cursor-pointer list-none pr-8 text-sm font-black">
                How is delivery handled?
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Delivery information is collected before payment so the order
                can be associated with the customer and product.
              </p>
            </details>

            <details className="group p-5">
              <summary className="cursor-pointer list-none pr-8 text-sm font-black">
                Is there a guarantee?
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                The Herbalist advertises a 60-day money-back guarantee. Check
                the applicable terms before purchase.
              </p>
            </details>

            <details className="group p-5">
              <summary className="cursor-pointer list-none pr-8 text-sm font-black">
                Can I get help after ordering?
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                The Herbalist advertises daily WhatsApp support.
              </p>
            </details>

          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#16294F] px-4 py-16 text-center text-white sm:px-6">

        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C99A2E]">
          Your next step
        </p>

        <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
          Start your routine today.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
          Review the product information, complete your details and continue to
          secure checkout.
        </p>

        <a
          href="#offer"
          className="mt-8 inline-flex rounded-xl bg-white px-9 py-4 text-sm font-black text-[#16294F]"
        >
          GET YOURS NOW →
        </a>
      </section>

      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-[11px] leading-5 text-slate-400">
        Product information is provided for general wellness purposes. It is
        not medical advice. Consult a qualified healthcare professional when
        appropriate.
      </footer>

      {/* MOBILE STICKY CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-bold text-slate-600">
              {productName}
            </div>
            <div className="text-lg font-black text-slate-950">
              {money(price, product.moeda)}
            </div>
          </div>

          <a
            href="#offer"
            className="rounded-xl bg-[#16294F] px-5 py-3.5 text-xs font-black text-white"
          >
            BUY NOW →
          </a>
        </div>
      </div>

    </main>
  );
}
