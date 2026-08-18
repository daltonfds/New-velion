"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { signup } from "./actions";
import { useToast } from "@/components/ui/Toast";

export default function RegisterPage() {
  const { showToast } = useToast();
  const [role, setRole] = useState<"seller" | "producer">("seller");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await signup(formData);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
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
          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">Full Name</label>
            <input type="text" name="fullName" placeholder="John Doe" className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">Email</label>
            <input type="email" name="email" placeholder="you@example.com" className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">Password</label>
            <input type="password" name="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text" required />
          </div>
          {loading && <p className="text-center text-sm text-light-muted">Creating account...</p>}
          <Button type="submit" disabled={loading} className="w-full justify-center mt-2 bg-primary text-white hover:bg-primary/90 rounded-full">Create Account</Button>
        </form>
        <div className="mt-6 text-center text-xs text-light-muted">Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign In</Link></div>
      </div>
    </div>
  );
}
