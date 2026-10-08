"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

export default function PersonalProfilePage() {
  const [firstName,setFirstName]=useState("");
  const [lastName,setLastName]=useState("");
  const [email,setEmail]=useState("");
  const [phone,setPhone]=useState("");
  const [country,setCountry]=useState("");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{(async()=>{
    const user=await getCurrentUser();
    if(!user){setError("You must be signed in.");setLoading(false);return}
    setEmail(user.email??"");
    const {data,error}=await supabase.from("profiles")
      .select("full_name,country,country_code,phone_number,phone_e164")
      .eq("id",user.id).single();
    if(error){setError(error.message);setLoading(false);return}
    const parts=String(data.full_name??"").trim().split(/\s+/).filter(Boolean);
    setFirstName(parts.shift()??"");
    setLastName(parts.join(" "));
    setCountry(String(data.country_code??data.country??""));
    setPhone(String(data.phone_number??data.phone_e164??""));
    setLoading(false);
  })()},[]);

  async function save(e:React.FormEvent){
    e.preventDefault();setSaving(true);setError("");setMessage("");
    const user=await getCurrentUser();
    if(!user){setError("You must be signed in.");setSaving(false);return}
    const fullName=[firstName.trim(),lastName.trim()].filter(Boolean).join(" ");
    if(!fullName){setError("Enter your name.");setSaving(false);return}
    const cc=country.trim().toUpperCase();
    const pais=["ZA","AO","MZ"].includes(cc)?cc:null;
    const {error}=await supabase.from("profiles").update({
      full_name:fullName,
      nome_completo:fullName,
      country:cc||null,
      country_code:cc||null,
      pais,
      phone_number:phone.trim()||null,
      phone_e164:phone.trim()||null,
      telefone:phone.trim()||null,
      updated_at:new Date().toISOString()
    }).eq("id",user.id);
    if(error){
      setError(error.message);
      notify.error("Falha ao salvar perfil", error.message);
      setSaving(false);
      return;
    }

    if(email.trim()!==String(user.email??"")){
      const {error:emailError}=await supabase.auth.updateUser({email:email.trim()});

      if(emailError){
        setError(emailError.message);
        notify.error("Falha ao alterar email", emailError.message);
        setSaving(false);
        return;
      }

      setMessage("Profile saved. Confirm the new email from your inbox.");

      notify.success(
        "Perfil atualizado",
        "Os dados foram salvos. Confirme o novo email na sua caixa de entrada."
      );
    }else{
      setMessage("Profile saved successfully.");

      notify.success(
        "Perfil atualizado",
        "As suas informações foram salvas com sucesso."
      );
    }
    setSaving(false);
  }

  return <AppShell area="seller" title="Personal Profile" subtitle="Manage your personal information.">
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/dashboard/profile" className="text-sm text-slate-500 hover:text-blue-600">← Account</Link>
      <div><h2 className="mt-3 text-2xl font-bold text-[#16294F]">Personal information</h2><p className="mt-1 text-sm text-slate-500">Changes are saved directly to your Newvelion account.</p></div>
      {error&&<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-5"><h3 className="font-semibold text-slate-900">Profile details</h3></div>
        {loading?<div className="p-6 text-sm text-slate-500">Loading profile...</div>:<>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">First name<input value={firstName} onChange={e=>setFirstName(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#16294F]"/></label>
            <label className="text-sm font-medium text-slate-700">Last name<input value={lastName} onChange={e=>setLastName(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#16294F]"/></label>
            <label className="text-sm font-medium text-slate-700">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#16294F]"/></label>
            <label className="text-sm font-medium text-slate-700">Phone<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#16294F]"/></label>
            <label className="text-sm font-medium text-slate-700 md:col-span-2">Country
              <select value={country} onChange={e=>setCountry(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-[#16294F]">
                <option value="">Select country</option><option value="ZA">South Africa</option><option value="AO">Angola</option><option value="MZ">Mozambique</option><option value="FR">France</option><option value="PT">Portugal</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end border-t border-slate-100 px-6 py-4">
            <button disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving?"Saving...":"Save changes"}</button>
          </div>
        </>}
      </form>
    </div>
  </AppShell>
}
