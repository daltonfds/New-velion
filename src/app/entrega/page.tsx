"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Preview = {
  product: {
    name: string;
    description: string | null;
    image: string | null;
  };
  offer: {
    unit_price: number;
    currency: string;
  };
  quantity: number;
  subtotal: number;
  shipping: number;
  total: number;
};

function formatZar(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(value);
}

function DeliveryForm() {
  const searchParams = useSearchParams();
  const affiliateLink = searchParams.get("ref") || "";
  const requestedQuantity = Math.max(
    1,
    Math.min(50, Number(searchParams.get("qty") || "1")),
  );

  const [city, setCity] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      setPreviewLoading(true);
      setError("");

      if (!affiliateLink) {
        setPreviewLoading(false);
        setError("This seller link is invalid or has expired.");
        return;
      }

      try {
        const query = new URLSearchParams({
          ref: affiliateLink,
          qty: String(requestedQuantity),
        });
        if (city.trim()) query.set("city", city.trim());

        const response = await fetch(
          `/api/checkout-preview?${query.toString()}`,
          { cache: "no-store" },
        );
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Could not load checkout details.");
        }

        if (!cancelled) setPreview(data as Preview);
      } catch (err) {
        if (!cancelled) {
          setPreview(null);
          setError(
            err instanceof Error
              ? err.message
              : "Could not load checkout details.",
          );
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }

    const timer = window.setTimeout(loadPreview, city.trim() ? 350 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [affiliateLink, requestedQuantity, city]);

  const totalLabel = useMemo(
    () => (preview ? formatZar(preview.total) : "—"),
    [preview],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    form.set("affiliate_link", affiliateLink);
    form.set("quantity", String(preview?.quantity || requestedQuantity));
    form.set("country", "ZA");

    const rawPhone = String(form.get("phone") || "").trim();
    const rawWhatsApp = String(form.get("whatsapp") || "").trim();
    if (rawPhone.startsWith("0")) form.set("phone", "+27" + rawPhone.slice(1));
    if (rawWhatsApp.startsWith("0")) {
      form.set("whatsapp", "+27" + rawWhatsApp.slice(1));
    }

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

  if (previewLoading && !preview) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <Brand />
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#0A0440]" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Preparing your secure checkout...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!preview) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Brand />
          <div className="mt-12 rounded-3xl border border-red-100 bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl font-black text-red-600">
              !
            </div>
            <h1 className="mt-5 text-2xl font-black text-slate-950">
              Checkout unavailable
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error || "This seller link is invalid or the product is no longer available."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="bg-[#0A0440] px-4 py-3 text-center text-xs font-bold text-white">
        Secure checkout · South Africa · ZAR
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <Brand />

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-5 md:p-8"
          >
            <div className="mb-8 border-b border-slate-100 pb-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#10069F]">
                Step 1 of 2
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0A0440]">
                Delivery information
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tell us where to deliver your order. Payment is completed on
                the secure checkout that follows.
              </p>
            </div>

            <div className="grid gap-5">
              <Field label="Full name *">
                <input name="full_name" required autoComplete="name" className={inputClass} />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Phone *" hint="+27 or local 0XXXXXXXXX">
                  <input name="phone" type="tel" required autoComplete="tel" placeholder="+27 82 123 4567" className={inputClass} />
                </Field>
                <Field label="WhatsApp">
                  <input name="whatsapp" type="tel" autoComplete="tel" placeholder="+27 82 123 4567" className={inputClass} />
                </Field>
              </div>

              <Field label="Email">
                <input name="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Country">
                  <input value="South Africa" readOnly className={`${inputClass} bg-slate-50 text-slate-500`} />
                  <input type="hidden" name="country" value="ZA" />
                </Field>
                <Field label="Province / State *">
                  <input name="province" required autoComplete="address-level1" className={inputClass} />
                </Field>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="City *" hint="Used to calculate delivery">
                  <input
                    name="city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    required
                    autoComplete="address-level2"
                    className={inputClass}
                  />
                </Field>
                <Field label="Postal code">
                  <input name="postal_code" autoComplete="postal-code" className={inputClass} />
                </Field>
              </div>

              <Field label="Delivery address *">
                <textarea name="address" required rows={4} autoComplete="street-address" placeholder="Street, house or unit number" className={`${inputClass} resize-none`} />
              </Field>

              <Field label="Address reference">
                <input name="address_reference" placeholder="Landmark, building, gate, etc." className={inputClass} />
              </Field>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !affiliateLink || previewLoading}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A0440] px-5 py-4 text-sm font-black text-white transition hover:bg-[#0e1d38] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "SECURING YOUR ORDER..." : "CONTINUE TO SECURE PAYMENT →"}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <span className="text-[#10069F]">✓</span>
              Your delivery details are sent securely to checkout.
            </div>
          </form>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 lg:sticky lg:top-6">
            <div className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#10069F]">
              Order summary
              {previewLoading ? <span className="text-slate-400">Updating…</span> : null}
            </div>

            <div className="flex gap-4 border-b border-slate-100 pb-5">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                {preview.product.image ? (
                  <img src={preview.product.image} alt={preview.product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">Product</div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="line-clamp-2 font-black leading-5 text-[#0A0440]">{preview.product.name}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Quantity: <span className="font-bold text-slate-700">{preview.quantity}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3 border-b border-slate-100 py-5 text-sm">
              <div className="flex justify-between gap-4 text-slate-500">
                <span>Unit price</span>
                <span className="font-bold text-slate-900">{formatZar(preview.offer.unit_price)}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatZar(preview.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-500">
                <span>Delivery</span>
                <span className="font-bold text-[#0A0440]">
                  {formatZar(preview.shipping)}
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-4 pt-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total</p>
                <p className="mt-1 text-xs text-slate-400">ZAR</p>
              </div>
              <p className="text-xl font-black text-[#0A0440]">{totalLabel}</p>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black text-[#0A0440]">Secure checkout</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your seller price is locked for this order. Delivery is
                calculated from the NewVelion supplier shipping configuration.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-3 text-center text-xs font-bold text-slate-500 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">✓ South African delivery</div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">✓ Price protected for this offer</div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">✓ Secure payment handoff</div>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0A0440] focus:ring-2 focus:ring-[#0A0440]/10";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
        <span>{label}</span>
        {hint ? <span className="text-xs font-medium text-slate-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-end gap-1" aria-hidden="true">
        <span className="h-3 w-1.5 rounded-full bg-[#10069F]" />
        <span className="h-4.5 w-1.5 rounded-full bg-[#10069F]" />
        <span className="h-6 w-1.5 rounded-full bg-[#10069F]" />
      </div>
      <div>
        <div className="text-xl font-black tracking-tight text-[#0A0440]">Newvelion</div>
        <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8A8570]">Commerce infrastructure</div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-10">
          <div className="mx-auto max-w-2xl text-center">
            <Brand />
            <p className="mt-6 text-slate-500">Loading secure checkout...</p>
          </div>
        </main>
      }
    >
      <DeliveryForm />
    </Suspense>
  );
}
