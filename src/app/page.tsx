import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text font-sans selection:bg-primary/20">
      
      {/* ---------- Navbar ---------- */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-light-border/50">
        <div className="flex items-center gap-3">
          <VelionLogo className="w-8 h-8" />
          <span className="font-display text-xl font-semibold tracking-tight">Velion</span>
        </div>
        <div className="flex items-center gap-6 text-sm hidden md:flex">
          <Link href="#for-sellers" className="text-light-muted hover:text-light-text transition-colors">Sellers</Link>
          <Link href="#for-producers" className="text-light-muted hover:text-light-text transition-colors">Producers</Link>
          <Link href="#logistics" className="text-light-muted hover:text-light-text transition-colors">Logistics</Link>
          <Link href="/apply" className="px-5 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-transform hover:scale-105 shadow-md shadow-primary/20">Start Selling</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">

        {/* ---------- Hero Section ---------- */}
        <section className="py-24 md:py-32 text-center max-w-4xl mx-auto space-y-8">
          <div className="flex justify-center mb-2">
            <VelionLogo className="w-24 h-24" />
          </div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase font-display">Commerce Infrastructure Platform</p>
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight leading-tight text-light-text">
            The climb starts here.
          </h1>
          <p className="text-lg md:text-xl text-light-muted max-w-2xl mx-auto leading-relaxed">
            The infrastructure behind your next business. Velion connects producers and suppliers with sellers around the world, giving businesses access to products, fulfillment, warehousing, logistics, payments and Cash on Delivery through one platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/apply">
              <button className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-primary/90 transition-transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-2">
                Start Selling
              </button>
            </Link>
            <Link href="/apply?role=producer">
              <button className="w-full sm:w-auto bg-light-card border border-light-border text-light-text px-8 py-4 rounded-full font-medium hover:bg-light-bg transition-colors">
                Become a Supplier
              </button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-light-muted pt-8">
            <span>🇿🇦 South Africa</span>
            <span className="w-px h-4 bg-light-border"></span>
            <span>🌍 Global sellers</span>
            <span className="w-px h-4 bg-light-border"></span>
            <span>🌍 Global suppliers</span>
          </div>
        </section>

        {/* ---------- Value Proposition (One Platform) ---------- */}
        <section className="py-20 border-t border-light-border bg-light-card/50 rounded-3xl px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-light-text">One platform. The entire commerce chain.</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 text-left text-sm">
              <div className="bg-light-card border border-light-border p-6 rounded-xl shadow-sm"><span className="block font-bold text-primary mb-1">PRODUCER / SUPPLIER</span><p className="text-light-muted text-xs">Products &amp; Inventory</p><div className="mt-2 w-8 h-0.5 bg-primary/50"></div></div>
              <div className="bg-light-card border border-light-border p-6 rounded-xl shadow-sm border-primary/30 relative"><span className="block font-bold text-primary mb-1">VELION</span><p className="text-light-muted text-xs">Marketplace · Warehousing · Fulfillment · Payments · Logistics</p></div>
              <div className="bg-light-card border border-light-border p-6 rounded-xl shadow-sm"><span className="block font-bold text-primary mb-1">SELLER</span><p className="text-light-muted text-xs">Store · Pricing · Sales</p><div className="mt-2 w-8 h-0.5 bg-primary/50"></div></div>
              <div className="bg-light-card border border-light-border p-6 rounded-xl shadow-sm"><span className="block font-bold text-primary mb-1">CUSTOMER</span><p className="text-light-muted text-xs">Delivery · Tracking · COD</p></div>
            </div>
            <p className="text-light-muted text-sm max-w-lg mx-auto mt-4">Producer / Supplier → Velion / 3PL → Seller → Customer → Carrier → Velion → Settlements.</p>
          </div>
        </section>

        {/* ---------- For Sellers ---------- */}
        <section id="for-sellers" className="py-24 border-b border-light-border grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold font-display text-light-text">Sell without building the entire operation yourself.</h2>
            <p className="text-light-muted leading-relaxed">Choose products, set your price, and focus on selling. Velion handles the operational side so you don't have to build it from scratch.</p>
            <ul className="space-y-2 text-sm text-light-muted grid grid-cols-2 mt-4">
              <li>✓ Product marketplace</li>
              <li>✓ Inventory availability</li>
              <li>✓ Warehousing</li>
              <li>✓ Picking &amp; packing</li>
              <li>✓ Fulfillment</li>
              <li>✓ Delivery</li>
              <li>✓ Tracking</li>
              <li>✓ Cash on Delivery</li>
              <li>✓ Financial settlements</li>
              <li>✓ Returns &amp; disputes</li>
            </ul>
            <div className="pt-6"><Link href="/apply"><button className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90">Start Selling</button></Link></div>
          </div>
          <div className="bg-light-card border border-light-border p-6 rounded-xl shadow-sm flex items-center justify-center text-light-muted text-sm">Marketplace preview (coming soon)</div>
        </section>

        {/* ---------- For Producers & Suppliers ---------- */}
        <section id="for-producers" className="py-24 border-b border-light-border grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold font-display text-light-text">Your products. More sellers. More reach.</h2>
            <p className="text-light-muted leading-relaxed">Put your products in front of sellers looking for inventory to sell. Built for producers and suppliers who want to scale.</p>
            <ul className="space-y-2 text-sm text-light-muted grid grid-cols-2 mt-4">
              <li>✓ Product catalog</li>
              <li>✓ SKU &amp; variants</li>
              <li>✓ Inventory management</li>
              <li>✓ Batch &amp; expiry tracking</li>
              <li>✓ Product documentation</li>
              <li>✓ Quality &amp; compliance</li>
              <li>✓ Warehousing</li>
              <li>✓ Fulfillment</li>
              <li>✓ Sales settlements</li>
              <li>✓ Supplier wallet</li>
              <li>✓ Supplier Score</li>
              <li>✓ Verified Supplier</li>
            </ul>
            <div className="pt-6"><Link href="/apply?role=producer"><button className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90">Become a Supplier</button></Link></div>
          </div>
          <div className="bg-light-card border border-light-border p-6 rounded-xl shadow-sm flex items-center justify-center text-light-muted text-sm">Inventory preview (coming soon)</div>
        </section>

        {/* ---------- Logistics ---------- */}
        <section id="logistics" className="py-24 border-b border-light-border grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold font-display text-light-text">From warehouse to customer's door.</h2>
            <p className="text-light-muted leading-relaxed">You don't need to build a logistics operation from zero. Velion's infrastructure connects warehouse, fulfillment, carrier, and tracking seamlessly.</p>
            <ul className="space-y-2 text-sm text-light-muted mt-4">
              <li>✓ Warehouse → Fulfillment → Carrier → Tracking → Customer</li>
              <li>✓ Delivery zones</li>
              <li>✓ Multiple carriers</li>
              <li>✓ Shipment tracking</li>
              <li>✓ Delivery status</li>
              <li>✓ Failed delivery management</li>
            </ul>
          </div>
          <div className="bg-light-card border border-light-border p-6 rounded-xl shadow-sm flex items-center justify-center text-light-muted text-sm">Logistics preview (coming soon)</div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="py-24 text-center max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold font-display text-light-text">Your next opportunity is already here.</h2>
          <p className="text-light-muted text-lg">Join Velion and start building your business on top of a complete commerce infrastructure.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/apply">
              <button className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-primary/90 shadow-lg shadow-primary/25">Start Selling</button>
            </Link>
            <Link href="/apply?role=producer">
              <button className="w-full sm:w-auto bg-light-card border border-light-border text-light-text px-8 py-4 rounded-full font-medium hover:bg-light-bg transition-colors">Become a Supplier</button>
            </Link>
          </div>
        </section>

      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-light-border py-12 px-6 bg-light-card">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="space-y-3">
            <span className="font-display font-semibold text-base text-light-text">Velion</span>
            <p className="text-light-muted">About</p>
            <p className="text-light-muted">Producers</p>
            <p className="text-light-muted">Sellers</p>
            <p className="text-light-muted">Suppliers</p>
          </div>
          <div className="space-y-3">
            <span className="font-display font-semibold text-base text-light-text">Support</span>
            <p className="text-light-muted">Help Center</p>
            <p className="text-light-muted">Terms of Service</p>
            <p className="text-light-muted">Privacy Policy</p>
            <p className="text-light-muted">Contact</p>
          </div>
          <div className="space-y-3 col-span-2 md:col-span-2 md:text-right">
            <p className="text-light-muted text-xs leading-relaxed">Commerce infrastructure for producers, suppliers, and sellers.</p>
            <p className="text-light-muted text-xs">&copy; 2026 Velion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
