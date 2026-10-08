import Link from "next/link";

const categories = [
  ["Health & Beauty", "Explore products"],
  ["Home & Lifestyle", "Explore products"],
  ["Electronics", "Explore products"],
  ["Fitness", "Explore products"],
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
    <main className="nv-new-home">
      <div className="nv-new-topbar">Commerce infrastructure for South Africa</div>

      <header className="nv-new-header">
        <div className="nv-new-header-inner">
          <Logo />
          <nav>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/register">For Sellers</Link>
            <Link href="/become-supplier">For Suppliers</Link>
            <Link href="/support">Support</Link>
          </nav>
          <div className="nv-new-header-actions">
            <Link href="/login">Log in</Link>
            <Link href="/register" className="nv-new-button">Sign up</Link>
          </div>
        </div>
      </header>

      <section className="nv-new-hero">
        <div className="nv-new-hero-inner">
          <div className="nv-new-hero-copy">
            <span className="nv-new-kicker">THE COMMERCE PLATFORM</span>
            <h1>Find products.<br /><span>Build sales.</span></h1>
            <p>Newvelion connects products, suppliers, sellers and customers in one commerce ecosystem built for South Africa.</p>
            <div className="nv-new-actions">
              <Link href="/marketplace" className="nv-new-button nv-new-button-large">Explore marketplace</Link>
              <Link href="/register" className="nv-new-outline">Start selling</Link>
            </div>
            <div className="nv-new-proof">
              <span>✓ Products</span><span>✓ Affiliate selling</span><span>✓ Fulfillment</span>
            </div>
          </div>
          <div className="nv-new-hero-card">
            <div className="nv-new-search"><span>Search products, categories...</span><b>Search</b></div>
            <div className="nv-new-card-head"><strong>Popular on Newvelion</strong><Link href="/marketplace">View all</Link></div>
            <div className="nv-new-product-row">
              <div className="nv-new-product-image">NEW</div>
              <div><strong>Discover products ready to sell</strong><span>Choose a product and start promoting.</span><b>View marketplace →</b></div>
            </div>
            <div className="nv-new-mini-grid">
              <div><span>01</span><strong>Choose</strong><small>Find products</small></div>
              <div><span>02</span><strong>Sell</strong><small>Share your link</small></div>
              <div><span>03</span><strong>Grow</strong><small>Track your sales</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="nv-new-section">
        <div className="nv-new-section-head">
          <div><span className="nv-new-kicker">SHOP THE MARKETPLACE</span><h2>Explore what is selling.</h2></div>
          <Link href="/marketplace">View marketplace →</Link>
        </div>
        <div className="nv-new-category-grid">
          {categories.map(([title, sub]) => (
            <Link href="/marketplace" className="nv-new-category" key={title}>
              <span className="nv-new-category-icon">↗</span><strong>{title}</strong><small>{sub}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="nv-new-seller">
        <div>
          <span className="nv-new-kicker">FOR SELLERS & AFFILIATES</span>
          <h2>Turn great products into your next sale.</h2>
          <p>Choose products from the marketplace, promote them with your affiliate link and manage your commerce activity from one place.</p>
          <Link href="/register" className="nv-new-button">Become a seller</Link>
        </div>
        <div className="nv-new-dashboard-card">
          <div className="nv-new-dash-top"><strong>Seller overview</strong><span>● Live</span></div>
          <div className="nv-new-dash-number"><small>Available balance</small><strong>R 12,480</strong></div>
          <div className="nv-new-dash-bars"><i /><i /><i /><i /><i /><i /><i /></div>
          <div className="nv-new-dash-bottom"><span>Sales <b>+24.8%</b></span><span>Orders <b>128</b></span></div>
        </div>
      </section>

      <section className="nv-new-supplier">
        <div className="nv-new-supplier-copy">
          <span className="nv-new-kicker">FOR SUPPLIERS</span>
          <h2>Put your products in front of more sellers.</h2>
          <p>Register your company, submit your catalog for approval and build a distribution channel through Newvelion.</p>
          <Link href="/become-supplier" className="nv-new-outline nv-new-outline-dark">Become a supplier →</Link>
        </div>
        <div className="nv-new-steps">
          <div><b>01</b><strong>Register your business</strong><span>Company and responsible-person details.</span></div>
          <div><b>02</b><strong>Submit products</strong><span>Build your catalog and pricing.</span></div>
          <div><b>03</b><strong>Fulfill orders</strong><span>Manage delivery and tracking.</span></div>
        </div>
      </section>

      <section className="nv-new-final">
        <span className="nv-new-kicker">NEWVELION</span>
        <h2>Commerce starts with the right infrastructure.</h2>
        <p>One platform for products, selling, orders and fulfillment.</p>
        <div><Link href="/marketplace" className="nv-new-button">Explore marketplace</Link><Link href="/register" className="nv-new-outline">Create account</Link></div>
      </section>

      <footer className="nv-new-footer">
        <div><Logo /><p>Commerce infrastructure.</p></div>
        <div><strong>Platform</strong><Link href="/marketplace">Marketplace</Link><Link href="/register">For Sellers</Link><Link href="/become-supplier">For Suppliers</Link></div>
        <div><strong>Company</strong><Link href="/support">Support</Link><Link href="/login">Log in</Link></div>
      </footer>
    </main>
  );
}
