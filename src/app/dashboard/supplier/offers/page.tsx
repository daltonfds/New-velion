"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getSupplierOffers } from "@/lib/newvelion-api";

export default function SupplierOffersPage() {
  return (
    <LiveDataPage
      area="supplier"
      activeKey="offers"
      title="Offers"
      subtitle="Live supplier offers and promotions."
      loader={getSupplierOffers}
    />
  );
}
