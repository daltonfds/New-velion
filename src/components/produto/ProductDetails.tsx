export default function ProductDetails({
  product,
}: {
  product: {
    modo_uso: string | null;
    ingredientes: string | null;
    garantia_texto: string | null;
  };
}) {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border border-slate-200 bg-white p-7 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16294F]">
              Suggested usage
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              How to use
            </h2>

            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
              {product.modo_uso ||
                "Follow the usage instructions provided with the product."}
            </p>
          </div>

          <div className="border border-slate-200 bg-white p-7 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16294F]">
              Product details
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              Product information
            </h2>

            <div className="mt-5 space-y-5 text-sm leading-7 text-slate-600">
              <div>
                <h3 className="font-bold text-slate-950">
                  Ingredients / composition
                </h3>
                <p className="mt-1 whitespace-pre-line">
                  {product.ingredientes ||
                    "Complete composition information is provided on the product packaging."}
                </p>
              </div>

              {product.garantia_texto && (
                <div>
                  <h3 className="font-bold text-slate-950">
                    Guarantee
                  </h3>
                  <p className="mt-1">{product.garantia_texto}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
