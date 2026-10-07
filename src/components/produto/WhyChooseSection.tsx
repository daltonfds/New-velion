export default function WhyChooseSection({
  product,
}: {
  product: {
    nome: string;
    descricao: string | null;
    ingredientes: string | null;
    beneficios: string[];
  };
}) {
  const benefits = product.beneficios?.filter(Boolean) || [];

  return (
    <section className="border-y border-[#E7EDF5] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0E1F3D]">
            Why choose this product?
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Why {product.nome}?
          </h2>

          {product.descricao && (
            <p className="mt-5 text-base leading-8 text-slate-600">
              {product.descricao}
            </p>
          )}
        </div>

        {benefits.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.slice(0, 8).map((benefit, index) => (
              <div
                key={`${benefit}-${index}`}
                className="border border-[#DDE5EF] bg-white p-6"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0E1F3D] text-sm font-bold text-white">
                  ✓
                </div>

                <h3 className="mt-5 text-sm font-bold text-slate-950">
                  {benefit}
                </h3>
              </div>
            ))}
          </div>
        )}

        {product.ingredientes && (
          <div className="mt-10 border-t border-[#E7EDF5] pt-8">
            <h3 className="text-lg font-bold text-slate-950">
              Product composition
            </h3>

            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              {product.ingredientes}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
