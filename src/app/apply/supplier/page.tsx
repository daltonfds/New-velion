"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import CountrySelector from "@/components/ui/CountrySelector";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SupplierApplyPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const addCategory = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      if (target.value.trim()) {
        setCategories([...categories, target.value.trim()]);
        target.value = "";
      }
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert("Your application has been sent to the admin for review.");
      router.push("/");
      setLoading(false);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8">
        <div className="flex justify-center mb-6"><VelionLogo className="w-28 h-28" /></div>
        <h2 className="text-xl font-semibold text-light-text text-center mb-1">Supplier Application</h2>
        <p className="text-center text-light-muted text-sm mb-6">Tell us about your supply capabilities.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-sm font-bold text-light-text border-b pb-2">Personal Data</h3>
          <div><label className="text-xs font-medium text-light-muted">Full Name</label><input name="fullName" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          <div><label className="text-xs font-medium text-light-muted">Email</label><input type="email" name="email" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          <div><label className="text-xs font-medium text-light-muted">Phone Number</label><input type="tel" name="phone" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          <div><label className="text-xs font-medium text-light-muted">Country</label><CountrySelector selectedCountry={selectedCountry?.code} onSelect={setSelectedCountry} /></div>
          <div><label className="text-xs font-medium text-light-muted">City</label><input name="city" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          <div><label className="text-xs font-medium text-light-muted">Address</label><input name="address" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          <div><label className="text-xs font-medium text-light-muted">Password</label><div className="relative"><input type={showPassword ? "text" : "password"} name="password" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted">{showPassword ? "👁" : "👁‍🗨"}</button></div></div>
          
          <h3 className="text-sm font-bold text-light-text border-b pb-2 mt-4">Business Data</h3>
          <div><label className="text-xs font-medium text-light-muted">Company Name</label><input name="businessName" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          <div><label className="text-xs font-medium text-light-muted">Type of Supplier</label><select name="supplierType" className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg"><option>Manufacturer</option><option>Wholesaler</option><option>Distributor</option><option>Importer</option><option>Other</option></select></div>
          <div><label className="text-xs font-medium text-light-muted">Registration Number (if applicable)</label><input name="registrationNumber" className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          <div><label className="text-xs font-medium text-light-muted">Website</label><input type="url" name="website" className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          
          <h3 className="text-sm font-bold text-light-text border-b pb-2 mt-4">Supply</h3>
          <div><label className="text-xs font-medium text-light-muted">What products do you supply?</label><textarea name="supplyDescription" className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg h-20" required /></div>
          <div><label className="text-xs font-medium text-light-muted">Supply Categories (Press Enter to add)</label><div className="flex flex-wrap gap-2 p-2 border border-light-border rounded-lg bg-secondary/50"><input type="text" placeholder="e.g. Electronics" onKeyDown={addCategory} className="flex-1 bg-transparent outline-none text-sm" />{categories.map(c => <span key={c} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{c}</span>)}</div></div>
          <div><label className="text-xs font-medium text-light-muted">Supply Capacity</label><select name="supplyCapacity" className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg"><option>Small (1-100 units/month)</option><option>Medium (101-1000 units/month)</option><option>Large (1000+ units/month)</option></select></div>
          <button disabled={loading} type="submit" className="w-full py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 disabled:opacity-50">Submit Application</button>
        </form>
      </div>
    </div>
  );
}
