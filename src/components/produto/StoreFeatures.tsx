export default function StoreFeatures() {
  const features = [
    {
      number: "01",
      title: "Secure checkout",
      text: "Your order is processed through the secure checkout configured for this product.",
    },
    {
      number: "02",
      title: "Verified product information",
      text: "Product information is provided through the Newvelion marketplace catalog.",
    },
    {
      number: "03",
      title: "Reliable support",
      text: "Get support throughout your purchase experience through the Newvelion marketplace.",
    },
  ];

  return (
    <section className="border-b border-ink-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-900">
            The Newvelion experience
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            From product page to delivery
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Price, delivery details and order tracking stay visible from the product page to payment.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="border border-ink-200 bg-white p-7"
            >
              <span className="text-sm font-bold text-brand-600">
                {feature.number}
              </span>

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
