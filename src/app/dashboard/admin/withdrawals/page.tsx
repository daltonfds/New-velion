"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAdminWithdrawals } from "@/lib/newvelion-api";

export default function AdminWithdrawalsPage() {
  return (
    <LiveDataPage
      area="admin"
      activeKey="withdrawals"
      title="Withdrawals"
      subtitle="Monitor withdrawal requests from the platform."
      loader={getAdminWithdrawals}
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
