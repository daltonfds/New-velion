"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import TrendChart from "@/components/ui/TrendChart";
import NotificationCenter from "@/components/ui/NotificationCenter";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { EmptyState } from "@/components/ui/Skeleton";

export default function SellerDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    netProfit: 0,
    pendingCOD: 0,
    balance: 0,
    chartData: [] as { name: string; sales: number; profit: number }[],
    recentOrders: [] as any[],
  });

  // Buscar pedidos da API e calcular as métricas
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const orders = await res.json();

      // Calcular totais
      let totalSales = 0;
      let netProfit = 0;
      let pendingCOD = 0;
      let balance = 0;

      // Processar os pedidos
      const last30Days: { [key: string]: { sales: number; profit: number } } = {};
      
      orders.forEach((order: any) => {
        // Para simular o lucro, vamos supor que o preço de custo é 60% do preço (mock até o ledger ficar pronto)
        const profitPerOrder = order.total_price * 0.40; 

        totalSales += order.total_price || 0;
        netProfit += profitPerOrder;

        if (order.status === "pending") {
          pendingCOD += order.total_price || 0;
        }

        // Últimos 30 dias (para o gráfico)
        const date = new Date(order.created_at);
        const dayKey = `${date.getDate()}/${date.getMonth() + 1}`;
        if (!last30Days[dayKey]) last30Days[dayKey] = { sales: 0, profit: 0 };
        last30Days[dayKey].sales += order.total_price || 0;
        last30Days[dayKey].profit += profitPerOrder;
      });

      // Saldo disponível = lucro líquido (mockado)
      balance = netProfit * 0.8; // 80% disponível, 20% reservado

      // Transformar dados do gráfico em array
      const chartData = Object.keys(last30Days).map((key) => ({
        name: key,
        sales: last30Days[key].sales,
        profit: last30Days[key].profit,
      }));

      setMetrics({
        totalSales,
        netProfit,
        pendingCOD,
        balance,
        chartData,
        recentOrders: orders.slice(0, 5), // Últimos 5 pedidos
      });
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Good morning, Seller</h1>
          <p className="text-muted text-sm">Here is your sales overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <LanguageSwitcher />
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Total Sales</p>
          <p className="text-xl font-bold text-dark mt-1">
            {loading ? "..." : `R ${metrics.totalSales.toFixed(2)}`}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Net Profit</p>
          <p className="text-xl font-bold text-success mt-1">
            {loading ? "..." : `R ${metrics.netProfit.toFixed(2)}`}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Pending COD</p>
          <p className="text-xl font-bold text-warning mt-1">
            {loading ? "..." : `R ${metrics.pendingCOD.toFixed(2)}`}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Available Balance</p>
          <p className="text-xl font-bold text-primary mt-1">
            {loading ? "..." : `R ${metrics.balance.toFixed(2)}`}
          </p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark">Sales & Profit — Last 30 Days</h3>
        </div>
        {loading ? (
          <div className="h-64 w-full flex items-center justify-center text-muted text-sm">Loading chart data...</div>
        ) : (
          <TrendChart data={metrics.chartData} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-dark mb-4">Recent Orders</h3>
          {loading ? (
            <div className="text-center py-8 text-muted text-sm">Loading...</div>
          ) : metrics.recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" description="Start selling to see your activity here." />
          ) : (
            <div className="space-y-3">
              {metrics.recentOrders.map((order: any) => (
                <div key={order.id} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-dark">{order.customer_name}</p>
                    <p className="text-xs text-muted">#{order.id.slice(0, 8)} • {order.status}</p>
                  </div>
                  <p className="text-sm font-bold text-dark">R {order.total_price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-dark mb-4">Inventory Alerts</h3>
          <EmptyState title="All stocked up" description="You have enough inventory for now." />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Button className="flex-1 justify-center">Find Products to Sell</Button>
        <Button variant="outline" className="flex-1 justify-center">View Order History</Button>
      </div>
    </DashboardLayout>
  );
}
