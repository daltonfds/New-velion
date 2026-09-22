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
      <main className="flex min-h-screen items-center justify-center bg-white px-5">
        <div className="max-w-lg text-center">
          <NewvelionBrand />

          <div className="mt-12 rounded-3xl border border-[#16294F]/10 p-8">
            <h1 className="text-3xl font-bold text-[#16294F]">
              Application received
            </h1>

            <p className="mt-4 leading-7 text-slate-500">
              Thank you. Our team will contact you before an account is
              created. Once approved, you will receive the next step to access
              Newvelion.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-[#16294F] px-6 py-3 font-semibold text-white"
            >
              Back to Newvelion
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-xl">
        <NewvelionBrand />

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8A8570]">
            Partner application
          </p>

          <h1 className="mt-2 text-3xl font-bold capitalize text-[#16294F]">
            Become a {type}
          </h1>

          <p className="mt-2 text-slate-500">
            We review applications and contact you before account creation.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Full name
              </label>

              <input
                required
                value={form.fullName}
                onChange={(event) =>
                  setForm({ ...form, fullName: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Company name
              </label>

              <input
                required
                value={form.companyName}
                onChange={(event) =>
                  setForm({ ...form, companyName: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5"
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
              <label className="mb-2 block text-sm font-semibold">
                Email
              </label>

              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Website{" "}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <input
                value={form.website}
                onChange={(event) =>
                  setForm({ ...form, website: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5"
                placeholder="https://"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-[#16294F] py-3.5 font-bold text-white disabled:opacity-60"
            >
              {loading ? "Sending application..." : "Submit application"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/" className="font-semibold text-[#16294F]">
              Back to Newvelion
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
