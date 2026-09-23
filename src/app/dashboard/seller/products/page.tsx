"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAvailableAffiliateProducts } from "@/lib/newvelion-api";

export default function SellerProductsPage() {
  return (
    <LiveDataPage
      area="seller"
      activeKey="products"
      title="My Products"
      subtitle="Products currently connected to your seller account."
      loader={getAvailableAffiliateProducts}
    />
  );
}
