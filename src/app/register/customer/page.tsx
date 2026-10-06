"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import PhoneFields from "@/components/auth/PhoneFields";
import { composeE164, getCountry } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({fullName:"",country:"ZA",callingCode:"+27",phone:"",whatsapp:"",language:"en" as "en"|"pt",email:"",password:"",confirm:""});
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    if(form.password!==form.confirm) return setError("Passwords do not match.");
    if(form.password.length<6) return setError("Password must contain at least 6 characters.");
    if(!form.phone.trim()) return setError("Phone number is required.");
    setLoading(true);
    const country=getCountry(form.country);
    const {data,error}=await supabase.auth.signUp({
      email:form.email.trim(), password:form.password,
      options:{data:{
        full_name:form.fullName.trim(), country_code:form.country, country_name:country?.name||"",
        country_calling_code:form.callingCode, phone_number:form.phone.trim(),
        phone_e164:composeE164(form.callingCode,form.phone), whatsapp_number:form.whatsapp.trim(),
        whatsapp_e164:form.whatsapp?composeE164(form.callingCode,form.whatsapp):"", preferred_language:form.language,
        role:"customer"
      }}
    });
    setLoading(false);
    if(error) return setError(error.message);
    router.push("/verify-email?email="+encodeURIComponent(data.user?.email||form.email.trim()));
  }

  return <main className="min-h-screen bg-white px-5 py-10">
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-[0_20px_60px_rgba(37,99,235,0.08)] sm:p-8">
        <div className="mb-8 flex justify-center border-b border-slate-100 pb-7"><NewvelionBrand size="md"/></div>
        <h1 className="text-3xl font-extrabold text-[#16294F]">Create your Newvelion account</h1>
        <p className="mt-2 text-slate-500">Shop products, track orders and manage your purchases.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <input required placeholder="Full name" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500"/>
          <PhoneFields allowedCountries={["ZA","AO"]} countryCode={form.country} phone={form.phone} whatsapp={form.whatsapp} language={form.language}
            onCountryChange={(country,callingCode)=>setForm({...form,country,callingCode})}
            onPhoneChange={phone=>setForm({...form,phone})}
            onWhatsappChange={whatsapp=>setForm({...form,whatsapp})}
            onLanguageChange={language=>setForm({...form,language})}/>
          <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500"/>
          <div className="grid gap-4 sm:grid-cols-2">
            <input required minLength={6} type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500"/>
            <input required minLength={6} type="password" placeholder="Confirm password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-500"/>
          </div>
          {error&&<div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <button disabled={loading} className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white disabled:opacity-60">{loading?"Creating account...":"Create account"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-bold text-blue-600">Sign in</Link></p>
      </div>
    </div>
  </main>;
}
