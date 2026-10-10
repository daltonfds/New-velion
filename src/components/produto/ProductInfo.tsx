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
                  className="flex min-h-14 w-full items-center justify-center bg-[#10069F] px-6 text-sm font-bold uppercase tracking-[.04em] text-white hover:bg-[#0A0440]"
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
                  className="flex min-h-14 w-full items-center justify-center border border-[#10069F] bg-white px-6 text-sm font-bold uppercase tracking-[.04em] text-[#10069F] hover:bg-[#E8EDFF]"
                >
                  Add to cart
                </button>
              </div>

              <Link href={"/register/customer?next=" + encodeURIComponent("/produto/" + product.slug + (affiliateLink ? "?ref=" + encodeURIComponent(affiliateLink) : ""))} className="mt-4 block rounded-lg px-3 py-3 text-center text-sm font-semibold text-[#003B95] underline underline-offset-4 hover:bg-[#F7FAFF]">Create a buyer account to continue shopping</Link>

              <div className="mt-5 grid grid-cols-3 divide-x border-y border-[#E5E7EB] py-4 text-center">
                <div className="px-2">
                  <p className="text-xs font-semibold text-[#1F2937]">Secure checkout</p>
                </div>
                <div className="px-2">
                  <p className="text-xs font-semibold text-[#1F2937]">South Africa delivery</p>
                </div>
                <div className="px-2">
                  <p className="text-xs font-semibold text-[#1F2937]">Customer support</p>
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
