"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import Link from "next/link";
import CountrySelector from "@/components/ui/CountrySelector";
import { loginWithPhone } from "@/app/register/actions";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const { showToast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await loginWithPhone(formData);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send code.");
      setLoading(false);
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

        <div>
          {!otpSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" disabled={loading} className="w-full justify-center mt-2 bg-primary text-white hover:bg-primary/90 rounded-full">Send Code via SMS</Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-light-muted text-sm">We sent a code to <span className="font-medium text-light-text">{selectedCountry?.dial_code} {otpSent}</span></p>
              <Link href="/verify-phone">
                <Button className="w-full justify-center bg-primary text-white hover:bg-primary/90 rounded-full">Enter Code</Button>
              </Link>
              <button type="button" onClick={() => setOtpSent(false)} className="w-full text-center text-xs text-primary mt-3 hover:underline">Resend code</button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-light-muted">
          Don't have an account? <Link href="/register" className="text-primary font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
