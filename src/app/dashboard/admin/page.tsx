"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import NotificationCenter from "@/components/ui/NotificationCenter";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalSellers: 0,
    totalProducers: 0,
    pendingProducts: 0,
    pendingWithdrawalsAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/admin/metrics");
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Error fetching metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Platform Overview</h1>
          <p className="text-muted text-sm">Manage the entire Velion ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <LanguageSwitcher />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Total Sellers</p>
          <p className="text-xl font-bold text-dark mt-1">{loading ? "..." : metrics.totalSellers}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Total Producers</p>
          <p className="text-xl font-bold text-dark mt-1">{loading ? "..." : metrics.totalProducers}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Pending Products</p>
          <p className="text-xl font-bold text-warning mt-1">{loading ? "..." : metrics.pendingProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Pending Withdrawals</p>
          <p className="text-xl font-bold text-error mt-1">{loading ? "..." : `R ${metrics.pendingWithdrawalsAmount.toFixed(2)}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-dark mb-4">Recent Users</h3>
          <div className="text-center py-8 text-muted text-sm">Use the Users page to manage accounts.</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-dark mb-4">Pending Approvals</h3>
          <div className="text-center py-8 text-muted text-sm">Check the Products page for pending items.</div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button className="flex-1 justify-center" onClick={() => window.location.href='/dashboard/admin/users'}>View All Users</Button>
        <Button variant="outline" className="flex-1 justify-center" onClick={() => window.location.href='/dashboard/admin/products'}>Manage Products</Button>
      </div>
    </DashboardLayout>
  );
}
