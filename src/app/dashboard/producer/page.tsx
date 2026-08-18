"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import NotificationCenter from "@/components/ui/NotificationCenter";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { EmptyState } from "@/components/ui/Skeleton";
import { formatMultiCurrency } from "@/lib/currency";
import { supabase } from "@/lib/supabase/client";

export default function ProducerDashboard() {
  const [loading, setLoading] = useState(true);
  const [countryCode, setCountryCode] = useState("ZA");
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    inventoryValue: 0,
    pendingOrders: 0,
    totalEarnings: 0,
  });
  const [formatted, setFormatted] = useState({
    inventoryValue: { zar: "R 0.00", usd: "USD 0.00", local: "0.00" },
    totalEarnings: { zar: "R 0.00", usd: "USD 0.00", local: "0.00" },
  });

  useEffect(() => {
    const getUserCountry = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("country")
          .eq("id", user.id)
          .single();
        if (profile?.country) setCountryCode(profile.country);
      }
    };
    getUserCountry();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Buscar produtos do produtor para obter métricas de inventário
        const { data: products, error: prodError } = await supabase
          .from("products")
          .select("price")
          .eq("supplier_id", user.id)
          .eq("is_active", true);
        
        if (prodError) throw prodError;

        const totalProducts = products?.length || 0;
        const inventoryValue = products?.reduce((sum, p) => sum + (p.price || 0), 0) || 0;

        // Buscar pedidos que envolvem os produtos deste produtor
        const { data: orders, error: ordError } = await supabase
          .from("orders")
          .select("total_price, status")
          .eq("products.supplier_id", user.id);
        
        if (ordError) throw ordError;

        const pendingOrders = orders?.filter(o => o.status === "pending")?.length || 0;
        const totalEarnings = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

        setMetrics({ totalProducts, inventoryValue, pendingOrders, totalEarnings });

        // Formatar as 3 moedas
        const [inv, earn] = await Promise.all([
          formatMultiCurrency(inventoryValue, countryCode),
          formatMultiCurrency(totalEarnings, countryCode),
        ]);
        setFormatted({ inventoryValue: inv, totalEarnings: earn });

      } catch (err) {
        console.error("Error fetching producer metrics", err);
      } finally {
        setLoading(false);
      }
    };
    if (countryCode) fetchMetrics();
  }, [countryCode]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Good morning, Producer</h1>
          <p className="text-muted text-sm">Manage your inventory and sales.</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <LanguageSwitcher />
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-muted font-medium">Total Products</p>
          <p className="text-xl font-bold text-dark mt-1">{loading ? "..." : metrics.totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-muted font-medium">Inventory Value</p>
          <p className="text-xl font-bold text-success mt-1">{loading ? "..." : formatted.inventoryValue.zar}</p>
          <p className="text-xs text-muted">{loading ? "" : formatted.inventoryValue.usd}</p>
          <p className="text-xs text-muted">{loading ? "" : formatted.inventoryValue.local}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-muted font-medium">Pending Orders</p>
          <p className="text-xl font-bold text-warning mt-1">{loading ? "..." : metrics.pendingOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-muted font-medium">Total Earnings</p>
          <p className="text-xl font-bold text-primary mt-1">{loading ? "..." : formatted.totalEarnings.zar}</p>
          <p className="text-xs text-muted">{loading ? "" : formatted.totalEarnings.usd}</p>
          <p className="text-xs text-muted">{loading ? "" : formatted.totalEarnings.local}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark">Stock Alerts</h3>
            <Button variant="outline" className="text-xs px-4 py-2">View All</Button>
          </div>
          <EmptyState title="No low stock alerts" description="Your inventory levels are healthy." />
        </div>
        <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark">Recent Orders</h3>
            <Button variant="outline" className="text-xs px-4 py-2">View All</Button>
          </div>
          {metrics.pendingOrders === 0 ? (
            <EmptyState title="No recent orders" description="New orders will appear here." />
          ) : (
            <div className="text-center py-8 text-muted text-sm">
              You have {metrics.pendingOrders} pending order(s) waiting for fulfillment.
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button className="flex-1 justify-center">Add New Product</Button>
        <Button variant="outline" className="flex-1 justify-center">View Inventory</Button>
      </div>
    </DashboardLayout>
  );
}
