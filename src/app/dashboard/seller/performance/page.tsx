"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAffiliatePerformance } from "@/lib/newvelion-api";

export default function SellerPerformancePage() {
  return (
    <LiveDataPage
      area="seller"
      activeKey="performance"
      title="Performance"
      subtitle="Live affiliate performance metrics."
      loader={getAffiliatePerformance}
    />
  );
}
