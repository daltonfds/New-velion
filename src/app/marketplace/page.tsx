"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string; slug: string; name: string; description: string | null;
  price: number; compareAtPrice: number | null; currency: string; images: string[];
  stock: number; featured: boolean; isNew: boolean; rating: number; reviewCount: number;
  category: { id: string; name: string; slug: string } | null;
  supplier: { id: string; slug: string; name: string; countryName: string; verified: boolean } | null;
};
type Supplier = { id: string; slug: string; name: string; countryName: string; verified: boolean; productCount: number; logoUrl: string | null; };
type Category = { id: string; name: string; slug: string };

const money = (value: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(value);

export default function PublicMarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [featured, setFeatured] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ limit: "48" });
        if (q.trim()) params.set("q", q.trim());
        if (category) params.set("category", category);
        if (supplier) params.set("supplier", supplier);
        if (featured) params.set("featured", "true");
        if (newOnly) params.set("new", "true");
        const response = await fetch("/api/public/marketplace?" + params.toString(), { signal: controller.signal });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load marketplace.");
        setProducts(body.products || []);
        setSuppliers(body.suppliers || []);
        setCategories(body.categories || []);
        setError("");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError(err instanceof Error ? err.message : "Unable to load marketplace.");
      } finally {
        setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [q, category, supplier, featured, newOnly]);

  const featuredProducts = useMemo(() => products.filter((p) => p.featured).slice(0, 4), [products]);
  const visibleSuppliers = useMemo(() => suppliers.slice(0, 6), [suppliers]);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex items-end gap-1" aria-hidden="true">
              <span className="h-3 w-2 rounded-sm bg-[#C99A2E]" />
              <span className="h-5 w-2 rounded-sm bg-[#C99A2E]" />
              <span className="h-7 w-2 rounded-sm bg-[#C99A2E]" />
            </span>
            <span>
              <span className="block text-lg font-extrabold leading-none text-[#16294F]">Newvelion</span>
              <span className="text-[9px] font-medium tracking-[0.18em] text-[#8A8570]">COMMERCE INFRASTRUCTURE</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <Link href="/marketplace" className="text-[#16294F]">Marketplace</Link>
            <Link href="/fornecedores" className="hover:text-[#16294F]">Suppliers</Link>
            <Link href="/login" className="hover:text-[#16294F]">Sign in</Link>
            <Link href="/register" className="rounded-lg bg-[#16294F] px-4 py-2.5 text-white hover:bg-blue-900">Start selling</Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-blue-100 bg-[#eef4fb]">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">NewVelion Marketplace</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#16294F] sm:text-5xl">Discover products from verified suppliers.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Explore products available for delivery across South Africa, compare offers, meet the supplier behind each catalog, and purchase securely.</p>
          </div>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, suppliers or categories..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:bg-white" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-blue-500">
                <option value="">All categories</option>
                {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
              </select>
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-blue-500">
                <option value="">All suppliers</option>
                {suppliers.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
              </select>
              <button type="button" onClick={() => { setFeatured(false); setNewOnly(false); setCategory(""); setSupplier(""); setQ(""); }} className="rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Clear</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setFeatured((v) => !v)} className={featured ? "rounded-full bg-[#16294F] px-4 py-2 text-xs font-bold text-white" : "rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"}>Featured</button>
              <button onClick={() => setNewOnly((v) => !v)} className={newOnly ? "rounded-full bg-[#16294F] px-4 py-2 text-xs font-bold text-white" : "rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"}>New arrivals</button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {error && <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {featuredProducts.length > 0 && !q && !category && !supplier && !featured && !newOnly && (
          <section>
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Curated</p><h2 className="mt-2 text-2xl font-extrabold text-[#16294F]">Featured products</h2></div>
              <span className="text-sm text-slate-500">{products.length} products</span>
            </div>
            <ProductGrid products={featuredProducts} />
          </section>
        )}
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Catalog</p><h2 className="mt-2 text-2xl font-extrabold text-[#16294F]">All products</h2></div>
            <span className="text-sm text-slate-500">{loading ? "Loading..." : products.length + " results"}</span>
          </div>
          {loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({length: 8}).map((_, i) => <div key={i} className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />)}</div> : products.length ? <ProductGrid products={products} /> : <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-14 text-center text-sm text-slate-500">No products match your filters.</div>}
        </section>
        {visibleSuppliers.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-12">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Supply network</p><h2 className="mt-2 text-2xl font-extrabold text-[#16294F]">Meet our suppliers</h2></div>
              <Link href="/fornecedores" className="text-sm font-bold text-blue-700 hover:underline">View all suppliers →</Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleSuppliers.map((item) => <SupplierCard key={item.id} supplier={item} />)}</div>
          </section>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-[#16294F] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="text-sm text-blue-100">Newvelion · Commerce infrastructure</p>
          <div className="flex gap-5 text-sm text-blue-100"><Link href="/fornecedores">Suppliers</Link><Link href="/terms">Terms</Link><Link href="/support">Support</Link></div>
        </div>
      </footer>
    </main>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  return <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-200">
    <Link href={"/produto/" + encodeURIComponent(product.slug)} className="block">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {image ? <Image src={image} alt={product.name} fill unoptimized className="object-cover transition duration-300 group-hover:scale-[1.02]" sizes="(max-width: 768px) 50vw, 25vw" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>}
        <div className="absolute left-3 top-3 flex gap-2">{product.featured && <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#16294F]">FEATURED</span>}{product.isNew && <span className="rounded-full bg-[#C99A2E] px-2.5 py-1 text-[10px] font-bold text-white">NEW</span>}</div>
      </div>
    </Link>
    <div className="p-5">
      {product.category && <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">{product.category.name}</p>}
      <Link href={"/produto/" + encodeURIComponent(product.slug)} className="mt-1 block text-base font-bold leading-6 text-slate-900 hover:text-blue-700">{product.name}</Link>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500"><span className="text-[#C99A2E]">★</span>{product.rating.toFixed(1)} ({product.reviewCount})</div>
      <div className="mt-4"><span className="text-lg font-extrabold text-[#16294F]">{money(product.price)}</span>{product.compareAtPrice != null && <span className="ml-2 text-xs text-slate-400 line-through">{money(product.compareAtPrice)}</span>}</div>
      {product.supplier && <Link href={"/fornecedor/" + encodeURIComponent(product.supplier.slug)} className="mt-4 block border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500 hover:text-blue-700">Sold by {product.supplier.name} · {product.supplier.countryName}</Link>}
    </div>
  </article>;
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  return <Link href={"/fornecedor/" + encodeURIComponent(supplier.slug)} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-200">
    <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#eef4fb] text-lg font-extrabold text-[#16294F]">{supplier.logoUrl ? <Image src={supplier.logoUrl} alt="" width={48} height={48} unoptimized className="h-full w-full object-cover" /> : supplier.name.slice(0,1).toUpperCase()}</div><div className="min-w-0"><h3 className="truncate font-bold text-slate-900">{supplier.name}</h3><p className="text-xs text-slate-500">{supplier.countryName} · {supplier.productCount} products</p></div></div>
    <div className="mt-4 flex items-center justify-between text-xs font-semibold"><span className="text-blue-700">{supplier.verified ? "Verified supplier" : "Supplier"}</span><span className="text-slate-400">View profile →</span></div>
  </Link>;
}
