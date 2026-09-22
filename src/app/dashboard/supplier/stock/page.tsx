"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getSupplierProducts } from "@/lib/newvelion-api";

export default function SupplierStockPage() {
  return (
    <LiveDataPage
      area="supplier"
      activeKey="stock"
      title="Stock"
      subtitle="Live product inventory from Supabase."
      loader={getSupplierProducts}
      columns={[
        "id",
        "name_en",
        "stock",
        "status",
        "updated_at",
      ]}
    />
  );
}
