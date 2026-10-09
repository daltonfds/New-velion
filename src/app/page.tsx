import Link from "next/link";
import "./newvelion-home.css";

function Logo() {
  return (
    <Link href="/" className="nv-new-logo" aria-label="Newvelion home">
      <span className="nv-new-mark" aria-hidden="true"><i /><i /><i /></span>
      <strong>newvelion</strong>
    </Link>
  );
}

const platformFeatures = [
  { title: "Marketplace & product discovery", description: "Discover available products and review the details before you buy or choose what to sell.", href: "/marketplace", link: "Explore products" },
  { title: "Product & inventory management", description: "Give suppliers a place to manage product information, catalog details and stock.", href: "/become-supplier", link: "Supplier access" },
  { title: "Seller & affiliate tools", description: "Explore products to sell and manage your seller activity through your account.", href: "/register", link: "Start selling" },
  { title: "Order management", description: "Keep track of purchases and follow order progress from your account.", href: "/login", link: "Manage orders" },
  { title: "Shipping & fulfillment", description: "Connect product supply and order handling for delivery across South Africa.", href: "/support", link: "Learn more" },
  { title: "Checkout & payments", description: "Move from product selection toward checkout through the available purchasing flow.", href: "/cart", link: "View your cart" },
  { title: "Supplier & seller connections", description: "Bring product owners and businesses together through a shared commerce marketplace.", href: "/become-supplier", link: "Become a supplier" },
  { title: "Integrations & APIs", description: "Build toward connected commerce workflows with Newvelion integration capabilities.", href: "/support", link: "Contact support" },
  { title: "Customer accounts", description: "Create an account to manage your shopping activity and order information.", href: "/register/customer", link: "Create an account" },
  { title: "Business account access", description: "Sign in to reach the tools available to your Newvelion account and role.", href: "/login", link: "Sign in" },
];

