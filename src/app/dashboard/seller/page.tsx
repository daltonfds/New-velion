"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

export default function SellerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    netProfit: 0,
    pendingCOD: 0,
    availableBalance: 0,
  });

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const { data: orders } = await supabase.from("orders").select("*").eq("seller_id", session.user.id);
      if (orders) {
        let totalSales = 0, netProfit = 0, pendingCOD = 0;
        orders.forEach((order: any) => {
          totalSales += order.total_price || 0;
          netProfit += (order.total_price || 0) * 0.4;
          if (order.status === "pending") pendingCOD += order.total_price || 0;
        });
        setMetrics({ totalSales, netProfit, pendingCOD, availableBalance: totalSales - netProfit });
      }
      setLoading(false);
    };
    load();
  }, [router]);

  return (
    <DashboardLayout userType="seller">
      <h1 className="text-2xl font-bold mb-2">Good morning, Seller</h1>
      <p className="text-sm text-light-muted mb-8">Here is your sales overview.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Total Sales</p>
          <p className="text-xl font-bold text-light-text mt-1">{loading ? "..." : `R ${metrics.totalSales.toFixed(2)}`}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Net Profit</p>
          <p className="text-xl font-bold text-success mt-1">{loading ? "..." : `R ${metrics.netProfit.toFixed(2)}`}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Pending COD</p>
          <p className="text-xl font-bold text-warning mt-1">{loading ? "..." : `R ${metrics.pendingCOD.toFixed(2)}`}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Available Balance</p>
          <p className="text-xl font-bold text-primary mt-1">{loading ? "..." : `R ${metrics.availableBalance.toFixed(2)}`}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm mb-8">
        <h3 className="font-semibold mb-4">Sales & Profit</h3>
        {loading ? <p className="text-sm text-light-muted">Loading...</p> : <PerformanceChart data={chartData} />}
      </div>
    </DashboardLayout>
  );
}
