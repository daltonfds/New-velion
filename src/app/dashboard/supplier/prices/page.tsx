"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getSupplierProducts } from "@/lib/newvelion-api";

export default function SupplierPricesPage() {
  return (
    <LiveDataPage
      area="supplier"
      activeKey="prices"
      title="Prices"
      subtitle="Live supplier product pricing."
      loader={getSupplierProducts}
      columns={[
        "id",
        "name_en",
        "price",
        "original_price",
        "offer_price",
        "currency",
        "updated_at",
      ]}
    />
  );
}
