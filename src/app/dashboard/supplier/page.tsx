"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getSupplierMetrics } from "@/lib/newvelion-api";

export default function SupplierDashboardPage() {
  return (
    <LiveDataPage
      area="supplier"
      activeKey="dashboard"
      title="Supplier Dashboard"
      subtitle="Your supplier metrics and activity."
      loader={getSupplierMetrics}
    />
  );
}
