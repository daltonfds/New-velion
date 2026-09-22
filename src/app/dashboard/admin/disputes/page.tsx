"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAdminDisputes } from "@/lib/newvelion-api";

export default function AdminDisputesPage() {
  return (
    <LiveDataPage
      area="admin"
      activeKey="disputes"
      title="Disputes"
      subtitle="Review live disputes and their current status."
      loader={getAdminDisputes}
      columns={[
        "id",
        "opened_by",
        "product_id",
        "sale_id",
        "reason",
        "status",
        "created_at",
        "resolved_at",
      ]}
    />
  );
}
