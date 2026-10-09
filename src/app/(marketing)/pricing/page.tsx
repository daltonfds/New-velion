import type { Metadata } from "next";
import { PageHead, Section, Grid } from "../_components/ui";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <PageHead title="Prices with clear limits" lead="Suppliers protect their price. Sellers keep their margin. The platform applies the rules." />
      <Section title="Where each price sits">
        <div className="nv-price" role="img" aria-label="Supplier price, seller margin, platform limit">
          <b>Supplier price</b><b>Seller margin</b><b>Platform limit</b>
        </div>
        <div className="nv-legend">
          <span>Set by the supplier</span><span>Set by the seller</span><span>Enforced by the backend</span>
        </div>
        <Grid items={[
          { title: "Supplier price is the floor", text: "Sellers cannot price below what the supplier needs to be paid." },
          { title: "Sellers choose their margin", text: "Pick a selling price inside the allowed range for each product." },
          { title: "Commission is calculated once", text: "The backend works it out from the confirmed sale, never from a value sent by the browser." },
          { title: "Rates are set by the platform", text: "Commission and price rules are applied the same way to every sale." },
        ]} />
      </Section>
    </>
  );
}
