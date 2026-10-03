export default function WhyChooseSection({
  product,
}: {
  product: {
    nome: string;
    ingredientes: string | null;
    descricao: string | null;
  };
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16294F]">
        Product information
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-tight">
        Why choose {product.nome}?
      </h2>

      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
        <p>
          {product.descricao ||
            "Product information provided by the supplier."}
        </p>

        {product.ingredientes && (
          <p>
            <strong className="text-slate-900">
              Ingredients / composition:
            </strong>{" "}
            {product.ingredientes}
          </p>
        )}
      </div>
    </section>
  );
}
