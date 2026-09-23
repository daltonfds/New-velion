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
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [done, setDone] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!form.country) {
      setError("Please select your country.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);

    const country = getCountry(form.country);
    const phoneE164 = composeE164(form.callingCode, form.phone);
    const whatsappE164 = form.whatsapp
      ? composeE164(form.callingCode, form.whatsapp)
      : "";

    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: form.fullName.trim(),
          country_code: form.country,
          country_name: country?.name || "",
          country_calling_code: form.callingCode,
          phone_number: form.phone,
          phone_e164: phoneE164,
          whatsapp_number: form.whatsapp,
          whatsapp_e164: whatsappE164,
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

    setRegisteredEmail(data.user?.email || form.email.trim());
    setDone(true);
  }

  async function resendConfirmation() {
    if (!registeredEmail) {
      return;
    }

    setError("");
    setSuccess("");
    setResending(true);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: registeredEmail,
    });

    setResending(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setSuccess(
      "A new confirmation email has been sent. Check your inbox and spam folder."
    );
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(37,99,235,0.08)]">
            <div className="mb-7 flex justify-center border-b border-slate-100 pb-7">
              <NewvelionBrand size="md" />
            </div>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600">
              ✓
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[#16294F]">
              Check your email
            </h1>

            <p className="mt-3 text-slate-500">
              Your seller account has been created. We sent a confirmation
              email to:
            </p>

            <p className="mt-3 break-all font-semibold text-blue-600">
              {registeredEmail}
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Confirm your email address before signing in. If you do not see
              the message, check your spam or junk folder.
            </p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
                {success}
              </div>
            )}

            <button
              type="button"
              onClick={resendConfirmation}
              disabled={resending}
              className="mt-6 w-full rounded-xl border border-blue-200 bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-60"
            >
              {resending
                ? "Sending confirmation..."
                : "Resend confirmation email"}
            </button>

            <Link
              href="/login"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Go to sign in
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

          <h1 className="text-3xl font-bold text-[#16294F]">
            Create your seller account
          </h1>

          <p className="mt-2 text-slate-500">
            Start selling products from Newvelion's marketplace.
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#16294F]">
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#16294F]">
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  autoComplete="new-password"
                />
              </div>
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
              {loading ? "Creating account..." : "Create seller account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
            Are you a producer or supplier?{" "}
            <Link
              href="/apply/producer"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Apply here
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
