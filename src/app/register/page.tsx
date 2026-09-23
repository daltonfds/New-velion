"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import PhoneFields from "@/components/auth/PhoneFields";
import { composeE164, getCountry } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    country: "",
    callingCode: "",
    phone: "",
    whatsapp: "",
    language: "en" as "en" | "pt",
    email: "",
    password: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const country = getCountry(form.country);

    const { error: signupError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.fullName.trim(),
          country_code: form.country,
          country_name: country?.name || "",
          country_calling_code: form.callingCode,
          phone_number: form.phone,
          phone_e164: composeE164(form.callingCode, form.phone),
          whatsapp_number: form.whatsapp,
          whatsapp_e164: form.whatsapp
            ? composeE164(form.callingCode, form.whatsapp)
            : "",
          preferred_language: form.language,
          role: "seller",
        },
      },
    });

    setLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5">
        <div className="w-full max-w-md text-center">
          <div className="mt-2 rounded-3xl border border-[#16294F]/10 bg-white p-8 shadow-sm">
            <div className="mb-7 flex justify-center border-b border-slate-100 pb-7">
              <NewvelionBrand size="md" />
            </div>

            <h1 className="text-2xl font-bold text-[#16294F]">
              Check your email
            </h1>

            <p className="mt-3 text-slate-500">
              Your seller account was created. Confirm your email, then sign
              in to continue.
            </p>

            <Link
              href="/login"
              className="mt-6 inline-flex rounded-xl bg-[#16294F] px-6 py-3 font-semibold text-white"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mt-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex justify-center border-b border-slate-100 pb-7">
            <NewvelionBrand size="md" />
          </div>
          <h1 className="text-3xl font-bold text-[#16294F]">
            Create your seller account
          </h1>

          <p className="mt-2 text-slate-500">
            Start selling products from Newvelion's marketplace.
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Password
                </label>

                <input
                  required
                  minLength={6}
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Confirm password
                </label>

                <input
                  required
                  minLength={6}
                  type="password"
                  value={form.confirm}
                  onChange={(event) =>
                    setForm({ ...form, confirm: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5"
                />
              </div>
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
              {loading ? "Creating account..." : "Create seller account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#16294F]">
              Sign in
            </Link>
          </p>

          <div className="mt-6 border-t pt-6 text-center text-sm text-slate-500">
            Are you a producer or supplier?{" "}
            <Link
              href="/apply/producer"
              className="font-semibold text-[#16294F]"
            >
              Apply here
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
