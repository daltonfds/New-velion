"use client";

import { useState } from "react";

type Product = {
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
    return `R${Math.round(value).toLocaleString("en-ZA")}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductInfo({
  product,
  affiliateLink,
}: {
  product: Product;
  affiliateLink: string;
}) {
  const [photo, setPhoto] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [bundle, setBundle] = useState(1);

  const images = product.fotos?.filter(Boolean) || [];
  const price = product.preco_promocional ?? product.preco;
  const oldPrice = product.preco_promocional ? product.preco : null;

  const rating = Math.max(
    0,
    Math.min(5, Math.round(product.avaliacao_media ?? 0)),
  );

  const bundleOptions = [
    {
      quantity: 1,
      label: "1 Bottle",
      saving: 0,
    },
    {
      quantity: 3,
      label: "3 Bottles",
      saving: Math.round(price * 3 * 0.05),
    },
    {
      quantity: 6,
      label: "6 Bottles",
      saving: Math.round(price * 6 * 0.10),
    },
  ];

  const selectedBundle =
    bundleOptions.find((option) => option.quantity === bundle) ??
    bundleOptions[0];

  const checkoutQuantity = bundle * quantity;

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-12">
      {/* Product gallery */}
      <div>
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-white">
          {images.length ? (
            <img
              src={images[photo]}
              alt={product.nome}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="text-sm text-slate-400">
              No product image available
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-4 grid grid-cols-5 gap-2">
            {images.slice(0, 5).map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setPhoto(index)}
                className={`aspect-square overflow-hidden rounded-md border bg-white ${
                  photo === index
                    ? "border-[#16294F] ring-2 ring-[#16294F]/10"
                    : "border-slate-200"
                }`}
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

      {/* Product purchase information */}
      <div className="flex flex-col">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16294F]">
          Newvelion Marketplace
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {product.nome}
        </h1>

        {product.descricao && (
          <p className="mt-4 text-base leading-7 text-slate-600">
            {product.descricao}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span className="tracking-widest text-[#C99A2E]">
            {"★".repeat(rating)}
            {"☆".repeat(5 - rating)}
          </span>

          <span className="text-sm text-slate-500">
            ({product.total_avaliacoes ?? 0} reviews)
          </span>
        </div>

        <div className="mt-6 flex items-end gap-3">
          {oldPrice && (
            <span className="text-lg text-slate-400 line-through">
              {money(oldPrice, product.moeda)}
            </span>
          )}

          <span className="text-4xl font-bold text-slate-950">
            {money(price, product.moeda)}
          </span>
        </div>

        {/* Benefits */}
        {product.beneficios?.length > 0 && (
          <div className="mt-7 border-t border-slate-100 pt-6">
            <p className="mb-3 font-bold text-slate-900">
              Product benefits
            </p>

            <ul className="space-y-2">
              {product.beneficios.slice(0, 8).map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <span className="mt-0.5 font-bold text-emerald-600">
                    ✓
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Variations */}
        <div className="mt-7">
          <p className="mb-3 text-sm font-bold text-slate-900">
            Select your option
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border-2 border-[#16294F] bg-[#16294F] px-5 py-2 text-sm font-semibold text-white"
            >
              Standard
            </button>
          </div>
        </div>

        {/* Buy more and save */}
        <div className="mt-7 border-t border-slate-100 pt-6">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
            Buy More & Save
          </p>

          <div className="grid grid-cols-3 gap-2">
            {bundleOptions.map((option) => {
              const selected = bundle === option.quantity;

              return (
                <button
                  key={option.quantity}
                  type="button"
                  onClick={() => setBundle(option.quantity)}
                  className={`relative rounded-lg border-2 p-3 text-center transition ${
                    selected
                      ? "border-[#16294F] bg-white"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {option.saving > 0 && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#16294F] px-2 py-0.5 text-[9px] font-bold text-white">
                      SAVE {money(option.saving, product.moeda)}
                    </span>
                  )}

                  <span
                    className={`mx-auto mb-2 block h-4 w-4 rounded-full border-2 ${
                      selected
                        ? "border-[#16294F] bg-[#16294F]"
                        : "border-slate-300"
                    }`}
                  />

                  <span className="block text-xs font-bold text-slate-900">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
          <span className="text-[#16294F]">✓</span>
          <span>Secure checkout and reliable product fulfillment</span>
        </div>

        {/* Quantity + checkout */}
        <div className="mt-5 flex gap-2">
          <div className="flex items-center rounded-lg border border-slate-300">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="px-4 py-3 text-lg text-slate-500"
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span className="min-w-8 text-center text-sm font-bold">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => setQuantity((value) => value + 1)}
              className="px-4 py-3 text-lg text-slate-500"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {affiliateLink ? (
            <a
              href={`/entrega?qty=${encodeURIComponent(String(checkoutQuantity))}&checkout_url=${encodeURIComponent(product.checkout_url || "")}&ref=${encodeURIComponent(affiliateLink)}`}
              className="flex flex-1 items-center justify-center rounded-lg bg-[#16294F] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#0e1d38]"
            >
              BUY NOW
            </a>
          ) : product.checkout_url ? (
            <a
              href={`/entrega?qty=${encodeURIComponent(String(checkoutQuantity))}&checkout_url=${encodeURIComponent(product.checkout_url)}`}
              className="flex flex-1 items-center justify-center rounded-lg bg-[#16294F] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#0e1d38]"
            >
              BUY NOW
            </a>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-400">
              Checkout unavailable
            </div>
          )}
        </div>

        {/* Payment information */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-400">
          <span>VISA</span>
          <span>MASTERCARD</span>
          <span>APPLE PAY</span>
          <span>GOOGLE PAY</span>
        </div>

        {product.garantia_texto && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
            <span className="text-lg text-emerald-600">✓</span>
            <span>{product.garantia_texto}</span>
          </div>
        )}

        <p className="mt-3 text-center text-xs text-slate-400">
          Secure checkout • Your payment is processed through the configured
          checkout provider.
        </p>

        {selectedBundle.quantity > 1 && (
          <p className="mt-2 text-center text-xs font-semibold text-[#16294F]">
            {checkoutQuantity} bottles selected
          </p>
        )}
      </div>
    </section>
  );
}
