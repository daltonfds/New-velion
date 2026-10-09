import Link from "next/link";

const categories = [
  { title: "Health & Wellness", detail: "Everyday essentials" },
  { title: "Home & Living", detail: "Made for your space" },
  { title: "Electronics", detail: "Useful tech and accessories" },
  { title: "Fitness", detail: "Gear for active living" },
];

function Logo() {
  return (
    <Link href="/" className="nv-new-logo" aria-label="Newvelion home">
      <span className="nv-new-mark" aria-hidden="true"><i /><i /><i /></span>
      <strong>newvelion</strong>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="nv-new-home nv-conversion-home">
      <div className="nv-new-topbar">Shop online with confidence • Delivery across South Africa</div>
      <header className="nv-new-header">
        <div className="nv-new-header-inner">
          <Logo />
          <nav aria-label="Main navigation">
            <Link href="/marketplace">Shop products</Link>
            <Link href="/become-supplier">Suppliers</Link>
            <Link href="/support">Help</Link>
          </nav>
          <div className="nv-new-header-actions">
            <Link href="/login">Sign in</Link>
            <Link href="/register/customer" className="nv-new-button">Create account</Link>
          </div>
        </div>
      </header>

      <section className="nv-conversion-hero">
        <div className="nv-conversion-hero-copy">
          <span className="nv-conversion-eyebrow">THE NEWVELION MARKETPLACE</span>
          <h1>Find what you need.<br /><em>Shop with confidence.</em></h1>
          <p>Discover products from marketplace suppliers, compare your options and shop in one simple place.</p>
          <div className="nv-conversion-ctas">
            <Link href="/marketplace" className="nv-new-button nv-conversion-primary">Shop products</Link>
            <Link href="/register" className="nv-conversion-secondary">Start selling <span aria-hidden="true">→</span></Link>
          </div>
          <div className="nv-conversion-trust">
            <span><b aria-hidden="true">✓</b> Secure checkout</span>
            <span><b aria-hidden="true">✓</b> South Africa delivery</span>
            <span><b aria-hidden="true">✓</b> Product details upfront</span>
          </div>
        </div>
        <div className="nv-conversion-visual" aria-label="Shop Newvelion products">
          <div className="nv-conversion-visual-top"><span>NEWVELION</span><span>SHOP ONLINE</span></div>
          <div className="nv-conversion-visual-body">
            <span className="nv-conversion-circle nv-conversion-circle-one" />
            <span className="nv-conversion-circle nv-conversion-circle-two" />
            <div className="nv-conversion-package"><span className="nv-new-mark" aria-hidden="true"><i /><i /><i /></span><strong>newvelion</strong><small>GOOD FINDS. SIMPLE SHOPPING.</small></div>
          </div>
          <div className="nv-conversion-visual-bottom"><span>Explore the marketplace</span><Link href="/marketplace">Browse products ↗</Link></div>
        </div>
      </section>

      <section className="nv-conversion-categories">
        <div className="nv-conversion-section-heading">
          <div><span className="nv-conversion-eyebrow">DISCOVER MORE</span><h2>Shop by category</h2></div>
          <Link href="/marketplace">View all products <span aria-hidden="true">→</span></Link>
        </div>
        <div className="nv-conversion-category-grid">
          {categories.map((category, index) => (
            <Link href="/marketplace" className="nv-conversion-category" key={category.title}>
              <span className={`nv-conversion-category-art nv-conversion-art-${index + 1}`} aria-hidden="true"><i /></span>
              <span className="nv-conversion-category-copy"><strong>{category.title}</strong><small>{category.detail}</small></span>
              <span className="nv-conversion-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="nv-conversion-business">
        <div>
          <span className="nv-conversion-eyebrow">GROW WITH NEWVELION</span>
          <h2>Have products to sell?</h2>
          <p>Bring your products to the marketplace or build your sales through Newvelion. Manage your business from one place.</p>
        </div>
        <div className="nv-conversion-business-actions">
          <Link href="/register" className="nv-new-button">Become a seller</Link>
          <Link href="/become-supplier" className="nv-conversion-business-link">Register as a supplier →</Link>
        </div>
      </section>

      <footer className="nv-conversion-footer">
        <div className="nv-conversion-footer-main">
          <div className="nv-conversion-footer-brand"><Logo /><p>Products, selling and fulfillment — all in one place.</p></div>
          <div><strong>Shop</strong><Link href="/marketplace">Marketplace</Link><Link href="/wishlist">Wishlist</Link><Link href="/cart">Cart</Link></div>
          <div><strong>Your account</strong><Link href="/register/customer">Create customer account</Link><Link href="/login">Sign in</Link><Link href="/support">Help &amp; Support</Link></div>
          <div><strong>Business</strong><Link href="/register">Become a seller</Link><Link href="/become-supplier">Become a supplier</Link></div>
        </div>
        <div className="nv-conversion-footer-bottom"><span>© {new Date().getFullYear()} Newvelion. All rights reserved.</span><span>Commerce infrastructure</span></div>
      </footer>
    </main>
  );
}
