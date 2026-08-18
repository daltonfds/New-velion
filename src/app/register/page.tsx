"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import Link from "next/link";
import CountrySelector from "@/components/ui/CountrySelector";
import { signupWithPhone } from "./actions";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<"seller" | "producer">("seller");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signupWithPhone(formData);
    } catch (e: any) {
      setError(e.message || "Failed to create account");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8">
        <div className="flex justify-center mb-6"><VelionLogo className="w-28 h-28" /></div>
        <h2 className="text-xl font-semibold text-light-text text-center mb-1">Create your account</h2>
        <p className="text-center text-light-muted text-sm mb-6">Start your climb with Velion.</p>
        <form action={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">Full Name</label>
            <input type="text" name="fullName" placeholder="John Doe" className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text" required />
          </div>

          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">Select Country (Auto-sync DDD)</label>
            <CountrySelector 
              selectedCountry={selectedCountry?.code} 
              onSelect={setSelectedCountry} 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">Phone Number</label>
            <div className="flex gap-2">
              <div className="px-3 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text font-medium whitespace-nowrap">
                {selectedCountry ? selectedCountry.dial_code : "+00"}
              </div>
              <input 
                type="tel" 
                name="phone" 
                placeholder="84 000 0000" 
                className="flex-1 w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text pr-10" 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted hover:text-light-text"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="••••••••" 
                className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text pr-10" 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted hover:text-light-text"
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">I am a:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-light-text">
                <input type="radio" name="role" value="seller" checked={role === "seller"} onChange={() => setRole("seller")} className="accent-primary" />
                Seller
              </label>
              <label className="flex items-center gap-2 text-sm text-light-text">
                <input type="radio" name="role" value="producer" checked={role === "producer"} onChange={() => setRole("producer")} className="accent-primary" />
                Producer / Supplier
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-rose-600 text-center bg-rose-50 p-2 rounded-lg">{error}</p>}
          
          <Button type="submit" disabled={loading} className="w-full justify-center mt-2 bg-primary text-white hover:bg-primary/90 rounded-full">Create Account</Button>
        </form>
        <div className="mt-6 text-center text-xs text-light-muted">Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign In</Link></div>
      </div>
    </div>
  );
}
