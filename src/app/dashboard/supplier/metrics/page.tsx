"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getSupplierMetrics } from "@/lib/newvelion-api";

export default function SupplierMetricsPage() {
  return (
    <LiveDataPage
      area="supplier"
      activeKey="metrics"
      title="Metrics"
      subtitle="Live supplier performance metrics."
      loader={getSupplierMetrics}
    />
  );
}
