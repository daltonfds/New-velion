"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NewvelionBrand from "@/components/ui/NewvelionBrand";

const COUNTRIES = [
  { code: "ZA", name: "South Africa", callingCode: "+27" },
  { code: "MZ", name: "Mozambique", callingCode: "+258" },
  { code: "AO", name: "Angola", callingCode: "+244" },
];

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("ZA");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?role=customer&redirect=" + encodeURIComponent("/auth/complete-profile"));
        return;
      }
      const { data: profile } = await supabase.from("profiles")
        .select("full_name,country_code,phone_number")
        .eq("id", session.user.id).maybeSingle();
      if (!active) return;
      setFullName(String(profile?.full_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || ""));
      setCountryCode(COUNTRIES.some((country) => country.code === profile?.country_code) ? String(profile?.country_code) : "ZA");
      setPhone(String(profile?.phone_number || ""));
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (fullName.trim().length < 2) { setError("Please enter your full name."); return; }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) { setError("Enter a valid phone number."); return; }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError("Your session expired. Please sign in again."); return; }
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ fullName: fullName.trim(), countryCode, phone }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) { setError(body.error || "Unable to save your profile. Please try again."); return; }
      router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
      router.refresh();
    } catch {
      setError("Unable to save your profile right now. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const country = COUNTRIES.find((item) => item.code === countryCode) || COUNTRIES[0];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F8FC] px-5 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-[#DCE3EE] bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-7 flex justify-center border-b border-slate-100 pb-6"><NewvelionBrand size="md" /></div>
        <h1 className="text-2xl font-bold text-[#001B44]">Complete your profile</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Before continuing, please confirm your name, phone number and country. This helps us keep your Newvelion account accurate.</p>
        {loading ? <p className="py-8 text-sm text-slate-500">Loading your account…</p> : (
          <form onSubmit={submit} className="mt-7 space-y-5">
            <label className="block text-sm font-semibold text-[#001B44]">Full name
              <input required minLength={2} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#0078E8]" />
            </label>
            <label className="block text-sm font-semibold text-[#001B44]">Country
              <select required value={countryCode} onChange={(event) => setCountryCode(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0078E8]">
                {COUNTRIES.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-[#001B44]">Phone number
              <div className="mt-2 flex gap-2">
                <span className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm">{country.callingCode}</span>
                <input required type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Enter your phone number" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-[#0078E8]" />
              </div>
            </label>
            {error && <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-[#003B95] px-4 py-3.5 font-semibold text-white hover:bg-[#002B70] disabled:opacity-60">{saving ? "Saving profile…" : "Save and continue"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
