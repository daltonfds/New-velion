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
  { title: "Product marketplace", description: "Explore products and find the details you need before placing an order.", href: "/marketplace", link: "Explore products" },
  { title: "Seller tools", description: "Choose products to sell and manage your activity from your account.", href: "/register", link: "Start selling" },
  { title: "Supplier tools", description: "Bring your products to the marketplace and manage your catalog.", href: "/become-supplier", link: "Become a supplier" },
  { title: "Orders and fulfillment", description: "Follow your orders and the next steps through your Newvelion account.", href: "/login", link: "Access your account" },
];

export default function HomePage() {
  return (
    <main className="nv-new-home nv-buygoods-home">
      <div className="nv-new-topbar">Newvelion marketplace · Shopping and selling across South Africa</div>
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
          <span className="nv-bg-eyebrow">THE NEWVELION MARKETPLACE</span>
          <h1>Find products.<br />Sell with purpose.</h1>
          <p>Newvelion brings customers, sellers and suppliers together in one place to discover products and manage commerce.</p>
          <div className="nv-bg-actions">
            <Link href="/marketplace" className="nv-new-button nv-bg-primary">Explore the marketplace</Link>
            <Link href="/register" className="nv-bg-text-link">Start selling <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="nv-bg-hero-art" aria-label="Newvelion marketplace overview">
          <div className="nv-bg-art-header"><span className="nv-bg-dot" /><span>NEWVELION</span><span className="nv-bg-art-label">MARKETPLACE</span></div>
          <div className="nv-bg-art-main">
            <div className="nv-bg-art-title"><span>One place for</span><strong>commerce</strong></div>
            <div className="nv-bg-art-card nv-bg-art-card-one"><span className="nv-bg-art-icon">↗</span><div><strong>Discover products</strong><small>Browse the marketplace</small></div></div>
            <div className="nv-bg-art-card nv-bg-art-card-two"><span className="nv-bg-art-icon">◇</span><div><strong>Build your business</strong><small>Sell or supply products</small></div></div>
          </div>
          <div className="nv-bg-art-footer"><span>Customers</span><i /><span>Sellers</span><i /><span>Suppliers</span></div>
        </div>
      </section>

      <section className="nv-bg-roles">
        <div className="nv-bg-section-intro">
          <span className="nv-bg-eyebrow">HOW YOU CAN USE NEWVELION</span>
          <h2>One platform. Different ways to grow.</h2>
          <p>Whether you want to shop or build a business, start with the path that fits you.</p>
        </div>
        <div className="nv-bg-role-grid">
          <article className="nv-bg-role-card">
            <span className="nv-bg-role-kicker">FOR CUSTOMERS</span>
            <h3>Find what you’re looking for.</h3>
            <p>Browse available products, review product information and manage your orders in your customer account.</p>
            <Link href="/marketplace" className="nv-bg-card-link">Shop products <span>→</span></Link>
          </article>
          <article className="nv-bg-role-card nv-bg-role-featured">
            <span className="nv-bg-role-kicker">FOR SELLERS & AFFILIATES</span>
            <h3>Turn products into your business.</h3>
            <p>Explore products to sell, manage your selling activity and access your account tools.</p>
            <Link href="/register" className="nv-bg-card-link">Start selling <span>→</span></Link>
          </article>
          <article className="nv-bg-role-card">
            <span className="nv-bg-role-kicker">FOR SUPPLIERS</span>
            <h3>Bring your products to market.</h3>
            <p>Register as a supplier and use Newvelion to work with your product catalog and orders.</p>
            <Link href="/become-supplier" className="nv-bg-card-link">Join as a supplier <span>→</span></Link>
          </article>
        </div>
      </section>

      <section className="nv-bg-platform">
        <div className="nv-bg-section-intro nv-bg-platform-intro">
          <span className="nv-bg-eyebrow">ONE SIMPLE PLATFORM</span>
          <h2>Commerce, organized in one place.</h2>
          <p>Explore the tools available for shopping, selling and supplying products.</p>
        </div>
        <div className="nv-bg-feature-grid">
          {platformFeatures.map((feature, index) => (
            <article className="nv-bg-feature" key={feature.title}>
              <span className={`nv-bg-feature-icon nv-bg-feature-icon-${index + 1}`} aria-hidden="true">{["⌕", "↗", "◇", "□"][index]}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link href={feature.href}>{feature.link} <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="nv-bg-final-cta">
        <div>
          <span className="nv-bg-eyebrow">GET STARTED WITH NEWVELION</span>
          <h2>Ready to get started?</h2>
          <p>Create a customer account to shop, or register to start selling or supplying products.</p>
        </div>
        <div className="nv-bg-final-actions">
          <Link href="/register/customer" className="nv-new-button nv-bg-primary">Create customer account</Link>
          <Link href="/register" className="nv-bg-text-link">Create a seller account <span aria-hidden="true">→</span></Link>
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
