"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import PhoneFields from "@/components/auth/PhoneFields";
import { composeE164, getCountry } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

export default function SupplierRegisterPage() {
  const router = useRouter();
  const [form,setForm]=useState({fullName:"",companyName:"",country:"",callingCode:"",phone:"",whatsapp:"",email:"",password:"",confirm:""});
  const [loading,setLoading]=useState(false); const [error,setError]=useState("");

  async function submit(event:FormEvent){event.preventDefault();setError("");
    if(form.password!==form.confirm)return setError("Passwords do not match.");
    if(form.password.length<6)return setError("Password must contain at least 6 characters.");
    if(!form.country||!form.phone)return setError("Country and phone are required.");
    setLoading(true);
    const country=getCountry(form.country);
    const {data,error:signupError}=await supabase.auth.signUp({email:form.email.trim(),password:form.password,options:{data:{
      full_name:form.fullName.trim(),country_code:form.country,country_name:country?.name||"",country_calling_code:form.callingCode,
      phone_number:form.phone,phone_e164:composeE164(form.callingCode,form.phone),whatsapp_number:form.whatsapp,
      whatsapp_e164:form.whatsapp?composeE164(form.callingCode,form.whatsapp):"",preferred_language:"en",role:"supplier",
      supplier_company_name:form.companyName.trim()
    }}});
    setLoading(false);
    if(signupError){setError(signupError.message);return;}
    router.push("/verify-email?email="+encodeURIComponent(data.user?.email||form.email.trim()));
  }

  return <main className="min-h-screen bg-white px-5 py-10"><div className="mx-auto w-full max-w-xl"><div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_20px_60px_rgba(37,99,235,0.08)] sm:p-8">
    <div className="mb-8 flex justify-center border-b border-slate-100 pb-7"><NewvelionBrand size="md"/></div>
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Supplier / Producer</p>
    <h1 className="mt-2 text-3xl font-bold text-[#16294F]">Create your supplier account</h1>
    <p className="mt-2 text-slate-500">List your products, manage inventory and fulfill orders through NewVelion.</p>
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block text-sm font-semibold text-[#16294F]">Full name<input required value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5"/></label>
      <label className="block text-sm font-semibold text-[#16294F]">Company name<input required value={form.companyName} onChange={e=>setForm({...form,companyName:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5"/></label>
      <PhoneFields countryCode={form.country} phone={form.phone} whatsapp={form.whatsapp} language="en" onCountryChange={(country,callingCode)=>setForm({...form,country,callingCode})} onPhoneChange={phone=>setForm({...form,phone})} onWhatsappChange={whatsapp=>setForm({...form,whatsapp})} onLanguageChange={()=>{}}/>
      <label className="block text-sm font-semibold text-[#16294F]">Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5"/></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#16294F]">Password<input required minLength={6} type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5"/></label><label className="text-sm font-semibold text-[#16294F]">Confirm password<input required minLength={6} type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5"/></label></div>
      {error&&<div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <button disabled={loading} className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white disabled:opacity-60">{loading?"Creating account...":"Create supplier account"}</button>
    </form>
    <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-blue-600">Sign in</Link></p>
  </div></div></main>;
}
