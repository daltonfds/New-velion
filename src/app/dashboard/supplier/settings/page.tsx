"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { supplierFetch } from "@/lib/supplier-client";

type Country = "ZA" | "CN";
type Method = "bank_transfer" | "alipay" | "wechat_pay" | "unionpay" | "ecny";
type Details = Record<string, string | boolean>;

const definitions: Record<Country, Array<{ key: Method; label: string; description: string; fields: Array<[string,string]> }>> = {
  ZA: [
    { key: "bank_transfer", label: "Bank transfer / EFT", description: "South African bank payout.", fields: [["bank","Bank"],["account_type","Account type"],["account_number","Account number"],["branch_code","Branch code"],["holder_name","Account holder"]] },
  ],
  CN: [
    { key: "bank_transfer", label: "Bank transfer", description: "Chinese bank account payout.", fields: [["bank","Bank"],["account_number","Account number"],["branch_name","Branch / branch name"],["holder_name","Account holder"]] },
    { key: "alipay", label: "Alipay", description: "Configured as a manual/provider payout rail until the settlement integration is connected.", fields: [["account_id","Alipay account ID"],["holder_name","Account holder"]] },
    { key: "wechat_pay", label: "WeChat Pay", description: "Configured as a manual/provider payout rail until the settlement integration is connected.", fields: [["account_id","WeChat Pay account ID"],["holder_name","Account holder"]] },
    { key: "unionpay", label: "UnionPay", description: "Configured as a manual/provider payout rail until the settlement integration is connected.", fields: [["card_number","UnionPay card number"],["bank","Bank"],["holder_name","Card holder"]] },
    { key: "ecny", label: "e-CNY", description: "Configured as a manual/provider payout rail until the settlement integration is connected.", fields: [["wallet_id","e-CNY wallet ID"],["holder_name","Wallet holder"]] },
  ],
};

export default function SupplierSettingsPage() {
  const [country, setCountry] = useState<Country | "">("");
  const [saved, setSaved] = useState<Record<string, Details & { enabled?: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (!user) throw new Error("You must be signed in.");
        const [profileResult, settingsResult] = await Promise.all([
          supplierFetch<{ data: { country_code?: string } }>("/api/supplier/profile"),
          supabase.from("account_settings").select("payout_methods").eq("user_id", user.id).maybeSingle(),
        ]);
        if (settingsResult.error) throw new Error(settingsResult.error.message);
        const cc = String(profileResult.data?.country_code ?? "").toUpperCase();
        if (cc !== "ZA" && cc !== "CN") throw new Error("Supplier country must be South Africa or China.");
        setCountry(cc);
        setSaved((settingsResult.data?.payout_methods ?? {}) as Record<string, Details & { enabled?: boolean }>);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load payout settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const options = useMemo(() => country ? definitions[country] : [], [country]);

  function toggle(key: Method) {
    setSaved((current) => {
      const existing = current[key];
      return { ...current, [key]: { ...(existing ?? {}), enabled: existing?.enabled !== true } };
    });
  }

  function update(key: Method, field: string, value: string) {
    setSaved((current) => ({ ...current, [key]: { ...(current[key] ?? {}), [field]: value } }));
  }

  async function save() {
    const user = await getCurrentUser();
    if (!user) { setError("You must be signed in."); return; }
    setSaving(true); setError(""); setMessage("");
    const allowed = new Set(options.map((item) => item.key));
    const payoutMethods: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(saved)) {
      if (allowed.has(key as Method) && value?.enabled === true) payoutMethods[key] = value;
    }
    const { error: saveError } = await supabase.from("account_settings").upsert(
      { user_id: user.id, payout_methods: payoutMethods, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
    if (saveError) setError(saveError.message);
    else { setSaved(payoutMethods as Record<string, Details & { enabled?: boolean }>); setMessage("Payout settings saved."); }
    setSaving(false);
  }

  return (
    <AppShell area="supplier" title="Settings" subtitle="Manage supplier payout preferences.">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Supplier account</p>
            <h1 className="mt-1 text-3xl font-bold text-[#16294F]">Payout settings</h1>
            <p className="mt-1 text-sm text-slate-500">{country === "ZA" ? "South Africa · ZAR · +27" : country === "CN" ? "China · CNY · +86" : "Country not configured"}</p>
          </div>
          <Link href="/dashboard/supplier/withdrawals" className="text-sm font-semibold text-blue-600">Withdrawals →</Link>
        </div>
        {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Country-specific payout methods</h2>
          <p className="mt-1 text-sm text-slate-500">Only methods available for your approved supplier country are shown. The payout holder must match your KYC-approved name.</p>
          {loading ? <div className="mt-6 text-sm text-slate-500">Loading...</div> : (
            <div className="mt-6 space-y-5">
              {options.map((option) => {
                const value = saved[option.key] ?? {};
                const enabled = value.enabled === true;
                return (
                  <div key={option.key} className="rounded-xl border border-slate-200 p-5">
                    <button type="button" onClick={() => toggle(option.key)} className="flex w-full items-center justify-between text-left">
                      <div><p className="font-semibold text-slate-900">{option.label}</p><p className="mt-1 text-xs text-slate-500">{option.description}</p></div>
                      <span className={enabled ? "font-semibold text-blue-600" : "text-slate-400"}>{enabled ? "Enabled" : "Disabled"}</span>
                    </button>
                    {enabled && <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {option.fields.map(([field,label]) => (
                        <label key={field} className="grid gap-1.5 text-sm font-medium text-slate-700">
                          {label}
                          <input value={String(value[field] ?? "")} onChange={(e) => update(option.key, field, e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5" />
                        </label>
                      ))}
                    </div>}
                  </div>
                );
              })}
              {!options.length && <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Set your supplier country to South Africa or China before configuring payouts.</div>}
            </div>
          )}
          <button disabled={saving || loading || !options.length} onClick={save} className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Save payout settings"}</button>
        </section>
      </div>
    </AppShell>
  );
}
