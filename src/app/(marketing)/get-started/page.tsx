import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "../_components/ui";
import { LOGIN_HREF, REGISTER_HREF } from "../_components/links";

export const metadata: Metadata = { title: "Get started" };

export default function GetStartedPage() {
  return (
    <>
      <PageHead title="Start climbing" lead="Choose how you want to work with Newvelion." />
      <div className="nv-wrap" style={{ paddingBottom: 56 }}>
        <div className="nv-two">
          <div className="nv-panel nv-k">
            <h2>I supply products</h2>
            <p>Apply, get verified and list products from South Africa or China.</p>
            <Link className="nv-btn" href={REGISTER_HREF}>Register as supplier</Link>
          </div>
          <div className="nv-panel">
            <h2>I sell or promote</h2>
            <p>Browse approved products, share tracked links and earn commission.</p>
            <Link className="nv-btn" href={REGISTER_HREF}>Register as seller</Link>
          </div>
        </div>
        <p className="nv-sub" style={{ margin: "22px 0 0" }}>
          Already registered? <Link href={LOGIN_HREF} style={{ color: "var(--nv-accent)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </>
  );
}
