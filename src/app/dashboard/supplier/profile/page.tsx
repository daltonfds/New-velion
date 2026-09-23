"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { COUNTRIES, composeE164, getCountry } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

type CompanyType = "producer" | "supplier" | "producer_supplier";

type FormState = {
  companyName: string;
  legalName: string;
  companyType: CompanyType;
  countryCode: string;
  businessPhone: string;
  whatsapp: string;
  businessEmail: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  registrationNumber: string;
  taxNumber: string;
  description: string;
  jobTitle: string;
};

const emptyForm: FormState = {
  companyName: "",
  legalName: "",
  companyType: "supplier",
  countryCode: "",
  businessPhone: "",
  whatsapp: "",
  businessEmail: "",
  website: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateRegion: "",
  postalCode: "",
  registrationNumber: "",
  taxNumber: "",
  description: "",
  jobTitle: "",
};

export default function SupplierCompanyProfilePage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [responsibleName, setResponsibleName] = useState("");
  const [responsibleEmail, setResponsibleEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login?redirect=/dashboard/supplier/profile";
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name,primary_company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setResponsibleName(profile?.full_name || "");
      setResponsibleEmail(user.email || "");

      if (profile?.primary_company_id) {
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select(
            "company_name,legal_name,company_type,country_code,business_phone,whatsapp_number,business_email,website,address_line1,address_line2,city,state_region,postal_code,registration_number,tax_number,description",
          )
          .eq("id", profile.primary_company_id)
          .maybeSingle();

        if (companyError) {
          setError(companyError.message);
        } else if (company) {
          setForm({
            companyName: company.company_name || "",
            legalName: company.legal_name || "",
            companyType:
              company.company_type === "producer" ||
              company.company_type === "producer_supplier"
                ? company.company_type
                : "supplier",
            countryCode: company.country_code || "",
            businessPhone: company.business_phone || "",
            whatsapp: company.whatsapp_number || "",
            businessEmail: company.business_email || "",
            website: company.website || "",
            addressLine1: company.address_line1 || "",
            addressLine2: company.address_line2 || "",
            city: company.city || "",
            stateRegion: company.state_region || "",
            postalCode: company.postal_code || "",
            registrationNumber: company.registration_number || "",
            taxNumber: company.tax_number || "",
            description: company.description || "",
            jobTitle: "",
          });

          const { data: member } = await supabase
            .from("company_members")
            .select("job_title")
            .eq("company_id", profile.primary_company_id)
            .eq("user_id", user.id)
            .maybeSingle();

          if (member) {
            setForm((current) => ({
              ...current,
              jobTitle: member.job_title || "",
            }));
          }
        }
      }

      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    const country = getCountry(form.countryCode);

    const businessPhoneE164 = composeE164(
      country?.callingCode || "",
      form.businessPhone,
    );

    const whatsappE164 = form.whatsapp.trim()
      ? composeE164(country?.callingCode || "", form.whatsapp)
      : "";

    if (!businessPhoneE164) {
      setError("Please enter a valid business phone number.");
      return;
    }

    setSaving(true);

    const { data: companyId, error: rpcError } = await supabase.rpc(
      "save_supplier_company_profile",
      {
        p_company_name: form.companyName.trim(),
        p_legal_name: form.legalName.trim() || null,
        p_company_type: form.companyType,
        p_country_code: form.countryCode,
        p_country_name: country?.name || "",
        p_country_calling_code: country?.callingCode || "",
        p_business_phone: form.businessPhone.trim(),
        p_business_phone_e164: businessPhoneE164,
        p_business_email: form.businessEmail.trim() || null,
        p_whatsapp_number: form.whatsapp.trim() || null,
        p_whatsapp_e164: whatsappE164 || null,
        p_website: form.website.trim() || null,
        p_address_line1: form.addressLine1.trim() || null,
        p_address_line2: form.addressLine2.trim() || null,
        p_city: form.city.trim() || null,
        p_state_region: form.stateRegion.trim() || null,
        p_postal_code: form.postalCode.trim() || null,
        p_registration_number: form.registrationNumber.trim() || null,
        p_tax_number: form.taxNumber.trim() || null,
        p_description: form.description.trim() || null,
        p_job_title: form.jobTitle.trim() || null,
      },
    );

    if (rpcError) {
      setSaving(false);
      setError(rpcError.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && companyId) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          primary_company_id: companyId,
        })
        .eq("id", user.id);

      if (profileError) {
        setSaving(false);
        setError(profileError.message);
        return;
      }
    }

    setSaving(false);
    setSuccess(true);

    window.dispatchEvent(new Event("profile-updated"));

    setTimeout(() => {
      window.location.href = "/dashboard/supplier";
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
      area="supplier"
      activeKey="companyProfile"
      title="Company Profile"
      subtitle="Business information and responsible person"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#8A8570]">
            Supplier setup
          </p>

          <h2 className="mt-1 text-3xl font-bold text-[#16294F]">
            Company information
          </h2>

          <p className="mt-2 text-slate-500">
            This information is separate from your personal NewVelion profile.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h3 className="text-xl font-bold text-slate-950">
              Business details
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              The legal and operational information associated with your business.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Company name"
                required
                value={form.companyName}
                onChange={(v) => update("companyName", v)}
              />

              <Field
                label="Legal name"
                value={form.legalName}
                onChange={(v) => update("legalName", v)}
              />

              <SelectField
                label="Business type"
                value={form.companyType}
                onChange={(v) =>
                  update("companyType", v as CompanyType)
                }
                options={[
                  ["supplier", "Supplier"],
                  ["producer", "Producer"],
                  ["producer_supplier", "Producer & Supplier"],
                ]}
              />

              <SelectField
                label="Country"
                required
                value={form.countryCode}
                onChange={(v) => update("countryCode", v)}
                options={COUNTRIES.map((country) => [
                  country.code,
                  country.name,
                ])}
              />

              <Field
                label="Business phone"
                required
                value={form.businessPhone}
                onChange={(v) => update("businessPhone", v)}
              />

              <Field
                label="WhatsApp"
                value={form.whatsapp}
                onChange={(v) => update("whatsapp", v)}
              />

              <Field
                label="Business email"
                type="email"
                value={form.businessEmail}
                onChange={(v) => update("businessEmail", v)}
              />

              <Field
                label="Website"
                type="text"
                placeholder="https://example.com"
                value={form.website}
                onChange={(v) => update("website", v)}
              />

              <Field
                label="Registration / company number"
                value={form.registrationNumber}
                onChange={(v) => update("registrationNumber", v)}
              />

              <Field
                label="Tax / VAT number"
                value={form.taxNumber}
                onChange={(v) => update("taxNumber", v)}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h3 className="text-xl font-bold text-slate-950">
              Business address
            </h3>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Address line 1"
                value={form.addressLine1}
                onChange={(v) => update("addressLine1", v)}
              />

              <Field
                label="Address line 2"
                value={form.addressLine2}
                onChange={(v) => update("addressLine2", v)}
              />

              <Field
                label="City"
                value={form.city}
                onChange={(v) => update("city", v)}
              />

              <Field
                label="State / Region"
                value={form.stateRegion}
                onChange={(v) => update("stateRegion", v)}
              />

              <Field
                label="Postal code"
                value={form.postalCode}
                onChange={(v) => update("postalCode", v)}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h3 className="text-xl font-bold text-slate-950">
              Responsible person
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              The approved supplier account owner is the primary responsible contact.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                value={responsibleName}
                onChange={setResponsibleName}
                disabled
              />

              <Field
                label="Email"
                value={responsibleEmail}
                onChange={setResponsibleEmail}
                disabled
              />

              <Field
                label="Position / Job title"
                value={form.jobTitle}
                onChange={(v) => update("jobTitle", v)}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <label className="mb-2 block text-sm font-semibold text-[#16294F]">
              Business description
            </label>

            <textarea
              rows={5}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Describe your company, products, production or supply capabilities..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#1769e0] focus:ring-4 focus:ring-[#1769e0]/10"
            />
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              Company profile completed successfully.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-[#1769e0] px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#125bc4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving company profile..." : "Save company profile"}
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#16294F]">
        {label}{required ? " *" : ""}
      </label>

      <input
        required={required}
        disabled={disabled}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-[#1769e0] focus:ring-4 focus:ring-[#1769e0]/10 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#16294F]">
        {label}{required ? " *" : ""}
      </label>

      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#1769e0] focus:ring-4 focus:ring-[#1769e0]/10"
      >
        <option value="">Select...</option>

        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
