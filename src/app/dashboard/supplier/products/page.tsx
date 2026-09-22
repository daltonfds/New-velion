"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getSupplierProducts } from "@/lib/newvelion-api";

export default function SupplierProductsPage() {
  return (
    <LiveDataPage
      area="supplier"
      activeKey="products"
      title="Products"
      subtitle="Live products owned by your supplier account."
      loader={getSupplierProducts}
      columns={[
        "id",
        "name_en",
        "name_pt",
        "price",
        "currency",
        "stock",
        "status",
        "created_at",
      ]}
    />
  );
}
