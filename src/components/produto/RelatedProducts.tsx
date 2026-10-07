import Link from "next/link";

type RelatedProduct = {
  id: string;
  slug: string;
  nome: string;
  fotos: string[];
  preco: number;
  preco_promocional: number | null;
  moeda: string;
  avaliacao_media: number;
  total_avaliacoes: number;
};

function formatPrice(value: number, currency: string) {
  if (currency === "ZAR") {
    return `R${Math.round(value).toLocaleString("en-ZA")}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RelatedProducts({
  products,
}: {
  products: RelatedProduct[];
}) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="border-t border-[#E7EDF5] bg-[#F6F9FC]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E1F3D]">
              More products
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              You may also like
            </h2>
          </div>

          <Link
            href="/marketplace"
            className="text-sm font-bold text-[#0E1F3D] hover:underline"
          >
            View marketplace →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const image = product.fotos?.find(Boolean);
            const price =
              product.preco_promocional ?? product.preco;
            const hasDiscount =
              product.preco_promocional !== null &&
              product.preco_promocional < product.preco;

            const rating = Math.max(
              0,
              Math.min(5, Math.round(product.avaliacao_media || 0)),
            );

            return (
              <Link
                key={product.id}
                href={`/produto/${product.slug}`}
                className="group border border-[#DDE5EF] bg-white"
              >
                <div className="aspect-square overflow-hidden bg-white">
                  {image ? (
                    <img
                      src={image}
                      alt={product.nome}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs tracking-widest text-[#C99A2E]">
                      {"★".repeat(rating)}
                      {"☆".repeat(5 - rating)}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      ({product.total_avaliacoes || 0})
                    </span>
                  </div>

                  <h3 className="mt-3 line-clamp-2 min-h-10 text-sm font-bold text-slate-950">
                    {product.nome}
                  </h3>

                  <div className="mt-4 flex items-center gap-2">
                    {hasDiscount && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatPrice(product.preco, product.moeda)}
                      </span>
                    )}

                    <span className="font-bold text-slate-950">
                      {formatPrice(price, product.moeda)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
