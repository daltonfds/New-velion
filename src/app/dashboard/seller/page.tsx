"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VelionLogo from "@/components/ui/VelionLogo";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SellerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    netProfit: 0,
    pendingCOD: 0,
    availableBalance: 0,
  });
  const [chartData, setChartData] = useState<{ name: string; sales: number; profit: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      // Verificar se é Seller
      const role = session.user.user_metadata?.role || "seller";
      if (role !== "seller") {
        router.replace("/dashboard/admin");
        return;
      }

      // Buscar pedidos do seller
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", session.user.id)
        .order("created_at", { ascending: false });

      if (orders) {
        let totalSales = 0;
        let profit = 0;
        let pendingCOD = 0;

        orders.forEach((order: any) => {
          totalSales += order.total_price || 0;
          profit += (order.total_price || 0) * 0.4; // Simulação de lucro
          if (order.status === "pending") pendingCOD += order.total_price || 0;
        });

        setMetrics({
          totalSales,
          netProfit: profit,
          pendingCOD,
          availableBalance: totalSales - profit,
        });

        // Buscar últimos 30 dias de gráfico
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const recentOrdersFiltered = orders.filter((order: any) => new Date(order.created_at) > last30Days);
        setRecentOrders(recentOrdersFiltered.slice(0, 5));

        // Dados do gráfico (simplificado para este primeiro passo)
        const chart = orders.slice(0, 7).map((order: any, index: number) => ({
          name: `Order ${index + 1}`,
          sales: order.total_price || 0,
          profit: (order.total_price || 0) * 0.4,
        }));
        setChartData(chart);
      }

      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <VelionLogo className="w-8 h-8" />
            <span className="font-display text-xl font-semibold text-light-text">Velion Seller</span>
          </div>
          <button
            onClick={() => { supabase.auth.signOut(); router.replace("/login"); }}
            className="text-sm text-light-muted hover:text-light-text"
          >
            Sign Out
          </button>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-light-text mb-2">Good morning, Seller</h1>
        <p className="text-light-muted text-sm mb-8">Here is your sales overview.</p>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Total Sales</p>
            <p className="text-xl font-bold text-light-text mt-1">R {metrics.totalSales.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Net Profit</p>
            <p className="text-xl font-bold text-success mt-1">R {metrics.netProfit.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Pending COD</p>
            <p className="text-xl font-bold text-warning mt-1">R {metrics.pendingCOD.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
            <p className="text-xs text-light-muted font-medium">Available Balance</p>
            <p className="text-xl font-bold text-primary mt-1">R {metrics.availableBalance.toFixed(2)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm mb-8">
          <h3 className="font-semibold text-light-text mb-4">Sales & Profit</h3>
          {loading ? (
            <p className="text-light-muted text-sm">Loading...</p>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-light-muted text-sm">No sales data yet.</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm">
          <h3 className="font-semibold text-light-text mb-4">Recent Orders</h3>
          {loading ? (
            <p className="text-light-muted text-sm">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-light-muted text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between border-b border-light-border pb-3">
                  <div>
                    <p className="text-sm font-medium text-light-text">{order.customer_name}</p>
                    <p className="text-xs text-light-muted">#{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-light-text">R {order.total_price}</p>
                    <p className="text-xs text-light-muted">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
