"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      // 1. Verificar se há sessão
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      // 2. Verificar se o utilizador é admin (através da metadata)
      const role = session.user.user_metadata?.role || "seller";

      // 3. Se não for admin, redirecionar para o seller
      if (role !== "admin") {
        router.replace("/dashboard/seller");
        return;
      }
    };

    checkAccess();
  }, [router]);

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <VelionLogo className="w-10 h-10" />
            <span className="font-display text-xl font-semibold text-light-text">Velion Admin</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-light-text mb-6">Dashboard Overview</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Total Sellers</p>
            <p className="text-xl font-bold text-light-text mt-1">0</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Total Producers</p>
            <p className="text-xl font-bold text-light-text mt-1">0</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Pending Products</p>
            <p className="text-xl font-bold text-light-text mt-1">0</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Pending Withdrawals</p>
            <p className="text-xl font-bold text-light-text mt-1">0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm">
            <h3 className="font-semibold text-light-text mb-4">Recent Users</h3>
            <p className="text-light-muted text-sm">No users yet.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm">
            <h3 className="font-semibold text-light-text mb-4">Pending Approvals</h3>
            <p className="text-light-muted text-sm">No pending approvals.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => router.push("/dashboard/admin/requests")}
            className="w-full py-3 bg-primary text-white rounded-full font-medium"
          >
            View Registration Requests
          </button>
          <button 
            onClick={() => router.push("/dashboard/admin/settings")}
            className="w-full py-3 bg-white text-light-text border border-light-border rounded-full font-medium"
          >
            Manage Platform Settings
          </button>
        </div>
      </div>
    </div>
  );
}
