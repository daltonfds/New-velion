"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAffiliateSales } from "@/lib/newvelion-api";

export default function SellerSalesPage() {
  return (
    <LiveDataPage
      area="seller"
 activeKey="sales"
      title="Sales"
      subtitle="Your affiliate sales and performance."
      loader={getAffiliateSales}
      columns={[
        "id",
        "order_reference",
        "product_id",
        "amount",
        "currency",
        "status",
        "created_at",
      ]}
    />
  );
}
