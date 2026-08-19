"use client";

import { useState, useRef, useEffect } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import Link from "next/link";
import CountrySelector from "@/components/ui/CountrySelector";
import { loginWithEmail, loginWithPhone, loginWithGoogle } from "@/app/register/actions";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const { showToast } = useToast();
  const [loginType, setLoginType] = useState<"email" | "phone">("email");
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await loginWithEmail(formData);
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || "Invalid email or password");
        setLoading(false);
      }
    }
  }

  async function handlePhoneSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      await loginWithPhone(formData);
      if (isMounted.current) setOtpSent(true);
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || "Failed to send code.");
        setLoading(false);
      }
    }
  }

  async function handleGoogleLogin() {
    setSocialLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || "Google login failed.");
        setSocialLoading(false);
      }
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

        {/* Social Login Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={socialLoading}
            className="w-full py-3 bg-white border border-light-border rounded-lg text-light-text font-medium flex items-center justify-center gap-3 hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <button 
            disabled
            className="w-full py-3 bg-white border border-light-border rounded-lg text-light-text font-medium flex items-center justify-center gap-3 hover:bg-secondary transition-colors opacity-60 cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.5 12c0-2.1-.9-3.9-2.3-5.2C14.4 6.1 13.8 6 13.2 6c-1.3 0-2.5.6-3.3 1.5C9.6 5.6 8.4 5 7.1 5c-.7 0-1.3.1-2 .5C3.8 6.8 2.5 8.9 2.5 12c0 3.1 1.3 5.2 2.6 6.5.6.4 1.3.5 2 .5 1.3 0 2.5-.6 3.3-1.5.8.9 2 1.5 3.3 1.5.7 0 1.3-.1 2-.5 1.4-1.3 2.7-3.4 2.7-6.5z" />
            </svg>
            Sign in with Apple
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-light-border"></div>
          </div>
          <div className="relative flex justify-center text-xs text-light-muted">
            <span className="px-2 bg-white">or sign in with</span>
          </div>
        </div>

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
            <Button type="submit" disabled={loading} className="w-full justify-center mt-2 bg-primary text-white hover:bg-primary/90 rounded-full">Sign In</Button>
          </form>
        )}

        {loginType === "phone" && (
          <div>
            {!otpSent ? (
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
                <Button type="submit" disabled={loading} className="w-full justify-center mt-2 bg-primary text-white hover:bg-primary/90 rounded-full">Send Code via SMS</Button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-light-muted text-sm">We sent a code to <span className="font-medium text-light-text">{selectedCountry?.dial_code} ...</span></p>
                <Link href="/verify-phone">
                  <Button className="w-full justify-center bg-primary text-white hover:bg-primary/90 rounded-full">Enter Code</Button>
                </Link>
                <button type="button" onClick={() => setOtpSent(false)} className="w-full text-center text-xs text-primary mt-3 hover:underline">Resend code</button>
              </div>
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
