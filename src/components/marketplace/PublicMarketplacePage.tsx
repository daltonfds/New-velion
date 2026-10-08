"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string; slug: string; name: string; description: string | null;
  price: number; compareAtPrice: number | null; currency: string; images: string[];
  stock: number; featured: boolean; isNew: boolean; rating: number; reviewCount: number;
  category: { id: string; name: string; slug: string } | null;
  supplier: { id: string; slug: string; name: string; countryName: string; verified: boolean } | null;
};
type Supplier = { id: string; slug: string; name: string; countryName: string; verified: boolean; productCount: number; logoUrl: string | null };
type Category = { id: string; name: string; slug: string };

const money = (value: number) => new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(value);

export function PublicMarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [featured, setFeatured] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [sort, setSort] = useState("featured");
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
        const response = await fetch("/api/public/marketplace?" + params.toString(), { signal: controller.signal, cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load the public marketplace.");
        setProducts(body.products || []);
        setSuppliers(body.suppliers || []);
        setCategories(body.categories || []);
        setError("");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError(err instanceof Error ? err.message : "Unable to load the public marketplace.");
      } finally { setLoading(false); }
    };
    void load();
    return () => controller.abort();
  }, [q, category, supplier, featured, newOnly]);

  const visibleCategories = useMemo(() => categories.slice(0, 9), [categories]);
  const filteredProducts = useMemo(() => {
    const copy = [...products];
    if (sort === "price-low") copy.sort((a, b) => a.price - b.price);
    if (sort === "price-high") copy.sort((a, b) => b.price - a.price);
    if (sort === "rating") copy.sort((a, b) => b.rating - a.rating);
    return copy;
  }, [products, sort]);
  const deals = useMemo(() => products.filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price).slice(0, 8), [products]);
  const featuredProducts = useMemo(() => products.filter((p) => p.featured).slice(0, 8), [products]);
  const newProducts = useMemo(() => products.filter((p) => p.isNew).slice(0, 8), [products]);
  const categoryProducts = useMemo(() => {
    const result: Array<{ category: Category; products: Product[] }> = [];
    for (const cat of visibleCategories) {
      const items = products.filter((p) => p.category?.slug === cat.slug).slice(0, 4);
      if (items.length) result.push({ category: cat, products: items });
    }
    return result.slice(0, 4);
  }, [products, visibleCategories]);
  const reset = () => { setQ(""); setCategory(""); setSupplier(""); setFeatured(false); setNewOnly(false); setSort("featured"); };

  return (
    <main className="nv-marketing min-h-screen bg-white text-slate-900">
      <div className="bg-[#003B95] text-white"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-8"><span className="font-semibold tracking-wide">South Africa delivery · Secure checkout</span><div className="hidden gap-5 sm:flex"><Link href="/support">Help</Link><Link href="/fornecedores">Sell on NewVelion</Link></div></div></div>

      <header className="sticky top-0 z-30 border-b border-[#dde5ef] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0"><span className="flex items-center gap-2"><span className="flex h-8 items-end gap-1"><span className="h-3 w-2 rounded-sm bg-[#FFB800]" /><span className="h-5 w-2 rounded-sm bg-[#FFB800]" /><span className="h-7 w-2 rounded-sm bg-[#FFB800]" /></span><span><span className="nv-brand-wordmark block text-xl font-black leading-none tracking-tight text-[#001B44]">Newvelion</span><span className="hidden text-[8px] font-bold tracking-[.18em] text-[#6B7280] sm:block">COMMERCE INFRASTRUCTURE</span></span></span></Link>
          <div className="hidden min-w-0 flex-1 md:block"><div className="flex overflow-hidden rounded-[10px] border border-slate-300 bg-white"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What are you looking for today?" className="min-w-0 flex-1 px-5 py-3 text-sm outline-none" /><button type="button" className="bg-[#003B95] px-6 text-sm font-extrabold text-white">Search</button></div></div>
          <nav className="ml-auto flex items-center gap-2 text-sm font-bold text-[#001B44]"><Link href="/account" className="hidden rounded-lg px-3 py-2 hover:bg-slate-100 sm:block">My account</Link><Link href="/cart" className="rounded-lg border border-[#dde5ef] px-3 py-2 hover:bg-slate-50">Cart</Link><Link href="/login" className="hidden px-2 py-2 sm:block">Sign in</Link></nav>
        </div>
        <div className="border-t border-slate-100 md:hidden"><div className="mx-auto flex max-w-[1440px] px-4 py-3 sm:px-6"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, suppliers or categories..." className="w-full rounded-lg border border-[#dde5ef] px-4 py-2.5 text-sm outline-none focus:border-blue-500" /></div></div>
        <div className="border-t border-slate-100"><div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-4 py-3 text-sm font-bold sm:px-6 lg:px-8"><Link href="/" className="whitespace-nowrap text-[#001B44]">All departments</Link>{visibleCategories.map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.slug)} className="whitespace-nowrap text-slate-600 hover:text-[#001B44]">{item.name}</button>)}<Link href="/fornecedores" className="ml-auto whitespace-nowrap text-[#003B95]">Our suppliers</Link></div></div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="relative overflow-hidden rounded-[12px] bg-[#003B95] px-7 py-10 text-white sm:px-10 sm:py-14"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">NewVelion Marketplace</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Everything you need.<br />From trusted suppliers.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">Shop products supplied by verified South African and Chinese businesses, with delivery across South Africa.</p><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })} className="rounded-lg bg-[#003B95] px-5 py-3 text-sm font-extrabold text-white">Shop now</button><Link href="/fornecedores" className="rounded-lg border border-white/30 px-5 py-3 text-sm font-extrabold">Meet suppliers</Link></div></div><div className="pointer-events-none absolute -right-10 -top-16 hidden h-72 w-72 rounded-full border-[45px] border-blue-600/20 lg:block" /></div>
          <aside className="rounded-[12px] border border-[#dde5ef] bg-white p-5"><p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Why NewVelion</p><div className="mt-5 space-y-5"><Benefit title="Verified suppliers" text="Know who stands behind every catalog." /><Benefit title="South Africa delivery" text="Built around local customer fulfillment." /><Benefit title="Secure checkout" text="A simple, trusted buying experience." /></div><Link href="/register/customer" className="mt-6 block rounded-lg bg-[#003B95] px-4 py-3 text-center text-sm font-extrabold text-white">Create customer account</Link></aside>
        </section>

        <section className="mt-7 rounded-[12px] border border-[#dde5ef] bg-white p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Shop by department</p><h2 className="mt-1 text-xl font-black text-[#001B44]">Browse categories</h2></div>{category && <button onClick={reset} className="text-sm font-bold text-[#003B95]">Clear selection</button>}</div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">{visibleCategories.map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.slug)} className={category === item.slug ? "rounded-[10px] border-2 border-[#16294F] bg-[#eef5ff] p-4 text-left" : "rounded-[10px] border border-[#dde5ef] bg-slate-50 p-4 text-left hover:border-blue-200 hover:bg-white"}><span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-blue-600 shadow-sm">◆</span><span className="mt-3 block line-clamp-2 text-xs font-extrabold text-[#001B44]">{item.name}</span></button>)}</div></section>

        {!q && !category && !supplier && !featured && !newOnly && deals.length > 0 && <ProductSection eyebrow="More value" title="Deals worth checking" subtitle="Selected offers from the NewVelion supplier network." products={deals} />}
        {!q && !category && !supplier && !featured && !newOnly && featuredProducts.length > 0 && <ProductSection eyebrow="NewVelion picks" title="Featured products" subtitle="Popular products selected from verified suppliers." products={featuredProducts} />}
        {!q && !category && !supplier && !featured && !newOnly && categoryProducts.map(({ category: cat, products: items }) => <section key={cat.id} className="mt-10 rounded-[12px] border border-[#dde5ef] bg-white p-5 sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">{cat.name}</p><h2 className="mt-1 text-xl font-black text-[#001B44]">Shop {cat.name}</h2></div><button onClick={() => setCategory(cat.slug)} className="text-sm font-extrabold text-[#003B95]">View all →</button></div><ProductGrid products={items} /></section>)}
        {!q && !category && !supplier && !featured && !newOnly && newProducts.length > 0 && <ProductSection eyebrow="Just landed" title="New arrivals" subtitle="Fresh products recently added by our suppliers." products={newProducts} />}

        <section id="catalog" className="mt-10 rounded-[12px] border border-[#dde5ef] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Marketplace catalog</p><h2 className="mt-1 text-2xl font-black text-[#001B44]">All products</h2><p className="mt-1 text-sm text-slate-500">{loading ? "Loading products..." : String(filteredProducts.length) + " products available"}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setFeatured((v) => !v)} className={featured ? "rounded-lg bg-[#003B95] px-3 py-2 text-xs font-extrabold text-white" : "rounded-lg border border-[#dde5ef] px-3 py-2 text-xs font-extrabold"}>Featured</button><button onClick={() => setNewOnly((v) => !v)} className={newOnly ? "rounded-lg bg-[#003B95] px-3 py-2 text-xs font-extrabold text-white" : "rounded-lg border border-[#dde5ef] px-3 py-2 text-xs font-extrabold"}>New arrivals</button><select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-[#dde5ef] px-3 py-2 text-xs font-bold outline-none"><option value="featured">Sort: Recommended</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option><option value="rating">Top rated</option></select>{(q || category || supplier) && <button onClick={reset} className="rounded-lg border border-[#dde5ef] px-3 py-2 text-xs font-bold text-slate-600">Clear</button>}</div></div>
          {supplier && <div className="mt-5 rounded-[10px] bg-[#eef4fb] p-4 text-sm text-[#001B44]"><strong>Supplier:</strong> {suppliers.find((s) => s.slug === supplier)?.name || supplier}</div>}
          {error && <div className="mt-5 rounded-[10px] border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
          {loading ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-96 animate-pulse rounded-[10px] bg-slate-100" />)}</div> : filteredProducts.length ? <ProductGrid products={filteredProducts} /> : <div className="mt-8 rounded-[10px] border border-dashed border-slate-300 p-16 text-center"><p className="font-black text-[#001B44]">No products match your filters.</p><button onClick={reset} className="mt-3 text-sm font-bold text-[#003B95]">Reset filters</button></div>}
        </section>

        {suppliers.length > 0 && <section className="mt-10 rounded-[12px] border border-[#dde5ef] bg-white p-5 sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Supply network</p><h2 className="mt-1 text-xl font-black text-[#001B44]">Trusted suppliers</h2></div><Link href="/fornecedores" className="text-sm font-extrabold text-[#003B95]">View all →</Link></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{suppliers.slice(0, 6).map((item) => <SupplierCard key={item.id} supplier={item} />)}</div></section>}
      </div>

      <footer className="mt-12 bg-[#003B95] text-white"><div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-10 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between"><div><p className="font-black">Newvelion</p><p className="mt-1 text-xs tracking-[.16em] text-blue-200">COMMERCE INFRASTRUCTURE</p></div><div className="flex flex-wrap gap-5 text-sm text-blue-100"><Link href="/fornecedores">Suppliers</Link><Link href="/terms">Terms</Link><Link href="/support">Support</Link><Link href="/login">Sign in</Link></div></div></footer>
    </main>
  );
}

function Benefit({ title, text }: { title: string; text: string }) {
  return <div className="flex gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#eef4fb] text-xs font-black text-[#001B44]">✓</span><div><p className="text-sm font-extrabold text-[#001B44]">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div>;
}

function ProductSection({ eyebrow, title, subtitle, products }: { eyebrow: string; title: string; subtitle: string; products: Product[] }) {
  return <section className="mt-10 rounded-[12px] border border-[#dde5ef] bg-white p-5 sm:p-6"><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">{eyebrow}</p><h2 className="mt-1 text-xl font-black text-[#001B44]">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div><ProductGrid products={products} /></section>;
}

function ProductGrid({ products }: { products: Product[] }) {
  return <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  const [favorite, setFavorite] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("customer_favorites").select("id").eq("user_id", user.id).eq("product_id", product.id).maybeSingle();
      if (active) setFavorite(Boolean(data));
    })();
    return () => { active = false; };
  }, [product.id]);

  async function toggleFavorite() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "customer") { window.location.href = "/register/customer"; return; }
    if (favorite) {
      await supabase.from("customer_favorites").delete().eq("user_id", user.id).eq("product_id", product.id);
      setFavorite(false);
    } else {
      const { error } = await supabase.from("customer_favorites").insert({ user_id: user.id, product_id: product.id });
      if (!error) setFavorite(true);
    }
  }

  async function addToCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "customer") { window.location.href = "/register/customer"; return; }
    setAdding(true);
    const { error } = await supabase.from("customer_cart_items").upsert({ user_id: user.id, product_id: product.id, quantity: 1 }, { onConflict: "user_id,product_id" });
    setAdding(false);
    if (error) { window.alert(error.message); return; }
    window.location.href = "/cart";
  }

  return <article className="group overflow-hidden rounded-[10px] border border-[#dde5ef] bg-white transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm">
    <div className="relative">
      <Link href={"/produto/" + encodeURIComponent(product.slug)} className="block"><div className="relative aspect-square overflow-hidden bg-slate-50">{image ? <Image src={image} alt={product.name} fill unoptimized className="object-cover transition duration-300 group-hover:scale-[1.03]" sizes="(max-width: 768px) 50vw, 25vw" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>}<div className="absolute left-3 top-3 flex gap-2">{product.featured && <span className="rounded bg-white px-2 py-1 text-[9px] font-black text-[#001B44]">FEATURED</span>}{product.isNew && <span className="rounded bg-[#003B95] px-2 py-1 text-[9px] font-black text-white">NEW</span>}</div></div></Link>
      <button type="button" onClick={toggleFavorite} aria-label="Save product" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-sm shadow-sm">{favorite ? "♥" : "♡"}</button>
    </div>
    <div className="p-4">
      {product.category && <p className="line-clamp-1 text-[10px] font-black uppercase tracking-wide text-blue-600">{product.category.name}</p>}
      <Link href={"/produto/" + encodeURIComponent(product.slug)} className="mt-1 block line-clamp-2 min-h-10 text-sm font-extrabold leading-5 text-[#001B44] hover:text-[#003B95]">{product.name}</Link>
      {product.supplier && <p className="mt-2 line-clamp-1 text-xs text-slate-500">{product.supplier.verified ? "✓ " : ""}{product.supplier.name}</p>}
      <div className="mt-3 flex items-end gap-2"><span className="text-lg font-black text-[#001B44]">{money(product.price)}</span>{product.compareAtPrice && product.compareAtPrice > product.price && <span className="text-xs text-slate-400 line-through">{money(product.compareAtPrice)}</span>}</div>
      {product.rating > 0 && <p className="mt-1 text-xs text-slate-500">★ {product.rating.toFixed(1)} <span className="text-slate-400">({product.reviewCount})</span></p>}
      <button type="button" onClick={addToCart} disabled={adding || product.stock <= 0} className="mt-4 w-full rounded-lg bg-[#003B95] px-3 py-2.5 text-xs font-black text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-300">{adding ? "Adding..." : product.stock > 0 ? "Add to cart" : "Out of stock"}</button>
    </div>
  </article>;
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  return <Link href={"/fornecedores/" + encodeURIComponent(supplier.slug)} className="flex gap-4 rounded-[10px] border border-[#dde5ef] p-4 hover:border-blue-200 hover:bg-[#f8fbff]"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#eef4fb] text-sm font-black text-[#001B44]">{supplier.logoUrl ? <Image src={supplier.logoUrl} alt={supplier.name} width={48} height={48} unoptimized className="h-full w-full object-cover" /> : supplier.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-black text-[#001B44]">{supplier.name}</p><p className="mt-1 text-xs text-slate-500">{supplier.countryName} · {supplier.productCount} products</p>{supplier.verified && <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-[#003B95]">✓ Verified supplier</p>}</div></Link>;
}
