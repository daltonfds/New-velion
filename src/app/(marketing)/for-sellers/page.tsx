import type { Metadata } from "next";
import { PageHead, Section, Flow, Rows } from "../_components/ui";

export const metadata: Metadata = { title: "Sellers and affiliates" };

export default function SellersPage() {
  return (
    <>
      <PageHead
        title="Pick products. Share links. Earn commission."
        lead="Sellers and affiliates promote approved products and are paid when their referrals turn into sales."
        cta={{ href: "/get-started", label: "Join as a seller" }}
      />
      <Section tint title="How a referral becomes income" sub="Each step is recorded, so you can see where every sale came from.">
        <Flow steps={[
          { label: "Choose a product" }, { label: "Set your price", note: "within supplier limits" },
          { label: "Share your tracked link" }, { label: "Sale is attributed" },
          { label: "Commission is recorded" }, { label: "Withdraw" },
        ]} />
      </Section>
      <Section>
        <Rows items={[
          { title: "Tracked referral links", text: "Every product you promote gets a link that carries your attribution." },
          { title: "Sales analytics", text: "Follow orders and conversions for each product and link." },
          { title: "Wallet and history", text: "Commission balances and every wallet movement are listed in your dashboard." },
          { title: "Withdrawal requests", text: "Request a payout when you are ready. Each request is reviewed before it is paid." },
        ]} />
      </Section>
    </>
  );
}
