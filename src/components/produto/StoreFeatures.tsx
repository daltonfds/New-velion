export default function StoreFeatures() {
  const features = [
    {
      number: "01",
      title: "Secure checkout",
      text: "Each product uses its configured checkout flow.",
    },
    {
      number: "02",
      title: "Product information",
      text: "Product details are displayed directly from the supplier catalog.",
    },
    {
      number: "03",
      title: "Newvelion marketplace",
      text: "Customers, sellers and suppliers are connected in one platform.",
    },
  ];

  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-black">
          Why shop through Newvelion?
        </h2>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="border border-slate-200 p-6"
            >
              <div className="font-black text-[#C99A2E]">
                {feature.number}
              </div>

              <h3 className="mt-5 font-black">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
