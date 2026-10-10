"use client";

import { useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco: number;
  preco_promocional: number | null;
  moeda: string;
  fotos: string[];
  beneficios: string[];
  checkout_url: string | null;
  garantia_texto: string | null;
  avaliacao_media?: number;
  total_avaliacoes?: number;
};

function money(value: number, currency: string) {
  if (currency === "ZAR") {
    return `R ${value.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProductInfo({
  product,
  affiliateLink,
  priceOverride,
}: {
  product: Product;
  affiliateLink: string;
  priceOverride?: number | null;
}) {
  const [photo, setPhoto] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = product.fotos?.filter(Boolean) || [];
  const price =
    typeof priceOverride === "number"
      ? priceOverride
      : product.preco_promocional ?? product.preco;
  const oldPrice =
    typeof priceOverride !== "number" && product.preco_promocional
      ? product.preco
      : null;

  const rating = Math.max(
    0,
    Math.min(5, Math.round(product.avaliacao_media ?? 0)),
  );

  const checkoutUrl = affiliateLink
    ? `/entrega?qty=${encodeURIComponent(String(quantity))}&ref=${encodeURIComponent(affiliateLink)}`
    : `/checkout?product=${encodeURIComponent(product.id)}&qty=${encodeURIComponent(String(quantity))}`;

  return (
    <section className="nv-product-detail bg-white">
      <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,.92fr)] lg:items-start lg:gap-14">
          <div className="min-w-0">
            <div className="nv-detail-image relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[#F7F7F7] sm:max-h-[680px]">
              {images.length ? (
                <img
                  src={images[photo]}
                  alt={product.nome}
                  className="h-full w-full object-contain p-5 sm:p-10 lg:p-14"
                />
              ) : (
                <div className="px-6 text-center text-sm text-[#6B7280]">
                  No product image available
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible">
                {images.slice(0, 5).map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    onClick={() => setPhoto(index)}
                    className={`h-[72px] w-[72px] shrink-0 overflow-hidden border bg-white sm:h-auto sm:w-auto sm:aspect-square ${
                      photo === index
                        ? "border-[#10069F] ring-1 ring-[#10069F]"
                        : "border-[#E5E7EB]"
                    }`}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0 lg:sticky lg:top-6">
            <div className="border-b border-[#E5E7EB] pb-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#6B7280]">
                  Newvelion
                </span>
                {rating > 0 && (
                  <span className="text-sm text-[#10069F]" aria-label={`${rating} out of 5 stars`}>
                    {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                  </span>
                )}
                {(product.total_avaliacoes ?? 0) > 0 && (
                  <span className="text-sm text-[#6B7280]">
                    {product.total_avaliacoes} reviews
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-[30px] font-bold leading-[1.1] tracking-[-.035em] text-[#1F2937] sm:text-[40px]">
                {product.nome}
              </h1>

              {product.descricao && (
                <p className="mt-4 text-[15px] leading-7 text-[#6B7280] sm:text-base">
                  {product.descricao}
                </p>
              )}
            </div>

            <div className="border-b border-[#E5E7EB] py-6">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-[30px] font-bold tracking-[-.03em] text-[#10069F] sm:text-[34px]">
                  {money(price, product.moeda)}
                </span>
                {oldPrice !== null && (
                  <span className="pb-1 text-base text-[#9CA3AF] line-through">
                    {money(oldPrice, product.moeda)}
                  </span>
                )}
              </div>
              {oldPrice !== null && (
                <p className="mt-2 text-xs font-semibold text-[#10B981]">
                  Special price
                </p>
              )}
            </div>

            {product.beneficios?.length > 0 && (
              <div className="border-b border-[#E5E7EB] py-6">
                <p className="mb-3 text-sm font-semibold text-[#1F2937]">
                  Product highlights
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {product.beneficios.slice(0, 6).map((benefit, index) => (
                    <li
                      key={`${benefit}-${index}`}
                      className="flex items-start gap-2 text-sm leading-6 text-[#4B5563]"
                    >
                      <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                        ✓
                      </span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="py-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-[#1F2937]">Quantity</span>
                <div className="flex h-12 items-center border border-[#D1D5DB]">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="h-full w-11 text-lg text-[#4B5563] hover:bg-[#F7F8FA]"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                    className="h-full w-11 text-lg text-[#4B5563] hover:bg-[#F7F8FA]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <a
                  href={checkoutUrl}
                  className="flex min-h-14 w-full items-center justify-center bg-[#003B95] px-6 text-sm font-bold uppercase tracking-[.04em] text-white transition hover:bg-[#002B6F]"
                >
                  Buy now
                </a>

                <button
                  type="button"
                  onClick={async () => {
                    const { supabase } = await import("@/lib/supabase");
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                      const next = window.location.pathname + window.location.search;
                      window.location.href = "/register/customer?next=" + encodeURIComponent(next);
                      return;
                    }
                    const { data: profile } = await supabase
                      .from("profiles")
                      .select("role")
                      .eq("id", user.id)
                      .maybeSingle();
                    if (profile?.role !== "customer") {
                      const next = window.location.pathname + window.location.search;
                      window.location.href = "/register/customer?next=" + encodeURIComponent(next);
                      return;
                    }
                    const { error } = await supabase
                      .from("customer_cart_items")
                      .upsert(
                        { user_id: user.id, product_id: product.id, quantity },
                        { onConflict: "user_id,product_id" },
                      );
                    if (error) {
                      window.alert(error.message);
                      return;
                    }
                    window.location.href = "/cart";
                  }}
                  className="flex min-h-14 w-full items-center justify-center border border-black bg-black px-6 text-sm font-bold uppercase tracking-[.04em] text-white transition hover:bg-[#222222]"
                >
                  Add to cart
                </button>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-center text-xs font-semibold text-[#6B7280]">Secure payments accepted</p>
                <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Accepted payment methods">
                  <div className="flex h-10 min-w-[66px] items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3" aria-label="Visa">
                    <svg viewBox="0 0 64 24" className="h-6 w-14" role="img" aria-label="Visa"><text x="2" y="19" fill="#1A1F71" fontSize="22" fontWeight="900" fontStyle="italic">VISA</text></svg>
                  </div>
                  <div className="flex h-10 min-w-[66px] items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3" aria-label="Mastercard">
                    <svg viewBox="0 0 52 32" className="h-7 w-12" role="img" aria-label="Mastercard"><circle cx="20" cy="16" r="12" fill="#EB001B"/><circle cx="32" cy="16" r="12" fill="#F79E1B"/><path d="M26 6.4a12 12 0 0 1 0 19.2 12 12 0 0 1 0-19.2" fill="#FF5F00"/></svg>
                  </div>
                  <div className="flex h-10 min-w-[78px] items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3" aria-label="Apple Pay">
                    <svg viewBox="0 0 86 26" className="h-6 w-[72px]" role="img" aria-label="Apple Pay"><text x="1" y="19" fill="#111827" fontSize="18" fontWeight="600"> Pay</text><path d="M13 5c2-2 2-4 2-4s-3 0-4 2-2 4-2 4 2 0 4-2zm3 6c-1-2-3-3-5-3-3 0-4 2-6 2-1 0-3-2-5-2v1c0 5 3 12 6 12 2 0 2-1 5-1 2 0 3 1 4 1 2 0 4-4 5-6-2 0-4-2-4-4z" transform="translate(1 2) scale(.8)" fill="#111827"/></svg>
                  </div>
                  <div className="flex h-10 min-w-[82px] items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3" aria-label="Google Pay">
                    <svg viewBox="0 0 94 26" className="h-6 w-[78px]" role="img" aria-label="Google Pay"><text x="1" y="19" fontSize="19" fontWeight="700" fill="#4285F4">G</text><text x="19" y="18" fontSize="14" fontWeight="600" fill="#3C4043">Pay</text><path d="M10 4a8 8 0 0 0 0 16" fill="none" stroke="#34A853" strokeWidth="2.5"/><path d="M3 8a8 8 0 0 1 12-3" fill="none" stroke="#EA4335" strokeWidth="2.5"/><path d="M3 16a8 8 0 0 0 12 3" fill="none" stroke="#FBBC04" strokeWidth="2.5"/></svg>
                  </div>
                </div>
              </div>

              <Link href={"/register/customer?next=" + encodeURIComponent("/produto/" + product.slug + (affiliateLink ? "?ref=" + encodeURIComponent(affiliateLink) : ""))} className="mt-4 block rounded-lg px-3 py-3 text-center text-sm font-semibold text-[#003B95] underline underline-offset-4 hover:bg-[#F7FAFF]">Create a buyer account to continue shopping</Link>

              <div className="mt-5 grid grid-cols-3 gap-2 border-y border-[#E5E7EB] py-4 text-center">
                <div className="flex flex-col items-center gap-2 px-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3FF] text-xl" aria-hidden="true">🚚</span>
                  <p className="text-[11px] font-semibold leading-4 text-[#1F2937]">Delivery across South Africa</p>
                </div>
                <div className="flex flex-col items-center gap-2 px-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3FF] text-xl" aria-hidden="true">↻</span>
                  <p className="text-[11px] font-semibold leading-4 text-[#1F2937]">60-day money-back guarantee</p>
                </div>
                <div className="flex flex-col items-center gap-2 px-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3FF] text-xl" aria-hidden="true">💬</span>
                  <p className="text-[11px] font-semibold leading-4 text-[#1F2937]">Customer support</p>
                </div>
              </div>

              {product.garantia_texto && (
                <div className="mt-4 text-center text-sm text-[#4B5563]">
                  <span className="font-semibold text-[#1F2937]">Guarantee:</span>{" "}
                  {product.garantia_texto}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
