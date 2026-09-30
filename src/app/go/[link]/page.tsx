import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function AffiliateProductPage({
  params,
}: {
  params: Promise<{ link: string }>;
}) {
  const { link } = await params;

  if (!supabaseUrl || !supabaseAnonKey || !link) {
    notFound();
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("resolve_affiliate_product", {
    p_link_unico: `go/${link}`,
  });

  if (error) {
    console.error("Failed to resolve affiliate product:", error);
    notFound();
  }

  const product = Array.isArray(data) ? data[0] : data;

  if (!product?.product_id || !product?.affiliate_id) {
    notFound();
  }

  const requestHeaders = await headers();

  await supabase.rpc("record_affiliate_click", {
    p_link_unico: `go/${link}`,
    p_user_agent: requestHeaders.get("user-agent"),
    p_referrer: requestHeaders.get("referer"),
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-square bg-slate-100">
              {product.imagem_url ? (
                <img
                  src={product.imagem_url}
                  alt={product.nome || "Product"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Product image
                </div>
              )}
            </div>

            <div className="p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {product.categoria || "Product"}
              </p>

              <h1 className="mt-2 text-2xl font-semibold text-slate-950">
                {product.nome || "Product"}
              </h1>

              {product.descricao && (
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {product.descricao}
                </p>
              )}

              <div className="mt-6">
                <span className="text-3xl font-bold text-slate-950">
                  {Number(
                    product.preco_promocional ?? product.preco ?? 0,
                  ).toLocaleString("pt-MZ", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="ml-2 text-sm text-slate-500">
                  {product.moeda || "ZAR"}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Delivery information
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Where should we deliver your order?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fill in your delivery details before continuing to payment.
              </p>
            </div>

            <form
              action="/api/checkout-intents"
              method="POST"
              className="mt-8 space-y-5"
            >
              <input
                type="hidden"
                name="affiliate_link"
                value={`go/${link}`}
              />

              <div>
                <label
                  htmlFor="full_name"
                  className="text-sm font-medium text-slate-900"
                >
                  Full name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  required
                  autoComplete="name"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-900"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-slate-900"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    required
                    type="tel"
                    autoComplete="tel"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                    placeholder="+258..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="whatsapp"
                    className="text-sm font-medium text-slate-900"
                  >
                    WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                    placeholder="+258..."
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="country"
                    className="text-sm font-medium text-slate-900"
                  >
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    required
                    autoComplete="country-name"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                    placeholder="Mozambique"
                  />
                </div>

                <div>
                  <label
                    htmlFor="province"
                    className="text-sm font-medium text-slate-900"
                  >
                    Province / State
                  </label>
                  <input
                    id="province"
                    name="province"
                    required
                    autoComplete="address-level1"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                    placeholder="Province"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="city"
                    className="text-sm font-medium text-slate-900"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    required
                    autoComplete="address-level2"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label
                    htmlFor="postal_code"
                    className="text-sm font-medium text-slate-900"
                  >
                    Postal code
                  </label>
                  <input
                    id="postal_code"
                    name="postal_code"
                    autoComplete="postal-code"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                    placeholder="Postal code"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-slate-900"
                >
                  Delivery address
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  autoComplete="street-address"
                  className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  placeholder="Street, house number and neighborhood"
                />
              </div>

              <div>
                <label
                  htmlFor="address_reference"
                  className="text-sm font-medium text-slate-900"
                >
                  Address reference
                </label>
                <textarea
                  id="address_reference"
                  name="address_reference"
                  rows={2}
                  className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  placeholder="Nearby landmark or additional delivery instructions"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continue to payment
              </button>

              <p className="text-center text-xs leading-5 text-slate-500">
                Your delivery information will be associated with this
                product and affiliate before you continue to payment.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
