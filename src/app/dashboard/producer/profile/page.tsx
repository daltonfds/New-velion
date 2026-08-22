"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CountrySelector from "@/components/ui/CountrySelector";
import VelionLogo from "@/components/ui/VelionLogo";
export default function ProducerProfilePage() {
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) {
        setFullName(data.full_name || "");
        setCountry(data.country || "");
        setCity(data.city || "");
      }
    };
    load();
  }, []);
  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("profiles").update({ full_name: fullName, country, city }).eq("id", session.user.id);
    alert("Profile updated!");
  };
  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Producer Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-light-border">
            <h3 className="font-semibold mb-4">Personal Data</h3>
            <p className="text-xs text-light-muted">Full Name</p><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border rounded-lg mb-3" />
            <p className="text-xs text-light-muted">Country</p><CountrySelector selectedCountry={country} onSelect={(c) => setCountry(c.code)} />
            <p className="text-xs text-light-muted mt-3">City</p><input value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-3 border rounded-lg" />
          </div>
          <div className="bg-white p-6 rounded-xl border border-light-border">
            <h3 className="font-semibold mb-4">Business & Payments</h3>
            <p className="text-xs text-light-muted">Business Name</p><input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full p-3 border rounded-lg mb-3" />
            <p className="text-xs text-light-muted">Payment Method</p><select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-3 border rounded-lg mb-3"><option>Bank Transfer</option><option>M-Pesa</option><option>Emola</option></select>
            <p className="text-xs text-light-muted">Bank Name</p><input value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full p-3 border rounded-lg mb-3" />
            <p className="text-xs text-light-muted">Account Number</p><input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full p-3 border rounded-lg mb-3" />
            <p className="text-xs text-light-muted">Account Name</p><input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full p-3 border rounded-lg" />
          </div>
        </div>
        <button onClick={handleSave} className="mt-6 px-6 py-3 bg-primary text-white rounded-full">Save Profile</button>
      </div>
    </div>
  );
}
