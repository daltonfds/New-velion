"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const affiliateLink = searchParams.get("ref") || "";
  const quantity = searchParams.get("qty") || "1";
  const checkoutUrl = searchParams.get("checkout_url") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);

    form.set("affiliate_link", affiliateLink);
    form.set("quantity", quantity);

    try {
      const response = await fetch("/api/checkout-intents", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Unable to continue to checkout.");
      }

      const html = await response.text();

      document.open();
      document.write(html);
      document.close();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to continue to checkout.",
      );
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="text-3xl font-black text-[#16294F]">
            New<span className="text-[#C99A2E]">velion</span>
          </div>

          <h1 className="mt-6 text-3xl font-black text-slate-900">
            Delivery information
          </h1>

          <p className="mt-2 text-slate-500">
            Enter your delivery details before continuing to secure checkout.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">
                Full name *
              </span>

              <input
                name="full_name"
                required
                autoComplete="name"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#16294F]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">
                Phone *
              </span>

              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#16294F]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">
                WhatsApp
              </span>

              <input
                name="whatsapp"
                type="tel"
                autoComplete="tel"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#16294F]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">
                Email
              </span>

              <input
                name="email"
                type="email"
                autoComplete="email"
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#16294F]"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">
                  Country *
                </span>

                <input
                  name="country"
                  required
                  autoComplete="country-name"
                  className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#16294F]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">
                  Province / State *
                </span>

                <input
                  name="province"
                  required
                  autoComplete="address-level1"
                  className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#16294F]"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">
                  City *
                </span>

                <input
                  name="city"
                  required
                  autoComplete="address-level2"
                  className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#16294F]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">
                  Postal code
                </span>

                <input
                  name="postal_code"
                  autoComplete="postal-code"
                  className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#16294F]"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">
                Delivery address *
              </span>

              <textarea
                name="address"
                required
                rows={4}
                autoComplete="street-address"
                className="resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#16294F]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-700">
                Address reference
              </span>

              <input
                name="address_reference"
                placeholder="Landmark, building, gate, etc."
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#16294F]"
              />
            </label>
          </div>

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !affiliateLink || !checkoutUrl}
            className="mt-7 w-full rounded-xl bg-[#16294F] px-5 py-4 text-sm font-black text-white transition hover:bg-[#0e1d38] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "CONTINUING..." : "SECURE PAYMENT"}
          </button>

          {!affiliateLink && (
            <p className="mt-3 text-center text-xs font-medium text-red-600">
              Invalid seller link. Please return to the product page and try
              again.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
