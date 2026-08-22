import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-light-bg text-light-text font-sans">
      
      {/* Menu Desktop */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-light-bg/80 backdrop-blur-sm border-b border-light-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VelionLogo className="w-8 h-8" />
            <span className="font-display text-lg font-semibold tracking-tight">Velion</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#sellers" className="hover:text-primary">Sellers</Link>
            <Link href="#producers" className="hover:text-primary">Producers</Link>
            <Link href="#logistics" className="hover:text-primary">Logistics</Link>
            <Link href="#about" className="hover:text-primary">About</Link>
            <Link href="/login" className="hover:text-primary">Login</Link>
            <Link href="/apply"><button className="px-5 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary/90">Start Selling</button></Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 max-w-6xl mx-auto px-6 pb-20">
        <section id="hero" className="text-center py-20">
          <div className="flex justify-center mb-4"><VelionLogo className="w-24 h-24" /></div>
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase mb-4">Commerce Infrastructure</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">The climb starts here.</h1>
          <p className="text-lg text-light-muted max-w-2xl mx-auto mb-8">Velion connects producers and suppliers with sellers, providing products, warehousing, logistics, payments and COD through one platform.</p>
          <div className="flex justify-center gap-4">
            <Link href="/apply"><button className="px-8 py-3 bg-primary text-white rounded-full">Start Selling</button></Link>
            <Link href="/apply?role=producer"><button className="px-8 py-3 bg-white border border-light-border rounded-full">Become a Supplier</button></Link>
          </div>
        </section>

        <section id="sellers" className="py-20 border-t border-light-border">
          <h2 className="text-3xl font-bold mb-8">For Sellers</h2>
          <p className="text-light-muted mb-6">Sell without building the entire operation. Velion handles the infrastructure.</p>
          <div className="grid grid-cols-2 gap-4">
            {["Product marketplace", "Inventory availability", "Warehousing", "Fulfillment", "Delivery & Tracking", "Cash on Delivery", "Financial settlements", "Returns & disputes"].map((item) => (
              <div key={item} className="bg-white p-4 rounded-xl border border-light-border">
                <span className="text-primary">✓</span> {item}
              </div>
            ))}
          </div>
          <Link href="/apply" className="mt-8 inline-block"><button className="px-6 py-3 bg-primary text-white rounded-full">Start Selling</button></Link>
        </section>

        <section id="producers" className="py-20 border-t border-light-border">
          <h2 className="text-3xl font-bold mb-8">For Producers & Suppliers</h2>
          <p className="text-light-muted mb-6">Your products. More sellers. More reach.</p>
          <div className="grid grid-cols-2 gap-4">
            {["Product catalog", "Inventory management", "Batch & expiry tracking", "Warehousing & Fulfillment", "Sales settlements", "Supplier wallet", "Supplier Score", "Verified Supplier"].map((item) => (
              <div key={item} className="bg-white p-4 rounded-xl border border-light-border">
                <span className="text-primary">✓</span> {item}
              </div>
            ))}
          </div>
          <Link href="/apply?role=producer" className="mt-8 inline-block"><button className="px-6 py-3 bg-primary text-white rounded-full">Become a Supplier</button></Link>
        </section>

        <section id="logistics" className="py-20 border-t border-light-border">
          <h2 className="text-3xl font-bold mb-8">Logistics</h2>
          <p className="text-light-muted mb-6">From warehouse to customer's door.</p>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white p-6 rounded-xl border border-light-border">
              <p className="font-semibold mb-2">Warehouse → Fulfillment → Carrier → Tracking → Customer</p>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 border-t border-light-border">
          <h2 className="text-3xl font-bold mb-8">About Velion</h2>
          <p className="text-light-muted mb-6">The infrastructure behind your next business.</p>
        </section>

        <section className="text-center py-20">
          <h2 className="text-3xl font-bold mb-4">Your next opportunity is already here.</h2>
          <div className="flex justify-center gap-4">
            <Link href="/apply"><button className="px-8 py-3 bg-primary text-white rounded-full">Start Selling</button></Link>
            <Link href="/apply?role=producer"><button className="px-8 py-3 bg-white border border-light-border rounded-full">Become a Supplier</button></Link>
          </div>
        </section>
      </main>
    </div>
  );
}
