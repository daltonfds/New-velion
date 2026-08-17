import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import TrendChart from "@/components/ui/TrendChart";
import NotificationCenter from "@/components/ui/NotificationCenter";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { Skeleton, EmptyState } from "@/components/ui/Skeleton";
import { useState } from "react";

export default function SellerDashboard() {
  const [loading] = useState(false);
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
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Total Sales</p><p className="text-xl font-bold text-dark mt-1">R 0.00</p></div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Net Profit</p><p className="text-xl font-bold text-success mt-1">R 0.00</p></div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Pending COD</p><p className="text-xl font-bold text-warning mt-1">R 0.00</p></div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Available Balance</p><p className="text-xl font-bold text-primary mt-1">R 0.00</p></div>
      </div>

      {/* Trend Chart (como nas fotos que anexou) */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark">Sales & Profit — Last 30 Days</h3>
        </div>
        {loading ? <Skeleton className="h-64 w-full" /> : <TrendChart />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-dark mb-4">Recent Orders</h3>
          <EmptyState title="No orders yet" description="Start selling to see your activity here." />
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
