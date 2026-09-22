"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAffiliateProducts } from "@/lib/newvelion-api";

export default function SellerCreativesPage() {
  return (
    <LiveDataPage
      area="seller"
      activeKey="creatives"
      title="Creatives"
      subtitle="Live promotional products and available campaign assets."
      loader={getAffiliateProducts}
    />
  );
}
