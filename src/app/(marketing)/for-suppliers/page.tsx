import type { Metadata } from "next";
import { PageHead, Section, Flow, Rows } from "../_components/ui";

export const metadata: Metadata = { title: "Suppliers" };

export default function SuppliersPage() {
  return (
    <>
      <PageHead
        title="List once. Fulfil every order."
        lead="Bring products from South Africa or China to sellers who are ready to promote them."
        cta={{ href: "/get-started", label: "Apply as a supplier" }}
      />
      <Section tint title="From application to first payout" sub="Every supplier follows the same path, so approved products can be trusted.">
        <Flow steps={[
          { label: "Register" }, { label: "Verify business" }, { label: "Add products" },
          { label: "Admin review" }, { label: "Go live" }, { label: "Fulfil and track" }, { label: "Request payout" },
        ]} />
      </Section>
      <Section>
        <Rows items={[
          { title: "Business verification", text: "Onboarding includes verification, and your account status is always visible to you." },
          { title: "Product management", text: "Manage images, descriptions, prices and stock. Changes go for review before they are live." },
          { title: "Order fulfilment", text: "See the orders that belong to you, add shipping and tracking details, and update status." },
          { title: "Balances and payouts", text: "Follow your balance and request withdrawals. Admins review each request." },
        ]} />
      </Section>
    </>
  );
}
