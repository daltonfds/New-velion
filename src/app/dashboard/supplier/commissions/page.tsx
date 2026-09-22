"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getSupplierCommissions } from "@/lib/newvelion-api";

export default function SupplierCommissionsPage() {
  return (
    <LiveDataPage
      area="supplier"
      activeKey="commissions"
      title="Commissions"
      subtitle="Live commission records connected to sales."
      loader={getSupplierCommissions}
      columns={[
        "id",
        "supplier_id",
        "affiliate_id",
        "product_id",
        "sale_amount",
        "amount",
        "currency",
        "status",
        "created_at",
      ]}
    />
  );
}
