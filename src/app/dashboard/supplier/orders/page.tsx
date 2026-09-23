"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getSupplierOrders } from "@/lib/newvelion-api";

export default function SupplierOrdersPage() {
  return (
    <LiveDataPage
      area="supplier"
      activeKey="orders"
      title="Orders"
      subtitle="Your supplier orders and activity."
      loader={getSupplierOrders}
      columns={[
        "id",
        "product_id",
        "affiliate_id",
        "quantity",
        "unit_price",
        "total_amount",
        "currency",
        "status",
        "created_at",
      ]}
    />
  );
}
