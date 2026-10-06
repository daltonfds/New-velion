"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Method = "bank_transfer" | "mpesa" | "emola";
type Details = Record<string, string>;

const empty: Record<Method, Details> = {
  bank_transfer: { bank: "", account_number: "", branch_code: "", nib: "", holder_name: "" },
  mpesa: { phone: "", holder_name: "" },
  emola: { phone: "", holder_name: "" },
};

export default function SupplierSettingsPage() {
  const [country, setCountry] = useState("");
  const [methods, setMethods] = useState<Record<Method, boolean>>({ bank_transfer: false, mpesa: false, emola: false });
  const [details, setDetails] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) {
        setError("You must be signed in.");
        setLoading(false);
        return;
      }

      const [profile, settings] = await Promise.all([
        supabase.from("profiles").select("country_code,pais").eq("id", user.id).maybeSingle(),
        supabase.from("account_settings").select("payout_methods").eq("user_id", user.id).maybeSingle(),
      ]);

      if (profile.error) setError(profile.error.message);
      const cc = String(profile.data?.country_code ?? profile.data?.pais ?? "").toUpperCase();
      setCountry(cc);

      if (settings.error) setError(settings.error.message);
      const saved = (settings.data?.payout_methods ?? {}) as Record<string, Details & { enabled?: boolean }>;
      const nextMethods = { bank_transfer: false, mpesa: false, emola: false };
      const nextDetails = { ...empty };
      (Object.keys(nextMethods) as Method[]).forEach((method) => {
        if (saved[method]) {
          nextMethods[method] = saved[method].enabled === true;
          nextDetails[method] = { ...nextDetails[method], ...saved[method] };
        }
      });
      setMethods(nextMethods);
      setDetails(nextDetails);
      setLoading(false);
    })();
  }, []);

  function updateDetail(method: Method, key: string, value: string) {
    setDetails((current) => ({ ...current, [method]: { ...current[method], [key]: value } }));
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    const user = await getCurrentUser();
    if (!user) {
      setError("You must be signed in.");
      setSaving(false);
      return;
    }

    const payoutMethods: Record<string, unknown> = {};
    (Object.keys(methods) as Method[]).forEach((method) => {
      if (methods[method]) payoutMethods[method] = { enabled: true, ...details[method] };
    });

    const { error: saveError } = await supabase.from("account_settings").upsert(
      { user_id: user.id, payout_methods: payoutMethods, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );

    if (saveError) setError(saveError.message);
    else setMessage("Payout settings saved.");
    setSaving(false);
  }

  const toggle = (method: Method) => setMethods((current) => ({ ...current, [method]: !current[method] }));
  const label = (method: Method) => method === "bank_transfer" ? "Bank transfer" : method === "mpesa" ? "M-Pesa" : "e-Mola";

  return (
    <AppShell area="supplier" title="Settings" subtitle="Manage supplier payout preferences.">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Supplier account</p>
            <h1 className="mt-1 text-3xl font-bold text-[#16294F]">Payout settings</h1>
            <p className="mt-1 text-sm text-slate-500">Country: {country || "Not configured"}</p>
          </div>
          <Link href="/dashboard/supplier/withdrawals" className="text-sm font-semibold text-blue-600">Withdrawals →</Link>
        </div>

        {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Payout methods</h2>
          <p className="mt-1 text-sm text-slate-500">Only approved KYC holders can withdraw. The payout holder must match the verified profile.</p>

          <div className="mt-6 space-y-6">
            {(Object.keys(methods) as Method[]).map((method) => (
              <div key={method} className="rounded-xl border border-slate-200 p-5">
                <button type="button" onClick={() => toggle(method)} className="flex w-full items-center justify-between text-left">
                  <span className="font-semibold text-slate-900">{label(method)}</span>
                  <span className={methods[method] ? "text-blue-600 font-semibold" : "text-slate-400"}>{methods[method] ? "Enabled" : "Disabled"}</span>
                </button>

                {methods[method] && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                      Holder name
                      <input value={details[method].holder_name ?? ""} onChange={(e) => updateDetail(method, "holder_name", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5" />
                    </label>

                    {method === "bank_transfer" ? (
                      <>
                        <label className="grid gap-1.5 text-sm font-medium text-slate-700">Bank<input value={details[method].bank ?? ""} onChange={(e) => updateDetail(method, "bank", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5" /></label>
                        <label className="grid gap-1.5 text-sm font-medium text-slate-700">Account number<input value={details[method].account_number ?? ""} onChange={(e) => updateDetail(method, "account_number", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5" /></label>
                        <label className="grid gap-1.5 text-sm font-medium text-slate-700">Branch code<input value={details[method].branch_code ?? ""} onChange={(e) => updateDetail(method, "branch_code", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5" /></label>
                        <label className="grid gap-1.5 text-sm font-medium text-slate-700">NIB<input value={details[method].nib ?? ""} onChange={(e) => updateDetail(method, "nib", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5" /></label>
                      </>
                    ) : (
                      <label className="grid gap-1.5 text-sm font-medium text-slate-700">Mobile number<input value={details[method].phone ?? ""} onChange={(e) => updateDetail(method, "phone", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5" /></label>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button disabled={saving || loading} onClick={save} className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save payout settings"}
          </button>
        </section>
      </div>
    </AppShell>
  );
}
