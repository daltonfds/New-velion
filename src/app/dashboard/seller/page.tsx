"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";
import PerformanceChart from "@/components/ui/PerformanceChart";
import { getExchangeRates, formatCurrency } from "@/lib/exchange";

export default function SellerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<any>({ ZAR: 1, USD: 0.055 });
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

      const rateData = await getExchangeRates();
      setRates(rateData);

      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", session.user.id);

      if (orders) {
        let totalSales = 0;
        let netProfit = 0;
        let pendingCOD = 0;
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

  const chartData = [
    { name: "Jan", sales: 0, profit: 0 },
    { name: "Feb", sales: 1200, profit: 480 },
    { name: "Mar", sales: 2400, profit: 960 },
    { name: "Apr", sales: 1800, profit: 720 },
    { name: "May", sales: 3000, profit: 1200 },
    { name: "Jun", sales: 2500, profit: 1000 },
  ];

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <VelionLogo className="w-8 h-8" />
            <span className="font-display text-xl font-semibold text-light-text">Velion Seller</span>
          </div>
          <button onClick={() => { supabase.auth.signOut(); router.replace("/login"); }} className="text-sm text-light-muted hover:text-light-text">Sign Out</button>
        </div>

        <h1 className="text-3xl font-bold text-light-text mb-2">Good morning, Seller</h1>
        <p className="text-light-muted text-sm mb-8">Here is your sales overview.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Total Sales</p>
            <p className="text-xl font-bold text-light-text mt-1">
              {loading ? "..." : formatCurrency(metrics.totalSales, "ZAR")}
            </p>
            <p className="text-xs text-light-muted">{loading ? "" : formatCurrency(metrics.totalSales * (rates.USD || 0.055), "USD")}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Net Profit</p>
            <p className="text-xl font-bold text-success mt-1">
              {loading ? "..." : formatCurrency(metrics.netProfit, "ZAR")}
            </p>
            <p className="text-xs text-light-muted">{loading ? "" : formatCurrency(metrics.netProfit * (rates.USD || 0.055), "USD")}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Pending COD</p>
            <p className="text-xl font-bold text-warning mt-1">
              {loading ? "..." : formatCurrency(metrics.pendingCOD, "ZAR")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Available Balance</p>
            <p className="text-xl font-bold text-primary mt-1">
              {loading ? "..." : formatCurrency(metrics.availableBalance, "ZAR")}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm mb-8">
          <h3 className="font-semibold text-light-text mb-4">Sales & Profit</h3>
          {loading ? <p className="text-light-muted text-sm">Loading...</p> : <PerformanceChart data={chartData} />}
        </div>

        <div className="bg-white p-6 rounded-xl border border-light-border">
          <h3 className="font-semibold text-light-text mb-4">Recent Orders</h3>
          {loading ? <p className="text-light-muted text-sm">Loading...</p> : (
            <div className="text-light-muted text-sm">Orders will appear here.</div>
          )}
        </div>
      </div>
    </div>
  );
}
