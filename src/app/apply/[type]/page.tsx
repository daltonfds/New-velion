"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import PhoneFields from "@/components/auth/PhoneFields";
import { composeE164, getCountry } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

export default function ApplyPage() {
  const params = useParams<{ type: string }>();
  const type = params.type === "producer" ? "producer" : "supplier";

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    country: "",
    callingCode: "",
    phone: "",
    whatsapp: "",
    language: "en" as "en" | "pt",
    email: "",
    website: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    if (!form.country) {
      setError("Please select your country.");
      setLoading(false);
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      setLoading(false);
      return;
    }

    const country = getCountry(form.country);

    const { error: insertError } = await supabase
      .from("producer_supplier_applications")
      .insert({
        full_name: form.fullName.trim(),
        company_name: form.companyName.trim(),
        company_type: type,
        country_code: form.country,
        country_name: country?.name || "",
        country_calling_code: form.callingCode,
        phone_number: form.phone,
        phone_e164: composeE164(form.callingCode, form.phone),
        whatsapp_number: form.whatsapp,
        whatsapp_e164: form.whatsapp
          ? composeE164(form.callingCode, form.whatsapp)
          : "",
        email: form.email.trim(),
        website: form.website.trim() || null,
        products_description: form.description.trim(),
        preferred_language: form.language,
        status: "pending",
      });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(37,99,235,0.08)]">
            <div className="mb-7 flex justify-center border-b border-slate-100 pb-7">
              <NewvelionBrand size="md" />
            </div>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#16294F]">
              Application received
            </h1>

            <p className="mt-4 leading-7 text-slate-500">
              Thank you. Our team will review your application and contact you
              before an account is created.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Once approved, you will receive the next step to access
              Newvelion.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Newvelion
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-5 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_20px_60px_rgba(37,99,235,0.08)] sm:p-8">
          <div className="mb-8 flex justify-center border-b border-slate-100 pb-7">
            <NewvelionBrand size="md" />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8A8570]">
            Partner application
          </p>

          <h1 className="mt-2 text-3xl font-bold capitalize text-[#16294F]">
            Become a {type}
          </h1>

          <p className="mt-2 text-slate-500">
            Tell us about your business. We review applications before
            creating partner accounts.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#16294F]">
                Full name
              </label>

              <input
                required
                value={form.fullName}
                onChange={(event) =>
                  setForm({ ...form, fullName: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#16294F]">
                Company name
              </label>

              <input
                required
                value={form.companyName}
                onChange={(event) =>
                  setForm({ ...form, companyName: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                autoComplete="organization"
              />
            </div>

            <PhoneFields
              countryCode={form.country}
              phone={form.phone}
              whatsapp={form.whatsapp}
              language={form.language}
              onCountryChange={(country, callingCode) =>
                setForm({ ...form, country, callingCode })
              }
              onPhoneChange={(phone) => setForm({ ...form, phone })}
              onWhatsappChange={(whatsapp) =>
                setForm({ ...form, whatsapp })
              }
              onLanguageChange={(language) =>
                setForm({ ...form, language })
              }
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#16294F]">
                Email
              </label>

              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#16294F]">
                Website{" "}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <input
                type="url"
                value={form.website}
                onChange={(event) =>
                  setForm({ ...form, website: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                placeholder="https://"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#16294F]">
                {type === "producer"
                  ? "What do you produce?"
                  : "What do you supply?"}
              </label>

              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                placeholder={
                  type === "producer"
                    ? "Describe your products, categories and production capabilities..."
                    : "Describe the products, categories and supply capabilities you offer..."
                }
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending application..." : "Submit application"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link
              href="/"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Back to Newvelion
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
