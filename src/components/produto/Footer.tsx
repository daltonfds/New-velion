import Link from "next/link";

export default function Footer() {
  return <footer className="nv-footer">
    <div className="nv-container nv-footer-grid">
      <div><div className="nv-logo footer-logo"><span className="nv-mark" aria-hidden="true"><i/><i/><i/></span><span>Newvelion</span></div><p>Commerce infrastructure for modern commerce, sourcing and fulfillment.</p></div>
      <div><b>Customer Service</b><Link href="/support">Help & Support</Link><Link href="/account">My Account</Link><Link href="/marketplace">Delivery</Link></div>
      <div><b>About Newvelion</b><Link href="/fornecedores">Suppliers</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div>
      <div><b>Business</b><Link href="/register/supplier">Become a Supplier</Link><Link href="/register">Become a Seller</Link><Link href="/register/customer">Business Account</Link></div>
    </div>
    <div className="nv-container nv-newsletter"><div><b>Stay in the know</b><span>Get Newvelion deals and new arrivals.</span></div><form><input type="email" aria-label="Email address" placeholder="Email address"/><button type="submit">Subscribe</button></form></div>
    <div className="nv-container nv-copyright">© 2026 Newvelion. All rights reserved. · Secure checkout · SSL protected</div>
  </footer>;
}
