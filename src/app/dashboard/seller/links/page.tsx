"use client";

import LiveDataPage from "@/components/dashboard/LiveDataPage";
import { getAffiliateProducts } from "@/lib/newvelion-api";

export default function SellerLinksPage() {
  return (
    <LiveDataPage
      area="seller"
      activeKey="links"
      title="Affiliate Links"
      subtitle="Live affiliate products and referral links."
      loader={getAffiliateProducts}
      columns={[
        "id",
        "product_id",
        "referral_code",
        "status",
        "product_page_url",
        "checkout_url",
        "created_at",
      ]}
    />
  );
}
