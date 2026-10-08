"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import { supabase } from "@/lib/supabase";

const initial = {
  company_name: "",
  legal_name: "",
  business_type: "supplier",
  country_code: "ZA",
  business_phone: "",
  whatsapp: "",
  business_email: "",
  website: "",
  registration_number: "",
  tax_number: "",
  product_categories: "",
  description: "",
  responsible_name: "",
  responsible_title: "",
  public_city: "",
  public_region: "",
};

export default function BecomeSupplierPage() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session));
      setLoading(false);
    });
  }, []);

  function field(name: keyof typeof initial, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setAuthenticated(false);
        throw new Error("Please sign in or create a Newvelion account before submitting your supplier application.");
      }

      const response = await fetch("/api/supplier/apply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          product_categories: form.product_categories.split(",").map((x) => x.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to submit supplier application.");

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit supplier application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-white" />;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1F2937]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 lg:px-8">
          <Link href="/"><NewvelionBrand size="sm" /></Link>
          <Link href={authenticated ? "/login" : "/register"} className="text-sm font-semibold text-[#003B95]">
            {authenticated ? "Account" : "Create account"}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#006CE5]">Supplier onboarding</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#001B44] sm:text-4xl">Become a Producer / Supplier</h1>
          <p className="mt-3 text-base leading-7 text-[#6B7280]">
            Register your company to supply products through Newvelion. Applications are reviewed by the Newvelion team before supplier access is approved.
          </p>
        </div>

        {!authenticated && !submitted && (
          <div className="mt-8 rounded-2xl border border-[#D7E7FA] bg-[#EAF3FF] p-5">
            <p className="text-sm font-semibold text-[#001B44]">Account required</p>
            <p className="mt-1 text-sm leading-6 text-[#4B5563]">Create or sign in to your Newvelion account, then return here to submit the company application.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-lg bg-[#003B95] px-5 py-2.5 text-sm font-semibold text-white">Create account</Link>
              <Link href="/login" className="rounded-lg border border-[#C9D8EA] bg-white px-5 py-2.5 text-sm font-semibold text-[#003B95]">Sign in</Link>
            </div>
          </div>
        )}

        {submitted ? (
          <section className="mt-8 rounded-2xl border border-[#D7E7FA] bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3FF] text-[#006CE5]">✓</div>
            <h2 className="mt-5 text-2xl font-bold text-[#001B44]">Application submitted</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Your supplier application is now pending Newvelion review. You will be able to manage supplier products and fulfillment after approval.
            </p>
            <Link href="/" className="mt-6 inline-flex rounded-lg bg-[#003B95] px-5 py-2.5 text-sm font-semibold text-white">Back to Newvelion</Link>
          </section>
        ) : authenticated ? (
          <form onSubmit={submit} className="mt-8 space-y-6">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#001B44]">Company information</h2>
              <p className="mt-1 text-sm text-[#6B7280]">Legal and operating information for your supplier profile.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Input label="Company name" value={form.company_name} onChange={(v) => field("company_name", v)} required />
                <Input label="Legal name" value={form.legal_name} onChange={(v) => field("legal_name", v)} />
                <Select label="Business type" value={form.business_type} onChange={(v) => field("business_type", v)} options={[["supplier","Supplier"],["producer","Producer"],["producer_supplier","Producer & Supplier"]]} />
                <Select label="Country" value={form.country_code} onChange={(v) => field("country_code", v)} options={[["ZA","South Africa"],["CN","China"]]} />
                <Input label="Registration number" value={form.registration_number} onChange={(v) => field("registration_number", v)} />
                <Input label="Tax number" value={form.tax_number} onChange={(v) => field("tax_number", v)} />
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#001B44]">Responsible person</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Input label="Full name" value={form.responsible_name} onChange={(v) => field("responsible_name", v)} required />
                <Input label="Position / title" value={form.responsible_title} onChange={(v) => field("responsible_title", v)} />
                <Input label="Business phone" value={form.business_phone} onChange={(v) => field("business_phone", v)} />
                <Input label="WhatsApp" value={form.whatsapp} onChange={(v) => field("whatsapp", v)} />
                <Input label="Business email" type="email" value={form.business_email} onChange={(v) => field("business_email", v)} />
                <Input label="Website" value={form.website} onChange={(v) => field("website", v)} />
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#001B44]">Company location & catalog</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Input label="City" value={form.public_city} onChange={(v) => field("public_city", v)} />
                <Input label="Region / province" value={form.public_region} onChange={(v) => field("public_region", v)} />
                <div className="sm:col-span-2"><Input label="Product categories" hint="Separate categories with commas." value={form.product_categories} onChange={(v) => field("product_categories", v)} /></div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-[#374151]">Company description<textarea value={form.description} onChange={(e) => field("description", e.target.value)} rows={5} className="mt-2 w-full rounded-lg border border-[#D1D5DB] px-3 py-2.5 text-sm outline-none focus:border-[#0078E8] focus:ring-2 focus:ring-[#EAF3FF]" /></label>
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link href="/" className="rounded-lg border border-[#D1D5DB] bg-white px-5 py-3 text-center text-sm font-semibold text-[#374151]">Cancel</Link>
              <button type="submit" disabled={submitting} className="rounded-lg bg-[#003B95] px-6 py-3 text-sm font-semibold text-white hover:bg-[#001B44] disabled:opacity-60">
                {submitting ? "Submitting application..." : "Submit supplier application"}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </main>
  );
}

function Input({ label, value, onChange, required, type = "text", hint }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; hint?: string }) {
  return <label className="text-sm font-semibold text-[#374151]">{label}{required ? " *" : ""}{hint && <span className="ml-2 text-xs font-normal text-[#6B7280]">{hint}</span>}<input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#D1D5DB] px-3 text-sm outline-none focus:border-[#0078E8] focus:ring-2 focus:ring-[#EAF3FF]" /></label>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="text-sm font-semibold text-[#374151]">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#D1D5DB] bg-white px-3 text-sm outline-none focus:border-[#0078E8] focus:ring-2 focus:ring-[#EAF3FF]">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>;
}
