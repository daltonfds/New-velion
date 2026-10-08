import Link from "next/link";

function Icon({
  name,
  size = 22,
}: {
  name:
    | "menu"
    | "arrow"
    | "chart"
    | "shopping"
    | "truck"
    | "wallet"
    | "support"
    | "shield"
    | "users"
    | "close";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths = {
    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 3-4 3 2 5-7" />
      </>
    ),
    shopping: (
      <>
        <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.5L20.5 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v10H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5z" />
        <path d="M4 8h15" />
        <path d="M16 13h5" />
        <circle cx="16" cy="13" r=".6" />
      </>
    ),
    support: (
      <>
        <path d="M4 13a8 8 0 0 1 16 0" />
        <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H4Z" />
        <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h3Z" />
        <path d="M15 19c-.5 1-1.5 1.5-3 1.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3.3 8.4-8 10-4.7-1.6-8-5-8-10V6z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20c.6-3.2 2.4-5 5.5-5s4.9 1.8 5.5 5" />
        <path d="M15 6.5a3 3 0 0 1 0 5.8" />
        <path d="M16 15c2.6.4 4.2 2 4.7 5" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function Logo({light = false}: {light?: boolean}) {
  return (
    <Link href="/" className={`nv-home-logo ${light ? "is-light" : ""}`} aria-label="Newvelion home">
      <span className="nv-home-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <strong>newvelion</strong>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="nv-home">
      <header className="nv-home-header">
        <div className="nv-home-header-inner">
          <Logo />
          <nav className="nv-home-nav" aria-label="Primary navigation">
            <Link href="/register">Become a Seller</Link>
            <Link href="/fornecedores">Become a Supplier</Link>
            <Link href="/support">Support</Link>
          </nav>
          <div className="nv-home-actions">
            <Link href="/login" className="nv-home-login">Login</Link>
            <Link href="/register" className="nv-home-signup">Sign Up</Link>
          </div>
          <details className="nv-home-menu">
            <summary aria-label="Open menu">
              <Icon name="menu" size={25} />
            </summary>
            <div className="nv-home-drawer">
              <div className="nv-home-drawer-head">
                <Logo />
                <span aria-hidden="true"><Icon name="close" size={21} /></span>
              </div>
              <div className="nv-home-drawer-section">
                <span className="nv-home-drawer-label">Newvelion</span>
                <Link href="/register"><Icon name="users" size={19} /> Become a Seller</Link>
                <Link href="/fornecedores"><Icon name="shopping" size={19} /> Become a Supplier</Link>
                <Link href="/login"><Icon name="shield" size={19} /> Sign in</Link>
              </div>
              <div className="nv-home-drawer-section">
                <span className="nv-home-drawer-label">Platform</span>
                <a href="#platform"><Icon name="chart" size={19} /> Performance & analytics</a>
                <a href="#platform"><Icon name="shopping" size={19} /> Commerce tools</a>
                <a href="#platform"><Icon name="truck" size={19} /> Fulfillment & delivery</a>
                <a href="#platform"><Icon name="wallet" size={19} /> Commissions & withdrawals</a>
              </div>
              <div className="nv-home-drawer-section">
                <span className="nv-home-drawer-label">Support</span>
                <Link href="/support"><Icon name="support" size={19} /> Help & Support</Link>
                <a href="mailto:contact@newvelion.com"><Icon name="support" size={19} /> contact@newvelion.com</a>
                <a href="tel:+27722958915"><Icon name="support" size={19} /> +27 72 295 8915</a>
              </div>
            </div>
          </details>
        </div>
      </header>

      <section className="nv-home-hero">
        <div className="nv-home-hero-inner">
          <div className="nv-home-hero-copy">
            <span className="nv-home-eyebrow">COMMERCE INFRASTRUCTURE</span>
            <h1>Scale your commerce. Empower your growth.</h1>
            <p>
              Newvelion brings suppliers, sellers and customers together with
              tools for commerce, product promotion, commissions, orders and
              fulfillment.
            </p>
            <div className="nv-home-hero-actions">
              <Link href="/register" className="nv-home-primary">
                Become a Seller <Icon name="arrow" size={18} />
              </Link>
              <Link href="/fornecedores" className="nv-home-secondary">
                Become a Supplier
              </Link>
            </div>
          </div>

          <div className="nv-home-hero-panel" aria-label="Newvelion platform">
            <div className="nv-home-hero-panel-top">
              <span>NEWVELION</span>
              <Icon name="chart" size={20} />
            </div>
            <div className="nv-home-bars" aria-hidden="true">
              <span style={{height: "38%"}} />
              <span style={{height: "56%"}} />
              <span style={{height: "73%"}} />
              <span style={{height: "91%"}} />
            </div>
            <div className="nv-home-hero-panel-footer">
              <strong>Commerce infrastructure</strong>
              <span>Built for suppliers, sellers and customers.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="nv-home-section" id="platform">
        <div className="nv-home-section-head">
          <span className="nv-home-eyebrow">YOUR GROWTH PARTNER</span>
          <h2>Built for commerce. Connected from sale to fulfillment.</h2>
          <p>
            Newvelion supports the core activities already available across
            the platform, from product promotion and commissions to orders,
            delivery and support.
          </p>
        </div>

        <div className="nv-home-feature-grid">
          <article>
            <span className="nv-home-icon"><Icon name="shopping" /></span>
            <h3>Commerce tools</h3>
            <p>Products, accounts, carts, checkout and orders in one platform.</p>
          </article>
          <article>
            <span className="nv-home-icon"><Icon name="chart" /></span>
            <h3>Seller & affiliate activity</h3>
            <p>Promote products, use affiliate links and manage commissions.</p>
          </article>
          <article>
            <span className="nv-home-icon"><Icon name="truck" /></span>
            <h3>Fulfillment & delivery</h3>
            <p>Support delivery, fulfillment and tracking for customer orders.</p>
          </article>
          <article>
            <span className="nv-home-icon"><Icon name="wallet" /></span>
            <h3>Commissions & withdrawals</h3>
            <p>Platform workflows for commissions and seller withdrawals.</p>
          </article>
        </div>
      </section>

      <section className="nv-home-split">
        <div>
          <span className="nv-home-eyebrow">FOR SUPPLIERS & SELLERS</span>
          <h2>One platform for the people who make commerce move.</h2>
          <p>
            Suppliers can manage products and fulfillment workflows. Sellers
            can promote products, manage affiliate activity and commissions.
          </p>
          <div className="nv-home-split-actions">
            <Link href="/fornecedores" className="nv-home-primary">
              Become a Supplier <Icon name="arrow" size={18} />
            </Link>
            <Link href="/register" className="nv-home-secondary">
              Become a Seller
            </Link>
          </div>
        </div>
        <div className="nv-home-role-card">
          <div><Icon name="users" size={20} /><span>Suppliers</span></div>
          <div><Icon name="chart" size={20} /><span>Sellers & affiliates</span></div>
          <div><Icon name="shopping" size={20} /><span>Customers</span></div>
        </div>
      </section>

      <section className="nv-home-support">
        <div className="nv-home-support-icon"><Icon name="support" size={30} /></div>
        <div>
          <span className="nv-home-eyebrow">COMMUNITY & SUPPORT</span>
          <h2>Real support when you need it.</h2>
          <p>
            Newvelion support covers seller and affiliate accounts, product
            promotion, commissions, withdrawals, checkout, delivery,
            transactions and buyer protection.
          </p>
        </div>
        <Link href="/support" className="nv-home-primary">
          Contact Support <Icon name="arrow" size={18} />
        </Link>
      </section>

      <section className="nv-home-cta">
        <span className="nv-home-eyebrow">NEWVELION</span>
        <h2>Ready to build on Newvelion?</h2>
        <p>Choose the path that fits your role on the platform.</p>
        <div>
          <Link href="/register" className="nv-home-primary">Become a Seller</Link>
          <Link href="/fornecedores" className="nv-home-secondary">Become a Supplier</Link>
        </div>
      </section>

      <footer className="nv-home-footer">
        <div className="nv-home-footer-inner">
          <div>
            <Logo light />
            <p>Commerce infrastructure.</p>
          </div>
          <div>
            <strong>Explore</strong>
            <Link href="/register">Become a Seller</Link>
            <Link href="/fornecedores">Become a Supplier</Link>
            <Link href="/login">Login</Link>
          </div>
          <div>
            <strong>Support</strong>
            <Link href="/support">Help & Support</Link>
            <a href="mailto:contact@newvelion.com">contact@newvelion.com</a>
            <a href="tel:+27722958915">+27 72 295 8915</a>
          </div>
        </div>
        <div className="nv-home-footer-bottom">© 2026 Newvelion. All rights reserved.</div>
      </footer>
    </main>
  );
}
