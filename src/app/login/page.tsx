"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import Link from "next/link";
import CountrySelector from "@/components/ui/CountrySelector";
import { loginWithEmail, loginWithGoogle, loginWithPhone, verifyOTP } from "./actions";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const { showToast } = useToast();
  const [loginType, setLoginType] = useState<"email" | "google" | "phone">("email");
  const [country, setCountry] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await loginWithEmail(formData);
    } catch (err: any) {
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!country) return showToast("Please select a country", "error");
    if (!phoneNumber) return showToast("Please enter your phone number", "error");

    setLoading(true);
    try {
      const fullPhone = country.dial_code + phoneNumber.replace(/\D/g, "");
      setOtpSent(true);
      const formData = new FormData();
      formData.append("phone", fullPhone);
      await loginWithPhone(formData);
      showToast(`OTP sent to ${fullPhone}`, "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleOTPSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const fullPhone = country.dial_code + phoneNumber.replace(/\D/g, "");
      formData.append("phone", fullPhone);
      await verifyOTP(formData);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-sm p-8">
        <div className="flex justify-center mb-6"><VelionLogo className="w-20 h-20" /></div>
        <h2 className="text-xl font-semibold text-dark text-center mb-1">Sign In</h2>
        <p className="text-center text-muted text-sm mb-6">Enter your Velion account.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-secondary/50 p-1 rounded-lg">
          <button onClick={() => setLoginType("email")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginType === "email" ? "bg-white shadow-sm text-dark" : "text-muted hover:text-dark"}`}>Email</button>
          <button onClick={() => setLoginType("google")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginType === "google" ? "bg-white shadow-sm text-dark" : "text-muted hover:text-dark"}`}>Google</button>
          <button onClick={() => setLoginType("phone")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginType === "phone" ? "bg-white shadow-sm text-dark" : "text-muted hover:text-dark"}`}>Phone</button>
        </div>

        {/* Email Form */}
        {loginType === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div><label className="block text-xs font-medium text-muted mb-1">Email</label><input type="email" name="email" placeholder="you@example.com" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark" required /></div>
            <div><label className="block text-xs font-medium text-muted mb-1">Password</label><input type="password" name="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark" required /></div>
            <Button type="submit" disabled={loading} className="w-full justify-center mt-2">Sign In</Button>
          </form>
        )}

        {/* Google Button */}
        {loginType === "google" && (
          <div className="space-y-4">
            <button onClick={loginWithGoogle} className="w-full py-3 bg-white border border-border rounded-lg text-dark font-medium flex items-center justify-center gap-3 hover:bg-secondary/50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign in with Google
            </button>
            <p className="text-xs text-center text-muted mt-4">You will be redirected to Google to complete the sign-in.</p>
          </div>
        )}

        {/* Phone Form */}
        {loginType === "phone" && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handlePhoneSubmit}>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-muted mb-1">Select Country</label>
                  <CountrySelector 
                    selectedCountry={country?.code} 
                    onSelect={(c) => setCountry(c)} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2.5 bg-secondary/50 border border-border rounded-lg text-muted font-medium whitespace-nowrap">
                      {country ? country.dial_code : "+00"}
                    </span>
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="84 000 0000" 
                      className="flex-1 w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark" 
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full justify-center mt-2">Send OTP via SMS</Button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit}>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-muted mb-1">Enter 6-digit Code</label>
                  <input 
                    type="text" 
                    name="token"
                    placeholder="123456" 
                    className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark text-center text-2xl tracking-widest" 
                    maxLength={6}
                    required 
                  />
                  <p className="text-xs text-muted mt-2 text-center">We sent a verification code to <span className="text-dark font-medium">{country?.dial_code} {phoneNumber}</span></p>
                </div>
                <Button type="submit" disabled={loading} className="w-full justify-center">Verify & Sign In</Button>
                <button type="button" onClick={() => setOtpSent(false)} className="w-full text-center text-xs text-primary mt-3 hover:underline">Resend code or change number</button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-muted">
          Don't have an account? <Link href="/register" className="text-primary font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
