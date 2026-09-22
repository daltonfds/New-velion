"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAffiliateProducts } from "@/lib/newvelion-api";

export default function SellerSelectedPage() {
  return (
    <LiveDataPage
      area="seller"
      activeKey="selectedProducts"
      title="Selected Products"
      subtitle="Live products selected for promotion."
      loader={getAffiliateProducts}
    />
  );
}
