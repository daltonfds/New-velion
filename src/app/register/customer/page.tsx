"use client";

import { FormEvent, useState } from "react";
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

      router.push("/verify-email?email=" + encodeURIComponent(data.user?.email || email.trim()));
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

          <form onSubmit={submit} className="mt-8 space-y-5">
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
