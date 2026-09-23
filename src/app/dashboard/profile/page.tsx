"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PhoneFields from "@/components/auth/PhoneFields";
import { composeE164 } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

type Language = "en" | "pt";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [callingCode, setCallingCode] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/dashboard/profile");
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select(
          "full_name,country_code,country_calling_code,phone_number,whatsapp_number,preferred_language"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setFullName(data?.full_name || "");
      setCountryCode(data?.country_code || "");
      setCallingCode(data?.country_calling_code || "");
      setPhone(data?.phone_number || "");
      setWhatsapp(data?.whatsapp_number || "");
      setLanguage(data?.preferred_language === "pt" ? "pt" : "en");
      setLoading(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !countryCode || !callingCode || !cleanPhone) {
      setError("Please complete your name, country and phone number.");
      return;
    }

    const phoneE164 = composeE164(callingCode, cleanPhone);

    if (!phoneE164) {
      setError("Please enter a valid phone number.");
      return;
    }

    const whatsappE164 = whatsapp.trim()
      ? composeE164(callingCode, whatsapp.trim())
      : "";

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login?redirect=/dashboard/profile");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: cleanName,
        country_code: countryCode,
        country_calling_code: callingCode,
        phone_number: cleanPhone,
        phone_e164: phoneE164,
        whatsapp_number: whatsapp.trim() || null,
        whatsapp_e164: whatsappE164 || null,
        preferred_language: language,
      })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    window.dispatchEvent(new Event("profile-updated"));

    setTimeout(() => {
      router.push("/dashboard");
    }, 700);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <Loader2 className="h-7 w-7 animate-spin text-[#1769e0]" />
      </div>
    );
  }

  return (
    <DashboardShell
      area="seller"
      activeKey="dashboard"
      title="Complete your profile"
      subtitle="Keep your NewVelion account information up to date."
    >
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-8 border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Profile information
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Complete the required information below to continue using your
              NewVelion account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#16294F]">
                Full name
              </label>

              <input
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-[#16294F]/15 bg-white px-4 py-3.5 outline-none transition focus:border-[#1769e0] focus:ring-2 focus:ring-[#1769e0]/10"
              />
            </div>

            <PhoneFields
              countryCode={countryCode}
              phone={phone}
              whatsapp={whatsapp}
              language={language}
              onCountryChange={(country, code) => {
                setCountryCode(country);
                setCallingCode(code);
              }}
              onPhoneChange={setPhone}
              onWhatsappChange={setWhatsapp}
              onLanguageChange={setLanguage}
            />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                Profile completed successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#1769e0] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#125bc4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save and continue"}
            </button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
