"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Tentar fazer o login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // 2. Verificar se a sessão existe no Supabase (GARANTIA TOTAL)
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("Session not created. Please try again.");
      setLoading(false);
      return;
    }

    // 3. Obter a role dos metadados do Supabase
    const role = data.user?.user_metadata?.role || "seller";

    // 4. Redirecionamento instantâneo (substituindo a navegação)
    setTimeout(() => {
      if (role === "admin") {
        window.location.replace("/dashboard/admin");
      } else if (role === "producer") {
        window.location.replace("/dashboard/producer");
      } else {
        window.location.replace("/dashboard/seller");
      }
    }, 100);
  }

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8">
        <div className="flex justify-center mb-6">
          <VelionLogo className="w-28 h-28" />
        </div>
        <h2 className="text-xl font-semibold text-light-text text-center mb-1">Sign In</h2>
        <p className="text-center text-light-muted text-sm mb-6">Enter your Velion account.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text"
              required
            />
          </div>
          {error && <p className="text-sm text-rose-600 text-center bg-rose-50 p-2 rounded-lg">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full justify-center mt-2 bg-primary text-white hover:bg-primary/90 rounded-full py-3 font-medium disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-light-muted">
          Don't have an account? <Link href="/apply" className="text-primary font-medium hover:underline">Apply now</Link>
        </div>
      </div>
    </div>
  );
}
