"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supplierFetch } from "@/lib/supplier-client";

export default function SupplierProfilePage() {
  const [form, setForm] = useState({ company_name:"", legal_name:"", business_type:"supplier", country_name:"", country_code:"", business_phone:"", whatsapp:"", business_email:"", website:"", registration_number:"", tax_number:"", responsible_name:"", responsible_title:"", description:"" });
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { supplierFetch<{data: typeof form & {approval_status:string} | null}>("/api/supplier/profile").then((r) => { if (r.data) { setForm((current) => ({ ...current, ...r.data })); setStatus(r.data.approval_status); } }).catch((e) => setMessage(e instanceof Error ? e.message : "Failed to load profile.")); }, []);

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try { const r = await supplierFetch<{data: typeof form & {approval_status:string}>}("/api/supplier/profile", { method:"PUT", body:JSON.stringify(form) }); setStatus(r.data.approval_status); setMessage("Supplier profile saved. Your application remains subject to admin approval."); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Could not save profile."); }
    finally { setSaving(false); }
  }

  const fields: Array<[keyof typeof form,string]> = [["company_name","Company name"],["legal_name","Legal name"],["responsible_name","Responsible person"],["responsible_title","Job title"],["country_name","Country"],["country_code","Country code"],["business_phone","Business phone"],["whatsapp","WhatsApp"],["business_email","Business email"],["website","Website"],["registration_number","Registration number"],["tax_number","Tax number"]];

  return <AppShell area="supplier"><div className="mx-auto max-w-4xl space-y-6"><div><h1 className="text-2xl font-bold text-[#16294F]">Supplier profile</h1><p className="mt-1 text-sm text-slate-500">Complete your business information for review and marketplace operations.</p></div><div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">Application status: <strong>{status}</strong></div>{message && <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">{message}</div>}<form onSubmit={save} className="space-y-5"><Card><div className="grid gap-4 p-6 sm:grid-cols-2">{fields.map(([key,label])=><label key={key} className="text-sm font-medium text-slate-700">{label}<input value={String(form[key] ?? "")} onChange={(e)=>setForm((c)=>({...c,[key]:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500" /></label>)}<label className="sm:col-span-2 text-sm font-medium text-slate-700">Description<textarea value={form.description} onChange={(e)=>setForm((c)=>({...c,description:e.target.value}))} rows={5} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"/></label></div></Card><div className="flex justify-end"><button disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save profile"}</button></div></form></div></AppShell>;
}
