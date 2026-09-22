"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAffiliatePerformance } from "@/lib/newvelion-api";

export default function SellerDashboardPage() {
  return (
    <LiveDataPage
      area="seller"
      activeKey="dashboard"
      title="Seller Dashboard"
      subtitle="Live affiliate performance from NewVelion."
      loader={getAffiliatePerformance}
    />
  );
}
