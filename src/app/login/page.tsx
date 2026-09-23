"use client";

import { Suspense, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import { supabase } from "@/lib/supabase";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut();

      setError(
        "Please confirm your email address before signing in. Check your inbox and spam folder."
      );

      return;
    }

    router.push(searchParams.get("redirect") || "/dashboard");
    router.refresh();
  }

  async function resendConfirmation() {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setError("");
    setSuccess("");
    setResending(true);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
    });

    setResending(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setSuccess(
      "Confirmation email sent. Check your inbox and spam folder."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-[0_20px_60px_rgba(37,99,235,0.08)] sm:p-8">
          <div className="mb-8 flex justify-center border-b border-slate-100 pb-7">
            <NewvelionBrand size="md" />
          </div>

          <h1 className="text-3xl font-bold text-[#16294F]">
            Welcome back
          </h1>

          <p className="mt-2 text-slate-500">
            Sign in to your Newvelion account.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#16294F]">
                Email
              </label>

              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#16294F]">
                Password
              </label>

              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            onClick={resendConfirmation}
            disabled={resending}
            className="mt-4 w-full text-sm font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-60"
          >
            {resending
              ? "Sending confirmation..."
              : "Resend confirmation email"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create a seller account
            </Link>
          </p>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
            Producer or supplier?{" "}
            <Link
              href="/apply/producer"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Apply as a partner
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
