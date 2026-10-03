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
};

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
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

  const images = product.fotos?.filter(Boolean) || [];
  const price = product.preco_promocional ?? product.preco;
  const oldPrice = product.preco_promocional ? product.preco : null;

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:items-start lg:py-12">
      <div>
        <div className="aspect-square overflow-hidden border border-slate-200 bg-slate-50">
          {images.length ? (
            <img
              src={images[photo]}
              alt={product.nome}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No product image
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {images.slice(0, 5).map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setPhoto(index)}
                className={`aspect-square overflow-hidden border ${
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

      <div id="offer" className="flex flex-col">
        <span className="w-fit border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          AVAILABLE NOW
        </span>

        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
          {product.nome}
        </h1>

        <p className="mt-4 whitespace-pre-line text-base leading-7 text-slate-600">
          {product.descricao || "Product information provided by the supplier."}
        </p>

        <div className="mt-6 flex items-end gap-3">
          {oldPrice && (
            <span className="text-lg text-slate-400 line-through">
              {money(oldPrice, product.moeda)}
            </span>
          )}

          <span className="text-4xl font-black">
            {money(price, product.moeda)}
          </span>
        </div>

        {product.beneficios?.length > 0 && (
          <div className="mt-7 border-t border-slate-100 pt-6">
            <p className="text-sm font-bold">Product highlights</p>

            <ul className="mt-3 space-y-2">
              {product.beneficios.slice(0, 8).map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm text-slate-700"
                >
                  <span className="font-bold text-emerald-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-7 flex gap-3">
          <div className="flex items-center border border-slate-300">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-3"
            >
              −
            </button>

            <span className="min-w-8 text-center text-sm font-bold">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-4 py-3"
            >
              +
            </button>
          </div>

          {affiliateLink ? (
            <form
              action="/api/checkout-intents"
              method="POST"
              className="flex-1"
            >
              <input
                type="hidden"
                name="affiliate_link"
                value={affiliateLink}
              />

              <input
                type="hidden"
                name="quantity"
                value={quantity}
              />

              <button
                type="submit"
                className="w-full bg-[#16294F] px-5 py-4 text-sm font-black text-white hover:bg-[#0e1d38]"
              >
                BUY NOW
              </button>
            </form>
          ) : product.checkout_url ? (
            <a
              href={product.checkout_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center bg-[#16294F] px-5 py-4 text-sm font-black text-white"
            >
              BUY NOW
            </a>
          ) : (
            <div className="flex flex-1 items-center justify-center border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-400">
              Checkout unavailable
            </div>
          )}
        </div>

        {product.garantia_texto && (
          <p className="mt-4 text-sm font-semibold text-slate-700">
            ✓ {product.garantia_texto}
          </p>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Secure checkout • Review product information before payment.
        </p>
      </div>
    </section>
  );
}
