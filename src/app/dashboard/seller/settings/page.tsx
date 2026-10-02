"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { COUNTRIES } from "@/lib/countries";

type Method = "bank_transfer"|"mpesa"|"emola";
type Details = Record<string,string>;
type KycDocumentType = "national_id" | "drivers_license" | "voter_card" | "passport";

const emptyDetails:Record<Method,Details>={
  bank_transfer:{bank:"",account_number:"",branch_code:"",nib:"",holder_name:""},
  mpesa:{phone:"",holder_name:""},
  emola:{phone:"",holder_name:""}
};

export default function SellerSettingsPage(){
  const [country,setCountry]=useState("");
  const [methods,setMethods]=useState<Record<Method,boolean>>({bank_transfer:false,mpesa:false,emola:false});
  const [details,setDetails]=useState(emptyDetails);
  const [emailNotifications,setEmailNotifications]=useState(true);
  const [salesNotifications,setSalesNotifications]=useState(true);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [kycStatus,setKycStatus]=useState("not_started");
  const [kycCountry,setKycCountry]=useState("");
  const [documentType,setDocumentType]=useState<KycDocumentType>("national_id");
  const [documentFront,setDocumentFront]=useState<File|null>(null);
  const [documentBack,setDocumentBack]=useState<File|null>(null);
  const [selfie,setSelfie]=useState<File|null>(null);
  const [kycLoading,setKycLoading]=useState(true);
  const [kycSubmitting,setKycSubmitting]=useState(false);
  const [kycMessage,setKycMessage]=useState("");
  const [kycError,setKycError]=useState("");
  const [kycRejectionReason,setKycRejectionReason]=useState("");

  useEffect(()=>{(async()=>{
    const user=await getCurrentUser();
    if(!user){setError("You must be signed in.");setLoading(false);return}
    const [profile,settings,kyc]=await Promise.all([
      supabase.from("profiles").select("country_code,pais,full_name,nome_completo").eq("id",user.id).single(),
      supabase.from("account_settings").select("*").eq("user_id",user.id).maybeSingle(),
      supabase.from("seller_kyc_submissions").select("status,country_code,document_type,rejection_reason").eq("seller_id",user.id).order("submitted_at",{ascending:false}).limit(1).maybeSingle()
    ]);
    if(profile.error){setError(profile.error.message);setLoading(false);return}
    const cc=String(profile.data?.country_code??profile.data?.pais??"").toUpperCase();
    setCountry(cc);
    if(settings.error){setError(settings.error.message);setLoading(false);return}
    if(settings.data){
      setEmailNotifications(settings.data.email_notifications??true);
      setSalesNotifications(settings.data.sales_notifications??true);
      const saved=settings.data.payout_methods??{};
      const next={...emptyDetails} as Record<Method,Details>;
      const enabled={bank_transfer:false,mpesa:false,emola:false};
      for(const m of ["bank_transfer","mpesa","emola"] as Method[]){
        if(saved[m]){enabled[m]=saved[m].enabled===true;next[m]={...next[m],...saved[m]}}
      }
      setMethods(enabled);setDetails(next);
    }

    if (kyc.error) {
      setKycError(kyc.error.message);
    } else if (kyc.data) {
      setKycStatus(kyc.data.status ?? "not_started");
      setKycCountry(kyc.data.country_code ?? cc);
      setDocumentType(kyc.data.document_type ?? "national_id");
      setKycRejectionReason(kyc.data.rejection_reason ?? "");
    } else {
      setKycStatus("not_started");
      setKycCountry(cc);
    }
    setKycLoading(false);
    setLoading(false);
  })()},[]);

  const setDetail=(m:Method,k:string,v:string)=>setDetails(d=>({...d,[m]:{...d[m],[k]:v}}));

  async function save(){
    setSaving(true);setError("");setMessage("");
    const user=await getCurrentUser();
    if(!user){setError("You must be signed in.");setSaving(false);return}
    const payoutMethods:Record<string,unknown>={};
    for(const m of ["bank_transfer","mpesa","emola"] as Method[]){
      if(methods[m]) payoutMethods[m]={enabled:true,...details[m]};
    }
    const {error}=await supabase.from("account_settings").upsert({
      user_id:user.id,
      email_notifications:emailNotifications,
      sales_notifications:salesNotifications,
      payout_methods:payoutMethods,
      updated_at:new Date().toISOString()
    },{onConflict:"user_id"});
    if(error){setError(error.message);setSaving(false);return}
    setMessage("Settings saved successfully.");
    setSaving(false);
  }


  async function submitKyc(){
    setKycError("");
    setKycMessage("");

    const user=await getCurrentUser();
    if(!user){
      setKycError("You must be signed in.");
      return;
    }

    const selectedCountry=(kycCountry || country).toUpperCase();

    if(!selectedCountry){
      setKycError("Select your country before submitting KYC.");
      return;
    }

    if(!documentFront || !documentBack || !selfie){
      setKycError("Upload the front, back, and holding-selfie photos before submitting.");
      return;
    }

    if(kycStatus==="approved"){
      setKycError("Your KYC is already approved.");
      return;
    }

    if(kycStatus==="pending"){
      setKycError("Your KYC submission is already under review.");
      return;
    }

    setKycSubmitting(true);

    try{
      const files=[
        ["front",documentFront],
        ["back",documentBack],
        ["selfie",selfie],
      ] as const;

      const paths:Record<string,string>={};

      for(const [kind,file] of files){
        const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
        const path=`${user.id}/${crypto.randomUUID()}-${kind}.${ext}`;

        const {error}=await supabase.storage
          .from("seller-kyc")
          .upload(path,file,{
            contentType:file.type || "application/octet-stream",
            upsert:false,
          });

        if(error) throw error;
        paths[kind]=path;
      }

      const {error}=await supabase.rpc("submit_seller_kyc",{
        p_seller_id:user.id,
        p_country_code:selectedCountry,
        p_document_type:documentType,
        p_document_front_path:paths.front,
        p_document_back_path:paths.back,
        p_selfie_path:paths.selfie,
      });

      if(error) throw error;

      setCountry(selectedCountry);
      setKycCountry(selectedCountry);
      setKycStatus("pending");
      setKycRejectionReason("");
      setKycMessage("KYC submitted successfully. Your documents are now under review.");
      setDocumentFront(null);
      setDocumentBack(null);
      setSelfie(null);
    }catch(e){
      setKycError(e instanceof Error ? e.message : "Unable to submit KYC.");
    }finally{
      setKycSubmitting(false);
    }
  }

  const showMZ=country==="MZ";
  return <AppShell area="seller" title="Settings" subtitle="Manage your account and payout preferences.">
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/dashboard/profile" className="text-sm text-slate-500 hover:text-blue-600">← Account</Link>
      <div><h2 className="mt-3 text-2xl font-bold text-[#16294F]">Settings</h2><p className="mt-1 text-sm text-slate-500">Payout methods and account preferences are stored securely in NewVelion.</p></div>
      {error&&<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {loading?<div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading settings...</div>:<>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Identity verification (KYC)</h3>
                <p className="mt-1 text-sm text-slate-500">
                  KYC verification is required before you can withdraw your earnings.
                </p>
              </div>
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                kycStatus==="approved"
                  ? "bg-emerald-50 text-emerald-700"
                  : kycStatus==="pending"
                    ? "bg-amber-50 text-amber-700"
                    : kycStatus==="rejected"
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-600"
              }`}>
                {kycStatus==="approved" ? "Approved" : kycStatus==="pending" ? "Under review" : kycStatus==="rejected" ? "Rejected" : "Not submitted"}
              </span>
            </div>
          </div>

          <div className="space-y-5 p-6">
            {kycError&&<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{kycError}</div>}
            {kycMessage&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{kycMessage}</div>}

            {kycStatus==="rejected"&&kycRejectionReason&&(
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-800">Reason for rejection</p>
                <p className="mt-1 text-sm text-red-700">{kycRejectionReason}</p>
              </div>
            )}

            {kycStatus!=="approved"&&(
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Country</label>
                    <select
                      value={kycCountry}
                      onChange={e=>setKycCountry(e.target.value)}
                      disabled={Boolean(country)}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      <option value="">Select your country</option>
                      {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {country ? "Your country is already saved in your account." : "Your country will be saved to your account when you submit KYC."}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Identity document</label>
                    <select
                      value={documentType}
                      onChange={e=>setDocumentType(e.target.value as KycDocumentType)}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    >
                      <option value="national_id">National ID (BI)</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="voter_card">Voter's Card</option>
                      <option value="passport">Passport</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                    <span className="block text-sm font-semibold text-slate-800">Front of document</span>
                    <span className="mt-1 block text-xs text-slate-500">JPG, PNG, WEBP or PDF</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={e=>setDocumentFront(e.target.files?.[0]||null)}
                      className="mt-3 block w-full text-xs text-slate-500"
                    />
                    {documentFront&&<span className="mt-2 block truncate text-xs text-slate-700">{documentFront.name}</span>}
                  </label>

                  <label className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                    <span className="block text-sm font-semibold text-slate-800">Back of document</span>
                    <span className="mt-1 block text-xs text-slate-500">JPG, PNG, WEBP or PDF</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={e=>setDocumentBack(e.target.files?.[0]||null)}
                      className="mt-3 block w-full text-xs text-slate-500"
                    />
                    {documentBack&&<span className="mt-2 block truncate text-xs text-slate-700">{documentBack.name}</span>}
                  </label>

                  <label className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                    <span className="block text-sm font-semibold text-slate-800">Photo holding the document</span>
                    <span className="mt-1 block text-xs text-slate-500">Clear face + document photo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={e=>setSelfie(e.target.files?.[0]||null)}
                      className="mt-3 block w-full text-xs text-slate-500"
                    />
                    {selfie&&<span className="mt-2 block truncate text-xs text-slate-700">{selfie.name}</span>}
                  </label>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                  Accepted documents: National ID (BI), Driver's License, Voter's Card, or Passport.
                  Make sure all details are readable and the photo holding the document clearly shows your face and the document.
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={submitKyc}
                    disabled={kycSubmitting||kycLoading}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {kycSubmitting ? "Submitting KYC..." : "Submit KYC"}
                  </button>
                </div>
              </>
            )}

            {kycStatus==="approved"&&(
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                Your identity has been verified. You can now request withdrawals using your configured payout method.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-5"><h3 className="font-semibold text-slate-900">Payout methods</h3><p className="mt-1 text-sm text-slate-500">Configure your payout account here. Withdrawals will only show configured methods.</p></div>
          <div className="space-y-5 p-6">
            <label className="flex items-center gap-3"><input type="checkbox" checked={methods.bank_transfer} onChange={e=>setMethods(m=>({...m,bank_transfer:e.target.checked}))}/><span className="font-medium">Bank Transfer</span></label>
            {methods.bank_transfer&&<div className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-2">
              <input placeholder="Bank name" value={details.bank_transfer.bank} onChange={e=>setDetail("bank_transfer","bank",e.target.value)} className="rounded-lg border px-3 py-2.5"/>
              <input placeholder="Account number" value={details.bank_transfer.account_number} onChange={e=>setDetail("bank_transfer","account_number",e.target.value)} className="rounded-lg border px-3 py-2.5"/>
              <input placeholder="Branch code" value={details.bank_transfer.branch_code} onChange={e=>setDetail("bank_transfer","branch_code",e.target.value)} className="rounded-lg border px-3 py-2.5"/>
              {showMZ&&<input placeholder="NIB" value={details.bank_transfer.nib} onChange={e=>setDetail("bank_transfer","nib",e.target.value)} className="rounded-lg border px-3 py-2.5"/>}
              <input placeholder="Account holder name" value={details.bank_transfer.holder_name} onChange={e=>setDetail("bank_transfer","holder_name",e.target.value)} className="rounded-lg border px-3 py-2.5 md:col-span-2"/>
            </div>}
            {showMZ&&<>
              <label className="flex items-center gap-3"><input type="checkbox" checked={methods.mpesa} onChange={e=>setMethods(m=>({...m,mpesa:e.target.checked}))}/><span className="font-medium">M-Pesa</span></label>
              {methods.mpesa&&<div className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-2"><input placeholder="M-Pesa phone number" value={details.mpesa.phone} onChange={e=>setDetail("mpesa","phone",e.target.value)} className="rounded-lg border px-3 py-2.5"/><input placeholder="Account holder name" value={details.mpesa.holder_name} onChange={e=>setDetail("mpesa","holder_name",e.target.value)} className="rounded-lg border px-3 py-2.5"/></div>}
              <label className="flex items-center gap-3"><input type="checkbox" checked={methods.emola} onChange={e=>setMethods(m=>({...m,emola:e.target.checked}))}/><span className="font-medium">e-Mola</span></label>
              {methods.emola&&<div className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-2"><input placeholder="e-Mola phone number" value={details.emola.phone} onChange={e=>setDetail("emola","phone",e.target.value)} className="rounded-lg border px-3 py-2.5"/><input placeholder="Account holder name" value={details.emola.holder_name} onChange={e=>setDetail("emola","holder_name",e.target.value)} className="rounded-lg border px-3 py-2.5"/></div>}
            </>}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-5"><h3 className="font-semibold text-slate-900">Account preferences</h3></div>
          <div className="space-y-5 p-6">
            <label className="flex items-center justify-between"><span><b className="block text-sm">Email notifications</b><small className="text-slate-500">Important account and payout notifications.</small></span><input type="checkbox" checked={emailNotifications} onChange={e=>setEmailNotifications(e.target.checked)}/></label>
            <label className="flex items-center justify-between"><span><b className="block text-sm">Sales notifications</b><small className="text-slate-500">Notifications when affiliate sales are recorded.</small></span><input type="checkbox" checked={salesNotifications} onChange={e=>setSalesNotifications(e.target.checked)}/></label>
          </div>
        </section>
        <div className="flex justify-end"><button onClick={save} disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving?"Saving...":"Save settings"}</button></div>
      </>}
    </div>
  </AppShell>
}
