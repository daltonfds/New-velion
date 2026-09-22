"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAdminAnalytics } from "@/lib/newvelion-api";

export default function AdminAnalyticsPage() {
  return (
    <LiveDataPage
      area="admin"
      activeKey="analytics"
      title="Analytics"
      subtitle="Inspect live platform analytics events."
      loader={getAdminAnalytics}
      columns={[
        "id",
        "user_id",
        "event_name",
        "entity_type",
        "entity_id",
        "metadata",
        "created_at",
      ]}
    />
  );
}
