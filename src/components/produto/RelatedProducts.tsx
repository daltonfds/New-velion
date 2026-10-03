import Link from "next/link";

type Product = {
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

export default function RelatedProducts({
  products,
}: {
  products: Product[];
}) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h2 className="text-2xl font-black">
        You may also like
      </h2>

      <div className="mt-7 grid grid-cols-2 gap-5 md:grid-cols-4">
        {products.map((product) => {
          const price =
            product.preco_promocional ?? product.preco;

          return (
            <Link
              key={product.id}
              href={`/produto/${product.slug}`}
              className="group"
            >
              <div className="aspect-square overflow-hidden border border-slate-200 bg-slate-50">
                {product.fotos?.[0] && (
                  <img
                    src={product.fotos[0]}
                    alt={product.nome}
                    className="h-full w-full object-contain transition group-hover:scale-105"
                  />
                )}
              </div>

              <h3 className="mt-3 text-sm font-bold">
                {product.nome}
              </h3>

              <div className="mt-1 text-xs tracking-widest text-[#C99A2E]">
                {"★".repeat(
                  Math.round(product.avaliacao_media || 0),
                )}

                <span className="ml-1 tracking-normal text-slate-400">
                  ({product.total_avaliacoes || 0})
                </span>
              </div>

              <p className="mt-1 font-black">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: product.moeda,
                }).format(price)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
