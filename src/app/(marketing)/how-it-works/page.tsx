import type { Metadata } from "next";
import { PageHead, Section } from "../_components/ui";

export const metadata: Metadata = { title: "How it works" };

const STEPS = [
  ["A supplier is verified", "The business is checked and approved by an administrator before it can list."],
  ["Products are reviewed", "Each product is approved or rejected, so sellers only see eligible items."],
  ["Sellers promote", "Sellers pick products, set prices within limits and share tracked links."],
  ["Orders are processed", "Every sale goes through one order system. Payment is confirmed before an order is marked paid."],
  ["Everyone is settled", "The supplier fulfils and adds tracking, and the backend records the commission and balances."],
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHead title="How Newvelion works" lead="Five steps carry a product from a supplier's shelf to a recorded sale." />
      <Section>
        <ol className="nv-tl">
          {STEPS.map(([t, p]) => (
            <li key={t}><h3>{t}</h3><p>{p}</p></li>
          ))}
        </ol>
      </Section>
    </>
  );
}
