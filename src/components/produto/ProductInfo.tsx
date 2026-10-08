"use client";

import { useState } from "react";

type Product = {
  id: string;
  nome: string;
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
    <section className="nv-product-detail border-b border-[#E0E0E0] bg-white">
      <div className="nv-container grid gap-8 py-6 lg:grid-cols-[1.5fr_1fr] lg:gap-10 lg:py-10">
        <div>
          <div className="nv-detail-image relative aspect-square overflow-hidden rounded-2xl border border-[#DCE8F7] bg-[#F7FAFF]">
            {images.length ? (
              <img
                src={images[photo]}
                alt={product.nome}
                className="h-full w-full object-contain p-6 sm:p-10"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No product image available
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.slice(0, 5).map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setPhoto(index)}
                  className={`aspect-square overflow-hidden border bg-white ${photo === index ? "border-[#003B95] ring-1 ring-[#003B95]" : "border-[#E5E7EB]"}`}
                  aria-label={`View product image ${index + 1}`}
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

        <div className="flex flex-col justify-center">
          <p className="inline-flex w-fit rounded-full bg-[#EAF3FF] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[.14em] text-[#003B95]">
            Newvelion product
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#001B44] sm:text-5xl">
            {product.nome}
          </h1>

          {product.descricao && (
            <p className="mt-3 text-base leading-7 text-slate-600">
              {product.descricao}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span
              className="tracking-[0.18em] text-[#0078E8]"
              aria-label={`${rating} out of 5 stars`}
            >
              {"★".repeat(rating)}
              {"☆".repeat(5 - rating)}
            </span>
            <span className="text-sm text-slate-500">
              {product.total_avaliacoes ?? 0} reviews
            </span>
          </div>

          <div className="nv-detail-price mt-6 flex items-end gap-3">
            {oldPrice !== null && (
              <span className="text-lg text-slate-400 line-through">
                {money(oldPrice, product.moeda)}
              </span>
            )}
            <span className="text-3xl font-black text-[#003B95] sm:text-4xl">
              {money(price, product.moeda)}
            </span>
          </div>

          {product.beneficios?.length > 0 && (
            <div className="mt-7 border-t border-[#E7EDF5] pt-6">
              <p className="mb-3 text-sm font-bold text-slate-950">
                Product benefits
              </p>
              <ul className="space-y-2.5">
                {product.beneficios.slice(0, 8).map((benefit, index) => (
                  <li
                    key={`${benefit}-${index}`}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0078E8] text-xs font-bold text-white">
                      ✓
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-7 border-t border-[#E7EDF5] pt-6">
            <p className="mb-3 text-sm font-bold text-slate-950">
              Quantity
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-300">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="h-12 w-12 text-lg text-slate-600"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-10 text-center text-sm font-bold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((value) => value + 1)}
                  className="h-12 w-12 text-lg text-slate-600"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <span className="text-sm text-slate-500">
                Total: {money(price * quantity, product.moeda)}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex gap-3">
              <button type="button" onClick={async () => {
                const { supabase } = await import("@/lib/supabase");
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { window.location.href = "/login"; return; }
                const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
                if (profile?.role !== "customer") { window.location.href = "/register/customer"; return; }
                const { error } = await supabase.from("customer_cart_items").upsert({ user_id: user.id, product_id: product.id, quantity }, { onConflict: "user_id,product_id" });
                if (error) { window.alert(error.message); return; }
                window.location.href = "/cart";
              }} className="flex min-h-14 flex-1 items-center justify-center rounded-xl border border-[#0078E8] bg-white px-5 text-sm font-black text-[#003B95] hover:bg-[#EAF3FF]">ADD TO CART</button>
              {checkoutUrl ? (
              <a
                href={checkoutUrl}
                className="flex min-h-14 w-full items-center justify-center rounded-xl bg-[#0078E8] px-6 text-base font-black text-white transition hover:bg-[#006CE5]"
              >
                BUY NOW
              </a>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 border-y border-[#E7EDF5] py-4 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <span>Secure checkout</span>
            <span>ZA delivery</span>
            <span>Support</span>
          </div>

          {product.garantia_texto && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                ✓
              </span>
              <span>{product.garantia_texto}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
