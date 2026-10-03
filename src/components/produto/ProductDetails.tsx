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
    <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-slate-200 p-6">
          <h3 className="font-black">Suggested use</h3>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {product.modo_uso ||
              "Follow the instructions supplied with the product."}
          </p>
        </div>

        <div className="border border-slate-200 p-6">
          <h3 className="font-black">Product details</h3>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {product.ingredientes ||
              "See the product packaging for the complete composition."}
          </p>

          {product.garantia_texto && (
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {product.garantia_texto}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
