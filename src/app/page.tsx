import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text font-sans selection:bg-primary/20">
      
      {/* ============ HEADER / MENU ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-light-bg/80 backdrop-blur-md border-b border-light-border/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo (Apenas o ícone, maior) */}
          <div className="flex items-center gap-3">
            <VelionLogo className="w-10 h-10" />
            <span className="font-display text-lg font-semibold tracking-tight text-light-text hidden sm:block">Velion</span>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-light-muted tracking-wide">
            <a href="#how-it-works" className="hover:text-light-text transition-colors">How it works</a>
            <Link href="/login" className="hover:text-light-text transition-colors">Login</Link>
            <div className="relative group">
              <button className="hover:text-light-text transition-colors cursor-pointer">Support</button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-light-card border border-light-border rounded-xl shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs">
                <a href="mailto:daltonfelizarda66@gmail.com" className="block py-1 hover:text-primary">Email</a>
                <a href="https://wa.me/27722958915" target="_blank" className="block py-1 hover:text-primary">WhatsApp</a>
                <a href="https://instagram.com/dalton_fds" target="_blank" className="block py-1 hover:text-primary">Instagram</a>
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="flex items-center gap-3">
            <Link href="/apply">
              <button className="px-5 py-2 bg-primary text-white text-xs font-medium rounded-full hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                Start Selling
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ MAIN CONTENT ============ */}
      <main className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 pb-16 space-y-16">

        {/* --- HERO SECTION --- */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="flex justify-center">
            {/* Logotipo maior no centro */}
            <VelionLogo className="w-32 h-32" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-medium tracking-[0.2em] text-primary uppercase">Commerce Infrastructure</p>
            <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight leading-[1.1] text-light-text">
              The climb starts here.
            </h1>
          </div>
          <p className="text-sm md:text-base text-light-muted leading-relaxed max-w-2xl mx-auto">
            The infrastructure behind your next business. Velion connects producers and suppliers with sellers around the world, giving businesses access to products, fulfillment, warehousing, logistics, payments and Cash on Delivery through one platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/apply">
              <button className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
                Start Selling
              </button>
            </Link>
            <Link href="/apply?role=producer">
              <button className="px-6 py-2.5 bg-light-card border border-light-border text-light-text text-sm font-medium rounded-full hover:bg-light-bg transition-all duration-200 hover:scale-105 active:scale-95">
                Become a Supplier
              </button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] text-light-muted pt-4">
            <span>🇿🇦 South Africa</span>
            <span className="w-px h-3 bg-light-border"></span>
            <span>🌍 Global sellers</span>
            <span className="w-px h-3 bg-light-border"></span>
            <span>🌍 Global suppliers</span>
          </div>
        </section>

        {/* --- HOW IT WORKS / CHAIN --- */}
        <section id="how-it-works" className="border-y border-light-border py-12 bg-light-card/30 rounded-2xl px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-light-text">One platform. The entire commerce chain.</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-left text-xs">
              <div className="bg-light-card border border-light-border/50 p-4 rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                <span className="block font-bold text-primary mb-1 uppercase text-[10px] tracking-wide">Producer / Supplier</span>
                <p className="text-light-muted text-[10px]">Products &amp; Inventory</p>
              </div>
              <div className="bg-light-card border border-primary p-4 rounded-lg hover:shadow-lg transition-all duration-200">
                <span className="block font-bold text-primary mb-1 uppercase text-[10px] tracking-wide">Velion</span>
                <p className="text-light-muted text-[10px]">Marketplace · Warehousing · Fulfillment · Payments · Logistics</p>
              </div>
              <div className="bg-light-card border border-light-border/50 p-4 rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                <span className="block font-bold text-primary mb-1 uppercase text-[10px] tracking-wide">Seller</span>
                <p className="text-light-muted text-[10px]">Store · Pricing · Sales</p>
              </div>
              <div className="bg-light-card border border-light-border/50 p-4 rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                <span className="block font-bold text-primary mb-1 uppercase text-[10px] tracking-wide">Customer</span>
                <p className="text-light-muted text-[10px]">Delivery · Tracking · COD</p>
              </div>
            </div>
            <p className="text-[11px] text-light-muted max-w-lg mx-auto">Producer / Supplier → Velion / 3PL → Seller → Customer → Carrier → Velion → Settlements.</p>
          </div>
        </section>

        {/* --- SELLERS SECTION --- */}
        <section id="sellers" className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 order-2 md:order-1">
            <h2 className="text-2xl font-bold font-display text-light-text">Sell without building the entire operation yourself.</h2>
            <p className="text-light-muted leading-relaxed text-sm">Choose products, set your price, and focus on selling. Velion handles the operational side so you don't have to build it from scratch.</p>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-light-muted mt-2">
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Product marketplace</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Inventory availability</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Warehousing</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Fulfillment</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Delivery &amp; Tracking</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Cash on Delivery</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Financial settlements</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Returns &amp; disputes</div>
            </div>
            <div className="pt-2"><Link href="/apply"><button className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95">Start Selling</button></Link></div>
          </div>
          <div className="order-1 md:order-2 bg-light-card/50 border border-light-border rounded-xl p-6 flex flex-col items-center justify-center text-light-muted text-xs min-h-[200px]">
            <div className="text-3xl mb-2">🛒</div>
            <p>Seller Portal Preview</p>
          </div>
        </section>

        {/* --- PRODUCERS & SUPPLIERS SECTION --- */}
        <section id="producers" className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 order-2 md:order-1">
            <h2 className="text-2xl font-bold font-display text-light-text">Your products. More sellers. More reach.</h2>
            <p className="text-light-muted leading-relaxed text-sm">Put your products in front of sellers looking for inventory to sell. Built for producers and suppliers who want to scale.</p>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-light-muted mt-2">
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Product catalog</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Inventory management</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Batch &amp; expiry tracking</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Warehousing &amp; Fulfillment</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Sales settlements</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Supplier wallet</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Supplier Score</div>
              <div className="flex items-center gap-1.5"><span className="text-primary text-[10px]">✓</span> Verified Supplier</div>
            </div>
            <div className="pt-2"><Link href="/apply?role=producer"><button className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95">Become a Supplier</button></Link></div>
          </div>
          <div className="order-1 md:order-2 bg-light-card/50 border border-light-border rounded-xl p-6 flex flex-col items-center justify-center text-light-muted text-xs min-h-[200px]">
            <div className="text-3xl mb-2">🏭</div>
            <p>Supplier Portal Preview</p>
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="text-center max-w-2xl mx-auto space-y-4 border-t border-light-border pt-12">
          <h2 className="text-2xl font-bold font-display text-light-text">Your next opportunity is already here.</h2>
          <p className="text-light-muted text-sm">Join Velion and start building your business on top of a complete commerce infrastructure.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/apply">
              <button className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">Start Selling</button>
            </Link>
            <Link href="/apply?role=producer">
              <button className="px-6 py-2.5 bg-light-card border border-light-border text-light-text text-sm font-medium rounded-full hover:bg-light-bg transition-all duration-200 hover:scale-105 active:scale-95">Become a Supplier</button>
            </Link>
          </div>
        </section>

      </main>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-light-border py-8 px-4 bg-light-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-light-muted">
          <div className="flex items-center gap-3">
            <VelionLogo className="w-6 h-6" />
            <span className="font-display font-semibold text-sm text-light-text">Velion</span>
          </div>
          <div className="flex gap-4">
            <a href="mailto:daltonfelizarda66@gmail.com" className="hover:text-light-text transition-colors">Email</a>
            <a href="https://wa.me/27722958915" target="_blank" className="hover:text-light-text transition-colors">WhatsApp</a>
            <a href="https://instagram.com/dalton_fds" target="_blank" className="hover:text-light-text transition-colors">Instagram</a>
          </div>
          <p className="text-[10px]">&copy; 2026 Velion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
