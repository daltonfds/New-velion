"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAffiliateReports } from "@/lib/newvelion-api";

export default function SellerReportsPage() {
  return (
    <LiveDataPage
      area="seller"
      activeKey="reports"
      title="Reports"
      subtitle="Live affiliate reporting data."
      loader={getAffiliateReports}
    />
  );
}
