"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import { supabase } from "@/lib/supabase";

export default function PlatformAffiliateRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    setLoading(true);
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role: "platform_affiliate",
          preferred_language: "en",
          accepted_terms_at: new Date().toISOString(),
          accepted_terms_version: "2026-10-09",
          accepted_privacy_policy: true,
        },
      },
    });
    setLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }
    router.push("/verify-email?email=" + encodeURIComponent(data.user?.email || email.trim()));
  }

  return (
    <main className="min-h-screen bg-[#F5F8FC] px-5 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-2xl border border-[#DCE3EE] bg-white p-6 shadow-sm sm:p-9">
          <div className="mb-8 flex justify-center border-b border-slate-100 pb-7"><NewvelionBrand size="md" /></div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0078E8]">Newvelion Partner Program</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#001B44]">Become a platform affiliate</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Refer sellers and suppliers to Newvelion. Earn R50 when each referred business makes its first confirmed sale, and unlock mystery prizes as your active referrals grow.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-[#EAF3FF] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#003B95]">Referral reward</p><p className="mt-1 text-2xl font-bold text-[#001B44]">R50</p><p className="mt-1 text-xs text-slate-600">After the first confirmed sale</p></div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Milestone reward</p><p className="mt-1 text-2xl font-bold text-[#001B44]">Mystery prize</p><p className="mt-1 text-xs text-slate-600">At 5, 10 and 25 active referrals</p></div>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold text-[#001B44]">Full name<input required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#0078E8]" /></label>
            <label className="block text-sm font-semibold text-[#001B44]">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#0078E8]" /></label>
            <label className="block text-sm font-semibold text-[#001B44]">Password<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#0078E8]" /></label>
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" required checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 h-4 w-4 accent-[#006CE5]" /><span>I agree to the <Link href="/terms" target="_blank" className="font-semibold text-[#003B95] underline">Terms of Service</Link> and acknowledge the <Link href="/privacy" target="_blank" className="font-semibold text-[#003B95] underline">Privacy Policy</Link>.</span></label>
            {error && <div role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#003B95] px-4 py-3.5 font-semibold text-white hover:bg-[#002B70] disabled:opacity-60">{loading ? "Creating account..." : "Create affiliate account"}</button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-semibold text-[#003B95]">Sign in</Link></p>
          <p className="mt-3 text-center text-xs leading-5 text-slate-400">Rewards are recorded only after a first confirmed paid sale. Registrations alone do not count as active referrals.</p>
        </div>
      </div>
    </main>
  );
}
