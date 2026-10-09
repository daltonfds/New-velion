"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import { supabase } from "@/lib/supabase";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [nextPath, setNextPath] = useState("/account");

  useEffect(() => {
    const candidate = new URLSearchParams(window.location.search).get("next");
    if (candidate && candidate.startsWith("/") && !candidate.startsWith("//")) setNextPath(candidate);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedPhone = phone.replace(/[\\s()-]/g, "");
    const digits = normalizedPhone.replace(/\\D/g, "");
    if (digits.length < 9 || digits.length > 15) {
      setError("Enter a valid mobile number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    const phoneE164 = normalizedPhone.startsWith("+")
      ? "+" + digits
      : "+27" + digits.replace(/^0/, "");

    setLoading(true);
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role: "customer",
            country_code: "ZA",
            country_name: "South Africa",
            country_calling_code: "+27",
            phone_number: normalizedPhone,
            phone_e164: phoneE164,
            preferred_language: "en",
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      router.push("/verify-email?email=" + encodeURIComponent(data.user?.email || email.trim()) + "&next=" + encodeURIComponent(nextPath));
    } catch {
      setError("Unable to create your account right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f9fc] px-5 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-[#dde5ef] bg-white p-6 shadow-none sm:p-8">
          <div className="mb-8 flex justify-center border-b border-slate-100 pb-7">
            <NewvelionBrand size="md" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#003B95]">Create your buyer account</h1>
          <p className="mt-2 text-slate-500">Use your email, mobile number and password to shop and track your orders.</p>

          <button type="button" onClick={continueWithGoogle} disabled={googleLoading || loading} className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border border-[#cbd5e1] bg-white py-3.5 font-semibold text-[#1f2937] hover:bg-[#f8fafc] disabled:opacity-60"><svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.5 13.3l7.8 6.1C12.2 13.4 17.6 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.6 2.9-2.2 5.4-4.6 7.1l7.4 5.7c4.3-4 6.9-9.9 6.9-17.3Z"/><path fill="#FBBC05" d="M10.3 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.6 2.5 10.8l7.8-6.1Z"/><path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.6 2.3-6.4 0-11.8-3.9-13.7-9.5l-7.8 6.1C6.5 43.1 14.6 48 24 48Z"/></svg>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</button>\n          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400"><span className="h-px flex-1 bg-slate-200" />or use email<span className="h-px flex-1 bg-slate-200" /></div>\n          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="buyer-email" className="mb-2 block text-sm font-semibold text-[#001B44]">Email address</label>
              <input id="buyer-email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-[#dde5ef] px-4 py-3.5 text-slate-900 outline-none focus:border-[#0078E8] focus:ring-2 focus:ring-[#EAF3FF]" />
            </div>
            <div>
              <label htmlFor="buyer-phone" className="mb-2 block text-sm font-semibold text-[#001B44]">Mobile number</label>
              <div className="flex gap-2">
                <span className="flex shrink-0 items-center rounded-lg border border-[#dde5ef] bg-[#F7FAFF] px-4 text-sm font-semibold text-[#003B95]">+27</span>
                <input id="buyer-phone" required type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="72 123 4567" className="min-w-0 flex-1 rounded-lg border border-[#dde5ef] px-4 py-3.5 text-slate-900 outline-none focus:border-[#0078E8] focus:ring-2 focus:ring-[#EAF3FF]" />
              </div>
              <p className="mt-2 text-xs text-slate-500">For customers shopping and receiving deliveries in South Africa.</p>
            </div>
            <div>
              <label htmlFor="buyer-password" className="mb-2 block text-sm font-semibold text-[#001B44]">Password</label>
              <input id="buyer-password" required minLength={6} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="w-full rounded-lg border border-[#dde5ef] px-4 py-3.5 text-slate-900 outline-none focus:border-[#0078E8] focus:ring-2 focus:ring-[#EAF3FF]" />
            </div>
            {error && <div role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#003B95] py-3.5 font-bold text-white transition hover:bg-[#0078E8] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Creating account..." : "Create buyer account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-bold text-[#0078E8]">Sign in</Link></p>
          <p className="mt-4 text-center text-sm text-slate-500">Want to sell instead? <Link href="/register" className="font-semibold text-[#003B95] underline">Create a seller account</Link></p>
        </div>
      </div>
    </main>
  );
}
