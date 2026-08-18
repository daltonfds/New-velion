"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { loginWithEmail, loginWithPhone, verifyOTPLogin } from "./actions";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const { showToast } = useToast();
  const [loginType, setLoginType] = useState<"email" | "phone">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  async function handlePhoneSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const phoneValue = formData.get("phone") as string;
      setPhone(phoneValue);
      await loginWithPhone(formData);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send code.");
      setLoading(false);
    }
  }

  async function handleOTPSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("phone", phone);
      await verifyOTPLogin(formData);
    } catch (err: any) {
      setError(err.message || "Invalid code.");
    } finally {
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-secondary/50 p-1 rounded-lg">
          <button onClick={() => setLoginType("email")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginType === "email" ? "bg-white shadow-sm text-light-text" : "text-light-muted hover:text-light-text"}`}>Email</button>
          <button onClick={() => setLoginType("phone")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginType === "phone" ? "bg-white shadow-sm text-light-text" : "text-light-muted hover:text-light-text"}`}>Phone</button>
        </div>

        {/* Email Form */}
        {loginType === "email" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-light-muted mb-1">Email</label>
              <input type="email" name="email" placeholder="you@example.com" className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-light-muted mb-1">Password</label>
              <input type="password" name="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text" required />
            </div>
            {error && <p className="text-sm text-rose-600 text-center bg-rose-50 p-2 rounded-lg">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full justify-center mt-2 bg-primary text-white hover:bg-primary/90 rounded-full">Sign In</Button>
          </form>
        )}

        {/* Phone Login */}
        {loginType === "phone" && (
          <div>
            {!otpSent ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-light-muted mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="+258 84 000 0000" 
                    className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text" 
                    required 
                  />
                </div>
                {error && <p className="text-sm text-rose-600 text-center bg-rose-50 p-2 rounded-lg">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full justify-center mt-2 bg-primary text-white hover:bg-primary/90 rounded-full">Send Code via SMS</Button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-light-muted mb-1">6-digit Code</label>
                  <input 
                    type="text" 
                    name="token" 
                    placeholder="123456" 
                    className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text text-center tracking-widest text-2xl" 
                    maxLength={6}
                    required 
                  />
                  <p className="text-xs text-light-muted mt-2 text-center">Code sent to: <span className="font-medium text-light-text">{phone}</span></p>
                </div>
                {error && <p className="text-sm text-rose-600 text-center bg-rose-50 p-2 rounded-lg">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full justify-center mt-2 bg-primary text-white hover:bg-primary/90 rounded-full">Verify & Sign In</Button>
                <button type="button" onClick={() => setOtpSent(false)} className="w-full text-center text-xs text-primary mt-3 hover:underline">Resend code</button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-light-muted">
          Don't have an account? <Link href="/register" className="text-primary font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
