"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VelionLogo from "@/components/ui/VelionLogo";
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
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <VelionLogo className="w-8 h-8" />
            <span className="font-display text-xl font-semibold text-light-text">Velion Producer</span>
          </div>
          <button onClick={() => { supabase.auth.signOut(); router.replace("/login"); }} className="text-sm text-light-muted hover:text-light-text">Sign Out</button>
        </div>

        <h1 className="text-3xl font-bold text-light-text mb-2">Good morning, Producer</h1>
        <p className="text-light-muted text-sm mb-8">Manage your products and inventory.</p>

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
          <h3 className="font-semibold text-light-text mb-4">Products Overview</h3>
          {loading ? <p className="text-light-muted text-sm">Loading...</p> : (
            <p className="text-light-muted text-sm">You have {metrics.totalProducts} active products.</p>
          )}
        </div>
      </div>
    </div>
  );
}
