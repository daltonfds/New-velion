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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  async function continueWithGoogle() {
    setError("");
    setGoogleLoading(true);
    const requestedRole = (searchParams.get("role") || "").toLowerCase();
    const roleDefault = requestedRole === "customer" ? "/account" : requestedRole === "affiliate" ? "/dashboard/affiliate" : "/dashboard";
    const requestedNext = searchParams.get("redirect") || searchParams.get("next") || roleDefault;
    const nextPath = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : roleDefault;
    if (["supplier", "producer"].includes((searchParams.get("role") || "").toLowerCase()) || nextPath.includes("/dashboard/supplier")) {
      setError("Google sign-in is available for sellers, affiliates and customers, but not supplier / producer accounts. Please use email and password.");
      setGoogleLoading(false);
      return;
    }
    const intent = (searchParams.get("role") || "").toLowerCase() === "customer" || nextPath === "/account" || nextPath.startsWith("/dashboard/customer") ? "&intent=customer" : "";
    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(nextPath) + intent, queryParams: { prompt: "select_account" } } });
    if (oauthError) { setError(oauthError.message); setGoogleLoading(false); }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result?.error || "Unable to sign in.");
        return;
      }

      if (!result?.session?.access_token || !result?.session?.refresh_token) {
        setError("Unable to establish your session. Please try again.");
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (sessionError) {
        setError("Unable to establish your session. Please try again.");
        return;
      }

      const loginRole = (searchParams.get("role") || "").toLowerCase();
      router.replace(searchParams.get("redirect") || searchParams.get("next") || (loginRole === "customer" ? "/account" : loginRole === "affiliate" ? "/dashboard/affiliate" : "/dashboard"));
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f9fc] px-5 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-[12px] border border-[#dde5ef] bg-white p-7 shadow-none sm:p-8">
          <div className="mb-8 flex justify-center border-b border-slate-100 pb-7">
            <NewvelionBrand size="md" />
          </div>

          <h1 className="text-3xl font-bold text-[#0e1f3d]">
            Welcome back
          </h1>

          <p className="mt-2 text-slate-500">
            Sign in to your Newvelion account.
          </p>

          {!["supplier", "producer"].includes((searchParams.get("role") || "").toLowerCase()) && !((searchParams.get("redirect") || searchParams.get("next") || "").includes("/dashboard/supplier")) && (<button type="button" onClick={continueWithGoogle} disabled={googleLoading || loading} className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"><svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.5 13.3l7.8 6.1C12.2 13.4 17.6 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.6 2.9-2.2 5.4-4.6 7.1l7.4 5.7c4.3-4 6.9-9.9 6.9-17.3Z"/><path fill="#FBBC05" d="M10.3 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.6 2.5 10.8l7.8-6.1Z"/><path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.6 2.3-6.4 0-11.8-3.9-13.7-9.5l-7.8 6.1C6.5 43.1 14.6 48 24 48Z"/></svg>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</button>)}

          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400"><span className="h-px flex-1 bg-slate-200" />or sign in with email<span className="h-px flex-1 bg-slate-200" /></div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0A0440]">
                Email
              </label>

              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-[7px] border border-[#dde5ef] bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-[#eef5ff]"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0A0440]">
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
              className="w-full rounded-xl bg-[#0e4aab] px-4 py-3.5 font-semibold text-white transition hover:bg-[#0b3d8f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New customer?{" "}
            <Link
              href={"/register/customer?next=" + encodeURIComponent(searchParams.get("redirect") || "/account")}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create a buyer account
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-slate-500">
            Want to sell?{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Create a seller account
            </Link>
          </p>

          <p className="mt-4 text-center text-sm text-slate-500">Want to promote Newvelion?{" "}<Link href="/register/affiliate" className="font-semibold text-blue-600 hover:text-blue-700">Join as a platform affiliate</Link></p>
          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">

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
