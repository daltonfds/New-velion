"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

export default function ProducerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    inventoryValue: 0,
    pendingOrders: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("supplier_id", session.user.id);

      let inventoryValue = 0;
      if (products) {
        inventoryValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
        setMetrics({
          totalProducts: products.length,
          inventoryValue,
          pendingOrders: 0,
          totalEarnings: 0,
        });
      }

      setLoading(false);
    };
    load();
  }, [router]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-2">Good morning, Producer</h1>
      <p className="text-sm text-light-muted mb-8">Manage your products and inventory.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Total Products</p>
          <p className="text-xl font-bold text-light-text mt-1">{loading ? "..." : metrics.totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Inventory Value</p>
          <p className="text-xl font-bold text-success mt-1">{loading ? "..." : `R ${metrics.inventoryValue.toFixed(2)}`}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Pending Orders</p>
          <p className="text-xl font-bold text-warning mt-1">{loading ? "..." : metrics.pendingOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Total Earnings</p>
          <p className="text-xl font-bold text-primary mt-1">{loading ? "..." : `R ${metrics.totalEarnings.toFixed(2)}`}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl border border-light-border">
        <h3 className="font-semibold mb-4">Products Overview</h3>
        {loading ? <p className="text-sm text-light-muted">Loading...</p> : (
          <p className="text-sm text-light-muted">You have {metrics.totalProducts} active products.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
