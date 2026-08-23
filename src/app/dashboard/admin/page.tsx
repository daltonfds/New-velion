"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSellers: 0,
    totalProducers: 0,
    pendingRequests: 0,
    pendingWithdrawals: 0,
  });

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const { data: profiles } = await supabase.from("profiles").select("role").eq("role", "seller");
      const { data: producers } = await supabase.from("profiles").select("role").eq("role", "producer");
      const { data: requests } = await supabase.from("registration_requests").select("*").eq("status", "pending");
      const { data: withdrawals } = await supabase.from("withdrawals").select("amount").eq("status", "pending");

      setMetrics({
        totalSellers: profiles?.length || 0,
        totalProducers: producers?.length || 0,
        pendingRequests: requests?.length || 0,
        pendingWithdrawals: withdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0,
      });
      setLoading(false);
    };
    load();
  }, [router]);

  return (
    <DashboardLayout userType="admin">
      <h1 className="text-2xl font-bold mb-2">Platform Overview</h1>
      <p className="text-sm text-light-muted mb-8">Manage the entire Velion ecosystem.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Total Sellers</p>
          <p className="text-xl font-bold text-light-text mt-1">{loading ? "..." : metrics.totalSellers}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Total Producers</p>
          <p className="text-xl font-bold text-light-text mt-1">{loading ? "..." : metrics.totalProducers}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Pending Requests</p>
          <p className="text-xl font-bold text-warning mt-1">{loading ? "..." : metrics.pendingRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Pending Withdrawals</p>
          <p className="text-xl font-bold text-error mt-1">{loading ? "..." : `R ${metrics.pendingWithdrawals.toFixed(2)}`}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