export default function HomePage() {
  return (
    <main className="nv-new-home nv-buygoods-home">
      <div className="nv-new-topbar">Newvelion · Commerce infrastructure for South Africa</div>
      <header className="nv-new-header">
        <div className="nv-new-header-inner">
          <Logo />
          <nav aria-label="Main navigation">
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/become-supplier">Suppliers</Link>
            <Link href="/register">Sell with us</Link>
            <Link href="/support">Help</Link>
          </nav>
          <div className="nv-new-header-actions">
            <Link href="/login">Sign in</Link>
            <Link href="/register/customer" className="nv-new-button">Create account</Link>
          </div>
        </div>
      </header>

      <section className="nv-bg-hero">
        <div className="nv-bg-hero-copy">
          <span className="nv-bg-eyebrow">THE NEWVELION PLATFORM</span>
          <h1>Commerce infrastructure for businesses ready to grow.</h1>
          <p>Newvelion connects customers, sellers and suppliers through one commerce platform — helping people discover products, build businesses and manage their commerce activity.</p>
          <div className="nv-bg-actions">
            <Link href="/marketplace" className="nv-new-button nv-bg-primary">Explore the marketplace</Link>
            <Link href="/register" className="nv-bg-text-link">Start selling <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="nv-bg-hero-art" aria-label="Newvelion commerce platform overview">
          <div className="nv-bg-art-header"><span className="nv-bg-dot" /><span>NEWVELION</span><span className="nv-bg-art-label">COMMERCE PLATFORM</span></div>
          <div className="nv-bg-art-main">
            <div className="nv-bg-art-title"><span>One platform for</span><strong>connected commerce</strong></div>
            <div className="nv-bg-art-card nv-bg-art-card-one"><span className="nv-bg-art-icon">⌕</span><div><strong>Discover products</strong><small>Explore the marketplace</small></div></div>
            <div className="nv-bg-art-card nv-bg-art-card-two"><span className="nv-bg-art-icon">↗</span><div><strong>Build your business</strong><small>Sell or supply products</small></div></div>
          </div>
          <div className="nv-bg-art-footer"><span>Customers</span><i /><span>Sellers</span><i /><span>Suppliers</span></div>
        </div>
      </section>

      <section className="nv-bg-roles">
        <div className="nv-bg-section-intro">
          <span className="nv-bg-eyebrow">BUILT FOR YOUR ROLE</span>
          <h2>One platform. Different ways to grow.</h2>
          <p>Choose the path that matches what you want to do with Newvelion.</p>
        </div>
        <div className="nv-bg-role-grid">
          <article className="nv-bg-role-card">
            <span className="nv-bg-role-kicker">FOR CUSTOMERS</span>
            <h3>Shop with confidence.</h3>
            <p>Browse available products, review product information and manage your purchases through your customer account.</p>
            <Link href="/marketplace" className="nv-bg-card-link">Explore products <span>→</span></Link>
          </article>
          <article className="nv-bg-role-card nv-bg-role-featured">
            <span className="nv-bg-role-kicker">FOR SELLERS & AFFILIATES</span>
            <h3>Build your business around products.</h3>
            <p>Explore products to sell and manage your seller activity through the tools available to your account.</p>
            <Link href="/register" className="nv-bg-card-link">Become a seller <span>→</span></Link>
          </article>
          <article className="nv-bg-role-card">
            <span className="nv-bg-role-kicker">FOR SUPPLIERS & PRODUCT OWNERS</span>
            <h3>Bring products to market.</h3>
            <p>Register as a supplier and manage your catalog and order activity through Newvelion.</p>
            <Link href="/become-supplier" className="nv-bg-card-link">Join as a supplier <span>→</span></Link>
          </article>
        </div>
      </section>

      <section className="nv-bg-platform">
        <div className="nv-bg-section-intro nv-bg-platform-intro">
          <span className="nv-bg-eyebrow">THE NEWVELION TOOLKIT</span>
          <h2>Commerce, organized in one place.</h2>
          <p>Explore the core areas designed to support shopping, selling, supply and connected commerce.</p>
        </div>
        <div className="nv-bg-feature-grid">
          {platformFeatures.map((feature, index) => (
            <article className="nv-bg-feature" key={feature.title}>
              <span className={`nv-bg-feature-icon nv-bg-feature-icon-${(index % 4) + 1}`} aria-hidden="true">{["⌕", "◇", "↗", "□"][index % 4]}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link href={feature.href}>{feature.link} <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="nv-bg-how">
        <div className="nv-bg-section-intro">
          <span className="nv-bg-eyebrow">HOW NEWVELION WORKS</span>
          <h2>A clearer path from discovery to delivery.</h2>
          <p>Newvelion brings key commerce activities together in a simple, connected journey.</p>
        </div>
        <div className="nv-bg-steps">
          <article><span>01</span><h3>Discover</h3><p>Customers browse products while sellers and affiliates explore opportunities to offer products.</p></article>
          <article><span>02</span><h3>Connect</h3><p>Suppliers, sellers and customers use the platform according to their account and role.</p></article>
          <article><span>03</span><h3>Manage</h3><p>Use your account to access available order, product and business workflows.</p></article>
        </div>
      </section>

      <section className="nv-bg-final-cta">
        <div>
          <span className="nv-bg-eyebrow">THE CLIMBING STARTS HERE</span>
          <h2>Build your next step with Newvelion.</h2>
          <p>Start by shopping, create a seller account, or bring your products to the marketplace.</p>
        </div>
        <div className="nv-bg-final-actions">
          <Link href="/register/customer" className="nv-new-button nv-bg-primary">Create customer account</Link>
          <Link href="/become-supplier" className="nv-bg-text-link">Become a supplier <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <footer className="nv-conversion-footer nv-bg-footer">
        <div className="nv-conversion-footer-main">
          <div className="nv-conversion-footer-brand"><Logo /><p>Commerce infrastructure for customers, sellers and suppliers.</p></div>
          <div><strong>Marketplace</strong><Link href="/marketplace">Browse products</Link><Link href="/cart">Cart</Link><Link href="/wishlist">Wishlist</Link></div>
          <div><strong>Your account</strong><Link href="/register/customer">Create customer account</Link><Link href="/login">Sign in</Link><Link href="/support">Help &amp; Support</Link></div>
          <div><strong>Business</strong><Link href="/register">Sell with Newvelion</Link><Link href="/become-supplier">Become a supplier</Link></div>
        </div>
        <div className="nv-conversion-footer-bottom"><span>© {new Date().getFullYear()} Newvelion. All rights reserved.</span><span>Commerce infrastructure</span></div>
      </footer>
    </main>
  );
}
