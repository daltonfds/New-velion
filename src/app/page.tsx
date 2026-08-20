import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text font-sans selection:bg-primary/20">
      
      {/* ---------- Header / Menu ---------- */}
      <header className="fixed inset-x-0 top-0 z-40 bg-light-bg/80 backdrop-blur-sm border-b border-light-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <VelionLogo className="w-8 h-8" />
            <span className="font-display text-lg font-semibold tracking-tight text-light-text">Velion</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-light-muted">
            <Link href="#sellers" className="hover:text-light-text transition-colors">Sellers</Link>
            <Link href="#producers" className="hover:text-light-text transition-colors">Producers / Suppliers</Link>
            <Link href="/login" className="hover:text-light-text transition-colors">Login</Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative group hidden md:block">
              <button className="text-sm font-medium text-light-muted hover:text-light-text transition-colors flex items-center gap-1">
                Support
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 bg-light-card border border-light-border rounded-xl shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <p className="text-xs font-semibold text-light-muted uppercase tracking-wider mb-2">Contact</p>
                <a href="mailto:daltonfelizarda66@gmail.com" className="flex items-center gap-2 text-sm text-light-text hover:text-primary py-1 transition-colors">
                  <span className="text-primary">✉</span> daltonfelizarda66@gmail.com
                </a>
                <a href="https://wa.me/27722958915" target="_blank" className="flex items-center gap-2 text-sm text-light-text hover:text-primary py-1 transition-colors">
                  <span className="text-primary">📱</span> +27722958915
                </a>
                <a href="https://instagram.com/dalton_fds" target="_blank" className="flex items-center gap-2 text-sm text-light-text hover:text-primary py-1 transition-colors">
                  <span className="text-primary">📷</span> @dalton_fds
                </a>
              </div>
            </div>
            <Link href="/apply">
              <button className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-md shadow-primary/20">
                Start Selling
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 max-w-7xl mx-auto px-6">

        {/* ---------- HERO SECTION ---------- */}
        <section className="py-20 md:py-28 text-center max-w-4xl mx-auto space-y-8">
          <div className="flex justify-center">
            <VelionLogo className="w-24 h-24" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-[0.15em] text-primary uppercase font-display">
              Commerce Infrastructure Platform
            </p>
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight leading-[1.1] text-light-text">
              The climb starts here.
            </h1>
          </div>
          <p className="text-base md:text-lg text-light-muted max-w-2xl mx-auto leading-relaxed">
            The infrastructure behind your next business. Velion connects producers and suppliers with sellers around the world, giving businesses access to products, fulfillment, warehousing, logistics, payments and Cash on Delivery through one platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/apply">
              <button className="px-8 py-3.5 bg-primary text-white text-base font-medium rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-lg shadow-primary/25">
                Start Selling
              </button>
            </Link>
            <Link href="/apply?role=producer">
              <button className="px-8 py-3.5 bg-light-card border border-light-border text-light-text text-base font-medium rounded-full hover:bg-light-bg transition-transform active:scale-95">
                Become a Supplier
              </button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-light-muted pt-6">
            <span>🇿🇦 South Africa</span>
            <span className="w-px h-4 bg-light-border"></span>
            <span>🌍 Global sellers</span>
            <span className="w-px h-4 bg-light-border"></span>
            <span>🌍 Global suppliers</span>
          </div>
        </section>

        {/* ---------- ONE PLATFORM ---------- */}
        <section className="py-20 border-y border-light-border bg-light-card/50 rounded-3xl px-6 mb-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-light-text">One platform. The entire commerce chain.</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-left text-sm">
              <div className="bg-light-card border-2 border-light-border/50 p-6 rounded-xl hover:border-primary/50 transition-colors">
                <span className="block font-bold text-primary mb-1 uppercase tracking-wide text-xs">Producer / Supplier</span>
                <p className="text-light-muted text-xs">Products &amp; Inventory</p>
                <div className="mt-2 w-8 h-0.5 bg-primary/30"></div>
              </div>
              <div className="bg-light-card border-2 border-primary p-6 rounded-xl hover:shadow-lg transition-shadow">
                <span className="block font-bold text-primary mb-1 uppercase tracking-wide text-xs">Velion</span>
                <p className="text-light-muted text-xs">Marketplace · Warehousing · Fulfillment · Payments · Logistics</p>
              </div>
              <div className="bg-light-card border-2 border-light-border/50 p-6 rounded-xl hover:border-primary/50 transition-colors">
                <span className="block font-bold text-primary mb-1 uppercase tracking-wide text-xs">Seller</span>
                <p className="text-light-muted text-xs">Store · Pricing · Sales</p>
                <div className="mt-2 w-8 h-0.5 bg-primary/30"></div>
              </div>
              <div className="bg-light-card border-2 border-light-border/50 p-6 rounded-xl hover:border-primary/50 transition-colors">
                <span className="block font-bold text-primary mb-1 uppercase tracking-wide text-xs">Customer</span>
                <p className="text-light-muted text-xs">Delivery · Tracking · COD</p>
              </div>
            </div>
            <p className="text-light-muted text-sm max-w-lg mx-auto">Producer / Supplier → Velion / 3PL → Seller → Customer → Carrier → Velion → Settlements.</p>
          </div>
        </section>

        {/* ---------- FOR SELLERS ---------- */}
        <section id="sellers" className="py-20 border-b border-light-border grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-display text-light-text">Sell without building the entire operation yourself.</h2>
            <p className="text-light-muted leading-relaxed">Choose products, set your price, and focus on selling. Velion handles the operational side so you don't have to build it from scratch.</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-light-muted mt-2">
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Product marketplace</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Inventory availability</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Warehousing</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Fulfillment</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Delivery &amp; Tracking</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Cash on Delivery</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Financial settlements</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Returns &amp; disputes</div>
            </div>
            <div className="pt-4"><Link href="/apply"><button className="px-8 py-3 bg-primary text-white text-base font-medium rounded-full hover:bg-primary/90 transition-transform active:scale-95">Start Selling</button></Link></div>
          </div>
          <div className="bg-light-card/50 border border-light-border rounded-2xl p-8 flex items-center justify-center text-light-muted text-sm">Sellers Portal Preview</div>
        </section>

        {/* ---------- FOR PRODUCERS / SUPPLIERS ---------- */}
        <section id="producers" className="py-20 border-b border-light-border grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-display text-light-text">Your products. More sellers. More reach.</h2>
            <p className="text-light-muted leading-relaxed">Put your products in front of sellers looking for inventory to sell. Built for producers and suppliers who want to scale.</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-light-muted mt-2">
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Product catalog</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Inventory management</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Batch &amp; expiry tracking</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Warehousing &amp; Fulfillment</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Sales settlements</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Supplier wallet</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Supplier Score</div>
              <div className="flex items-center gap-2"><span className="text-primary">✓</span> Verified Supplier</div>
            </div>
            <div className="pt-4"><Link href="/apply?role=producer"><button className="px-8 py-3 bg-primary text-white text-base font-medium rounded-full hover:bg-primary/90 transition-transform active:scale-95">Become a Supplier</button></Link></div>
          </div>
          <div className="bg-light-card/50 border border-light-border rounded-2xl p-8 flex items-center justify-center text-light-muted text-sm">Supplier Portal Preview</div>
        </section>

        {/* ---------- FINAL CTA ---------- */}
        <section className="py-24 text-center max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold font-display text-light-text">Your next opportunity is already here.</h2>
          <p className="text-light-muted text-lg">Join Velion and start building your business on top of a complete commerce infrastructure.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/apply">
              <button className="px-8 py-3.5 bg-primary text-white text-base font-medium rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-lg shadow-primary/25">Start Selling</button>
            </Link>
            <Link href="/apply?role=producer">
              <button className="px-8 py-3.5 bg-light-card border border-light-border text-light-text text-base font-medium rounded-full hover:bg-light-bg transition-transform active:scale-95">Become a Supplier</button>
            </Link>
          </div>
        </section>

      </main>

      {/* ---------- FOOTER ---------- */}
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
            <p className="text-light-muted">Privacy Policy</p>
            <p className="text-light-muted">Terms of Service</p>
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
