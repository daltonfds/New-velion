"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VelionLogo from "@/components/ui/VelionLogo";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function SetupPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      router.push("/dashboard/seller");
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8">
        <div className="flex justify-center mb-6">
          <VelionLogo className="w-28 h-28" />
        </div>
        <h2 className="text-xl font-semibold text-light-text text-center mb-1">Set Your Password</h2>
        <p className="text-center text-light-muted text-sm mb-6">This is your first login. Please set a new secure password.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-light-muted mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
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
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
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
            {loading ? "Updating..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
