"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getFinanceWithdrawals } from "@/lib/newvelion-api";

export default function SellerWithdrawalsPage() {
  return (
    <LiveDataPage
      area="seller"
      activeKey="withdrawals"
      title="Withdrawals"
      subtitle="Live wallet withdrawal records."
      loader={getFinanceWithdrawals}
    />
  );
}
