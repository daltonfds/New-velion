"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAdminKyc } from "@/lib/newvelion-api";

export default function AdminKycPage() {
  return (
    <LiveDataPage
      area="admin"
      activeKey="kyc"
      title="KYC"
      subtitle="Monitor identity verification submissions."
      loader={getAdminKyc}
      columns={[
        "id",
        "user_id",
        "legal_name",
        "country",
        "document_type",
        "status",
        "submitted_at",
        "reviewed_at",
      ]}
    />
  );
}
