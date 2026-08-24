"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import CountrySelector from "@/components/ui/CountrySelector";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SellerApplyPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          phone: form.get("phone"),
          country: selectedCountry?.code || null,
          city: form.get("city"),
          role: "seller",
          sellingMethod: form.get("sellingMethod"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application.");
      }

      alert("Your application has been sent to the admin for review.");
      router.push("/apply/success");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8">
        <div className="flex justify-center mb-6"><VelionLogo className="w-28 h-28" /></div>
        <h2 className="text-xl font-semibold text-light-text text-center mb-1">Seller Application</h2>
        <p className="text-center text-light-muted text-sm mb-6">Tell us a bit about yourself.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-xs font-medium text-light-muted">Full Name</label><input name="fullName" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          <div><label className="text-xs font-medium text-light-muted">Email</label><input type="email" name="email" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          <div><label className="text-xs font-medium text-light-muted">Phone Number</label><input type="tel" name="phone" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          <div><label className="text-xs font-medium text-light-muted">Country</label><CountrySelector selectedCountry={selectedCountry?.code} onSelect={setSelectedCountry} /></div>
          <div><label className="text-xs font-medium text-light-muted">City</label><input name="city" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg" /></div>
          <div>
            <label className="text-xs font-medium text-light-muted">Password</label>
            <div className="relative"><input type={showPassword ? "text" : "password"} name="password" required className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted"> {showPassword ? "👁" : "👁‍🗨"}</button></div>
          </div>
          <div><label className="text-xs font-medium text-light-muted">How do you intend to sell?</label><select name="sellingMethod" className="w-full px-4 py-2 bg-secondary/50 border border-light-border rounded-lg"><option>Online</option><option>Social media</option><option>Physical store</option><option>Other</option></select></div>
          <button disabled={loading} type="submit" className="w-full py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 disabled:opacity-50">Submit Application</button>
        </form>
      </div>
    </div>
  );
}
