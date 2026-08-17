"use client";

import { useState, useEffect } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { login } from "./actions";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await login(formData);
    } catch (err: any) {
      showToast(err.message || "Login failed", "error");
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Email</label>
            <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Password</label>
            <input type="password" name="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark" required />
          </div>
          {email === "daltonfelizarda66@gmail.com" && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Admin Security Password</label>
              <input type="password" name="extra_password" placeholder="Admin pass" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark" required />
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full justify-center mt-2">Sign In</Button>
        </form>
        <div className="mt-6 text-center text-xs text-muted">Don't have an account? <Link href="/register" className="text-primary font-medium hover:underline">Sign up</Link></div>
      </div>
    </div>
  );
}
