import { Briefcase, ShieldCheck, Store, Truck } from "lucide-react";
import Link from "next/link";

const trustItems = [
  { title: "Secure checkout", detail: "Protected payments", Icon: ShieldCheck },
  { title: "South Africa delivery", detail: "Verified suppliers", Icon: Truck },
  { title: "Business buying", detail: "Built for sourcing", Icon: Briefcase },
  { title: "Real marketplace data", detail: "Real products and listings", Icon: Store },
];

export default function Footer() {
  return (
    <footer className="nv-retail-footer">
      <div className="nv-retail-footer-benefits" aria-label="Newvelion shopping benefits">
        {trustItems.map((item) => (
          <div className="nv-retail-benefit" key={item.title}>
            <span className="nv-retail-benefit-icon" aria-hidden="true"><item.Icon className="h-[18px] w-[18px]" strokeWidth={1.75} /></span>
            <div><b>{item.title}</b><span>{item.detail}</span></div>
          </div>
        ))}
      </div>
      <div className="nv-retail-footer-main">
        <div className="nv-retail-footer-grid">
          <div className="nv-retail-footer-brand">
            <Link href="/" className="nv-retail-footer-logo" aria-label="Newvelion home">
              <span className="nv-retail-mark"><i/><i/><i/></span><strong>newvelion</strong>
            </Link>
            <p>Commerce infrastructure for modern commerce, sourcing and fulfillment.</p>
          </div>
          <div className="nv-retail-footer-links"><b>Customer Service</b><Link href="/support">Help &amp; Support</Link><Link href="/account">My Account</Link><Link href="/terms">Terms</Link></div>
          <div className="nv-retail-footer-links"><b>Shop</b><Link href="/wishlist">Wishlist</Link><Link href="/cart">Cart</Link></div>
          <div className="nv-retail-footer-links"><b>Business</b><Link href="/fornecedores">Become a Supplier</Link><Link href="/register">Become a Seller</Link><Link href="/register/customer">Business Account</Link></div>
        </div>
        <div className="nv-retail-footer-bottom"><span>© {new Date().getFullYear()} Newvelion. All rights reserved.</span><span>Commerce infrastructure</span></div>
      </div>
    </footer>
  );
}
