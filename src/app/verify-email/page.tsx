"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import { supabase } from "@/lib/supabase";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() || "";\n  const requestedNext = searchParams.get("next") || "/account";
  const nextPath = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/account";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = code.replace(/\D/g, "");

    if (token.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    if (!email) {
      setError("Your email address is missing.");
      return;
    }

    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setSuccess("Email verified successfully. Redirecting to sign in...");

    setTimeout(() => {
      router.replace("/login?redirect=" + encodeURIComponent(nextPath));
    }, 900);
  }

  async function resend() {
    if (!email) {
      setError("Your email address is missing.");
      return;
    }

    setError("");
    setSuccess("");
    setResending(true);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setResending(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setSuccess("A new 6-digit verification code has been sent.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(37,99,235,0.08)]">

          <div className="mb-7 flex justify-center border-b border-slate-100 pb-7">
            <NewvelionBrand size="md" />
          </div>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600">
            ✉
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#0A0440]">
            Verify your email
          </h1>

          <p className="mt-3 text-slate-500">
            We sent a 6-digit verification code to:
          </p>

          <p className="mt-3 break-all font-semibold text-blue-600">
            {email || "your email address"}
          </p>

          <form onSubmit={verify} className="mt-7">

            <label
              htmlFor="verification-code"
              className="mb-2 block text-left text-sm font-semibold text-[#0A0440]"
            >
              Verification code
            </label>

            <input
              id="verification-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.45em] text-[#0A0440] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />

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
              type="submit"
              disabled={loading || code.length !== 6}
              className="mt-5 w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="mt-4 w-full rounded-xl border border-blue-200 bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-60"
          >
            {resending ? "Sending code..." : "Resend verification code"}
          </button>

          <Link
            href={"/register/customer?next=" + encodeURIComponent(nextPath)}
            className="mt-5 inline-block text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            Back to registration
          </Link>

        </div>
      </div>
    </main>
  );
}


export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-sm font-semibold text-[#0A0440]">
            Loading...
          </div>
        </main>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
