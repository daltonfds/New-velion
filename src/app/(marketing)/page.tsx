import Link from "next/link";
import type { CSSProperties } from "react";
import { Section } from "./_components/ui";

const STEPS = [
  { label: "Source", h: 28, c: "#0078E8" },
  { label: "Approve", h: 46, c: "#0066D1" },
  { label: "Promote", h: 64, c: "#0052B3" },
  { label: "Sell", h: 82, c: "#003B95" },
  { label: "Deliver", h: 100, c: "#001B44" },
];

export default function HomePage() {
  return (
    <>
      <div className="nv-wrap nv-hero">
        <div>
          <h1>Supply it. Sell it. Track every rand.</h1>
          <p className="nv-lead">
            Newvelion connects suppliers in South Africa and China with sellers and affiliates, and runs the orders,
            commissions and payouts between them.
          </p>
          <div className="nv-cta">
            <Link className="nv-btn" href="/get-started">Become a supplier</Link>
            <Link className="nv-btn nv-alt" href="/get-started">Become a seller</Link>
          </div>
          <p className="nv-slogan">The climbing starts here.</p>
        </div>
        <div className="nv-stairs" role="img" aria-label="Five steps: source, approve, promote, sell, deliver">
          {STEPS.map((s, n) => (
            <i key={s.label} style={{ "--h": s.h, "--c": s.c, "--n": n } as CSSProperties}>
              <span>{s.label}</span>
            </i>
          ))}
        </div>
      </div>
      <Section title="Two sides, one ledger" sub="Suppliers and sellers each get a workspace. Everything they do together is recorded in the same place.">
        <div className="nv-cols">
          <div><h3>Suppliers</h3><p>List products, hold stock, fulfil orders and request payouts.</p></div>
          <div><h3>Sellers and affiliates</h3><p>Promote approved products with tracked links and earn commission.</p></div>
          <div><h3>Administrators</h3><p>Verify suppliers, approve products and review every payout.</p></div>
        </div>
      </Section>
    </>
  );
}
