"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getSupplierProducts } from "@/lib/newvelion-api";

export default function SupplierCatalogPage() {
  return (
    <LiveDataPage
      area="supplier"
      activeKey="catalog"
      title="Catalog"
      subtitle="Your real supplier product catalog."
      loader={getSupplierProducts}
      columns={[
        "id",
        "name_en",
        "name_pt",
        "price",
        "currency",
        "commission_percentage",
        "stock",
        "status",
        "featured",
        "created_at",
      ]}
    />
  );
}
