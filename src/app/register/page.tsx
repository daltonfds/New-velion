"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { signup } from "./actions";

export default function RegisterPage() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    try {
      await signup(formData);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-sm p-8">
        <div className="flex justify-center mb-6"><VelionLogo className="w-20 h-20" /></div>
        <h2 className="text-xl font-semibold text-dark text-center mb-1">Create your account</h2>
        <p className="text-center text-muted text-sm mb-6">Start your climb with Velion.</p>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Full Name</label>
            <input type="text" name="fullName" placeholder="John Doe" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-dark" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Email</label>
            <input type="email" name="email" placeholder="you@example.com" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-dark" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Password</label>
            <input type="password" name="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-dark" required />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <Button className="w-full justify-center mt-2">Create Account</Button>
        </form>
        <div className="mt-6 text-center text-xs text-muted">Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign In</Link></div>
      </div>
    </div>
  );
}
