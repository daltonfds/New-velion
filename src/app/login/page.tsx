"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";
import CountrySelector from "@/components/ui/CountrySelector";
import { loginWithEmail, loginWithPhone } from "@/app/register/actions";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [loginType, setLoginType] = useState<"email" | "phone">("email");
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await loginWithEmail(formData);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    }
  }

  async function handlePhoneSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await loginWithPhone(formData);
    } catch (err: any) {
      setError(err.message || "Failed to send code.");
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8">
        <div className="flex justify-center mb-6">
          <VelionLogo className="w-28 h-28" />
        </div>
        <h2 className="text-xl font-semibold text-light-text text-center mb-1">Sign In</h2>
        <p className="text-center text-light-muted text-sm mb-6">Enter your Velion account.</p>

        <div className="flex gap-2 mb-6 bg-secondary/50 p-1 rounded-lg">
          <button onClick={() => setLoginType("email")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginType === "email" ? "bg-white shadow-sm text-light-text" : "text-light-muted hover:text-light-text"}`}>Email</button>
          <button onClick={() => setLoginType("phone")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginType === "phone" ? "bg-white shadow-sm text-light-text" : "text-light-muted hover:text-light-text"}`}>Phone</button>
        </div>

        {loginType === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-light-muted mb-1">Email</label>
              <input type="email" name="email" placeholder="you@example.com" className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-light-muted mb-1">Password</label>
              <input type="password" name="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text" required />
            </div>
            {error && <p className="text-sm text-rose-600 text-center bg-rose-50 p-2 rounded-lg">{error}</p>}
            <button type="submit" className="w-full justify-center mt-2 bg-primary text-white hover:bg-primary/90 rounded-full py-3 font-medium">Sign In</button>
          </form>
        )}

        {loginType === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
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
            {error && <p className="text-sm text-rose-600 text-center bg-rose-50 p-2 rounded-lg">{error}</p>}
            <button type="submit" className="w-full justify-center mt-2 bg-primary text-white hover:bg-primary/90 rounded-full py-3 font-medium">Send Code</button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-light-muted">
          Don't have an account? <Link href="/register" className="text-primary font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
