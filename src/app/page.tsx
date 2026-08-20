import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text font-sans selection:bg-primary/20">
      
      {/* ============ HEADER ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-light-bg/80 backdrop-blur-md border-b border-light-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <VelionLogo className="w-8 h-8" />
            <span className="font-display text-lg font-semibold tracking-tight text-light-text">Velion</span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-light-muted">
            <Link href="#sellers" className="hover:text-light-text transition-colors duration-200">Sellers</Link>
            <Link href="#producers" className="hover:text-light-text transition-colors duration-200">Producers</Link>
            <Link href="/login" className="hover:text-light-text transition-colors duration-200">Login</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/apply">
              <button className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                Start Selling
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ MAIN ============ */}
      <main className="pt-28 max-w-6xl mx-auto px-6 pb-20 space-y-28">

        {/* --- HERO --- */}
        <section className="text-center max-w-3xl mx-auto space-y-8">
          <div className="flex justify-center">
            <VelionLogo className="w-24 h-24" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">Commerce Infrastructure</p>
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight leading-[1.1] text-light-text">
              The climb starts here.
            </h1>
          </div>
          <p className="text-base md:text-lg text-light-muted leading-relaxed max-w-2xl mx-auto">
            The infrastructure behind your next business. Velion connects producers and suppliers with sellers around the world, giving businesses access to products, fulfillment, warehousing, logistics, payments and Cash on Delivery through one platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/apply">
              <button className="px-8 py-3.5 bg-primary text-white text-base font-medium rounded-full hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
                Start Selling
              </button>
            </Link>
            <Link href="/apply?role=producer">
              <button className="px-8 py-3.5 bg-light-card border border-light-border text-light-text text-base font-medium rounded-full hover:bg-light-bg transition-all duration-200 hover:scale-105 active:scale-95">
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

        {/* --- ONE PLATFORM --- */}
        <section className="border-y border-light-border py-16 bg-light-card/30 rounded-3xl px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-light-text">One platform. The entire commerce chain.</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-left text-sm">
              <div className="bg-light-card border border-light-border/50 p-6 rounded-xl hover:border-primary/30 transition-colors duration-200">
                <span className="block font-bold text-primary mb-2 uppercase text-xs tracking-wide">Producer / Supplier</span>
                <p className="text-light-muted text-xs">Products &amp; Inventory</p>
              </div>
              <div className="bg-light-card border-2 border-primary p-6 rounded-xl hover:shadow-lg transition-all duration-200">
                <span className="block font-bold text-primary mb-2 uppercase text-xs tracking-wide">Velion</span>
                <p className="text-light-muted text-xs">Marketplace · Warehousing · Fulfillment · Payments · Logistics</p>
              </div>
              <div className="bg-light-card border border-light-border/50 p-6 rounded-xl hover:border-primary/30 transition-colors duration-200">
                <span className="block font-bold text-primary mb-2 uppercase text-xs tracking-wide">Seller</span>
                <p className="text-light-muted text-xs">Store · Pricing · Sales</p>
              </div>
              <div className="bg-light-card border border-light-border/50 p-6 rounded-xl hover:border-primary/30 transition-colors duration-200">
                <span className="block font-bold text-primary mb-2 uppercase text-xs tracking-wide">Customer</span>
                <p className="text-light-muted text-xs">Delivery · Tracking · COD</p>
              </div>
            </div>
            <p className="text-light-muted text-sm max-w-lg mx-auto">Producer / Supplier → Velion / 3PL → Seller → Customer → Carrier → Velion → Settlements.</p>
          </div>
        </section>

        {/* --- SELLERS --- */}
        <section id="sellers" className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <h2 className="text-3xl font-bold font-display text-light-text">Sell without building the entire operation yourself.</h2>
            <p className="text-light-muted leading-relaxed text-base">Choose products, set your price, and focus on selling. Velion handles the operational side so you don't have to build it from scratch.</p>
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
            <div className="pt-4"><Link href="/apply"><button className="px-8 py-3.5 bg-primary text-white text-base font-medium rounded-full hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95">Start Selling</button></Link></div>
          </div>
          <div className="order-1 md:order-2 bg-light-card/50 border border-light-border rounded-2xl p-10 flex items-center justify-center text-light-muted text-sm min-h-[300px]">
            Sellers Portal Preview
          </div>
        </section>

        {/* --- PRODUCERS --- */}
        <section id="producers" className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <h2 className="text-3xl font-bold font-display text-light-text">Your products. More sellers. More reach.</h2>
            <p className="text-light-muted leading-relaxed text-base">Put your products in front of sellers looking for inventory to sell. Built for producers and suppliers who want to scale.</p>
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
            <div className="pt-4"><Link href="/apply?role=producer"><button className="px-8 py-3.5 bg-primary text-white text-base font-medium rounded-full hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95">Become a Supplier</button></Link></div>
          </div>
          <div className="order-1 md:order-2 bg-light-card/50 border border-light-border rounded-2xl p-10 flex items-center justify-center text-light-muted text-sm min-h-[300px]">
            Supplier Portal Preview
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="text-center max-w-2xl mx-auto space-y-6 border-t border-light-border pt-16">
          <h2 className="text-3xl font-bold font-display text-light-text">Your next opportunity is already here.</h2>
          <p className="text-light-muted text-lg">Join Velion and start building your business on top of a complete commerce infrastructure.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/apply">
              <button className="px-8 py-3.5 bg-primary text-white text-base font-medium rounded-full hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">Start Selling</button>
            </Link>
            <Link href="/apply?role=producer">
              <button className="px-8 py-3.5 bg-light-card border border-light-border text-light-text text-base font-medium rounded-full hover:bg-light-bg transition-all duration-200 hover:scale-105 active:scale-95">Become a Supplier</button>
            </Link>
          </div>
        </section>

      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-light-border py-12 px-6 bg-light-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-light-muted">
          <div className="flex items-center gap-3">
            <VelionLogo className="w-6 h-6" />
            <span className="font-display font-semibold text-base text-light-text">Velion</span>
          </div>
          <div className="flex gap-6">
            <a href="mailto:daltonfelizarda66@gmail.com" className="hover:text-light-text transition-colors">Email</a>
            <a href="https://wa.me/27722958915" target="_blank" className="hover:text-light-text transition-colors">WhatsApp</a>
            <a href="https://instagram.com/dalton_fds" target="_blank" className="hover:text-light-text transition-colors">Instagram</a>
          </div>
          <p className="text-xs">&copy; 2026 Velion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
