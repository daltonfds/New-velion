import type { Metadata } from "next";
import { PageHead, Section, Rows } from "../_components/ui";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return (
    <>
      <PageHead title="Connect the tools you already use" lead="Bring Newvelion into the stores and systems your business already runs on." />
      <Section>
        <Rows items={[
          { title: "Shopify", text: "Connect a store with OAuth to import products and bring orders back." },
          { title: "API access", text: "Use API credentials to work with products and orders from your own systems." },
          { title: "Webhooks", text: "Receive signed events when orders and fulfilment change." },
          { title: "Order and stock sync", text: "Keep stock, shipping and tracking updates moving between systems." },
        ]} />
        <p className="nv-sub">Which connections are active for your account is shown in your dashboard.</p>
      </Section>
    </>
  );
}
