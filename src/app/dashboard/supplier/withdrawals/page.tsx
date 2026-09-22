"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getSupplierWithdrawals } from "@/lib/newvelion-api";

export default function SupplierWithdrawalsPage() {
  return (
    <LiveDataPage
      area="supplier"
      activeKey="withdrawals"
      title="Withdrawals"
      subtitle="Live supplier wallet withdrawal records."
      loader={getSupplierWithdrawals}
      columns={[
        "id",
        "user_id",
        "amount",
        "currency",
        "method",
        "status",
        "requested_at",
        "processed_at",
      ]}
    />
  );
}
