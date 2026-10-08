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
type Category = { id: string; name: string; slug: string };
type Supplier = { id: string; slug: string; name: string; countryName: string; verified: boolean; productCount: number; logoUrl: string | null };

const money = (value: number) => new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(value);

export function PublicMarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams({ limit: "48" });
        if (q.trim()) params.set("q", q.trim());
        if (category) params.set("category", category);
        const res = await fetch("/api/public/marketplace?" + params.toString(), { signal: controller.signal, cache: "no-store" });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Unable to load the public marketplace.");
        setProducts(body.products || []);
        setCategories(body.categories || []);
        setSuppliers(body.suppliers || []);
        setError("");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError(e instanceof Error ? e.message : "Unable to load the public marketplace.");
      } finally { setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [q, category]);

  const visibleCategories = useMemo(() => categories.slice(0, 10), [categories]);
  const deals = useMemo(() => products.filter(p => p.compareAtPrice != null && p.compareAtPrice > p.price).slice(0, 8), [products]);
  const best = useMemo(() => products.filter(p => p.featured).slice(0, 8), [products]);
  const arrivals = useMemo(() => products.filter(p => p.isNew).slice(0, 8), [products]);
  const shown = useMemo(() => {
    const copy = [...products];
    if (sort === "price-low") copy.sort((a,b) => a.price-b.price);
    if (sort === "price-high") copy.sort((a,b) => b.price-a.price);
    if (sort === "rating") copy.sort((a,b) => b.rating-a.rating);
    return copy;
  }, [products, sort]);

  function clearFilters() { setQ(""); setCategory(""); setSort("featured"); }

  return (
    <main className="nv-market">
      <div className="nv-topline">
        <div className="nv-container nv-topline-inner"><span>South Africa delivery • Secure checkout</span><div><Link href="/support">Help</Link><Link href="/fornecedores">Sell on Newvelion</Link></div></div>
      </div>

      <header className="nv-header">
        <div className="nv-container nv-header-main">
          <button className="nv-mobile-menu" onClick={() => setMenuOpen(v => !v)} aria-label="Open menu">☰</button>
          <Link href="/" className="nv-logo" aria-label="Newvelion home">
            <span className="nv-mark"><i/><i/><i/></span><span>Newvelion</span>
          </Link>
          <form className="nv-search" onSubmit={e => e.preventDefault()}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search for products, brands and more..." aria-label="Search products" />
            <button aria-label="Search" type="submit">⌕</button>
          </form>
          <nav className="nv-actions">
            <Link href="/account" aria-label="Account"><span>♙</span><b>Account</b></Link>
            <Link href="/wishlist" aria-label="Wishlist"><span>♡</span><b>Wishlist</b></Link>
            <Link href="/cart" aria-label="Cart"><span className="nv-cart-icon">▢<em>0</em></span><b>Cart</b></Link>
          </nav>
        </div>
        <div className="nv-categories">
          <div className="nv-container nv-category-scroll">
            <Link href="/">All Departments</Link>
            {visibleCategories.map(c => <button key={c.id} onClick={() => setCategory(c.slug)} className={category === c.slug ? "active" : ""}>{c.name}</button>)}
          </div>
        </div>
        {menuOpen && <div className="nv-mobile-drawer"><Link href="/">All Departments</Link>{visibleCategories.map(c => <button key={c.id} onClick={() => {setCategory(c.slug);setMenuOpen(false)}}>{c.name}</button>)}</div>}
      </header>

      <nav className="nv-dealsbar"><div className="nv-container nv-deals-scroll"><Link href="#deals">Deals</Link><Link href="#new">New Arrivals</Link><Link href="#bulk">Bulk Savings</Link><Link href="#deals">Newvelion Sale</Link><Link href="/register/customer">Business Account</Link></div></nav>

      <div className="nv-container">
        <section className="nv-hero">
          <div className="nv-hero-copy">
            <span className="nv-kicker">NEWVELION MARKETPLACE</span>
            <h1>BIG VALUE.<br/>SMARTER SHOPPING.</h1>
            <p>Discover products from verified suppliers with delivery across South Africa.</p>
            <button onClick={() => document.getElementById("catalog")?.scrollIntoView({behavior:"smooth"})}>Shop Now</button>
          </div>
          {products[0]?.images[0] && <div className="nv-hero-product"><Image src={products[0].images[0]} alt={products[0].name} fill unoptimized sizes="40vw" priority /></div>}
        </section>

        <section className="nv-section nv-category-feature">
          <div className="nv-section-heading"><div><span className="nv-kicker">SHOP BY DEPARTMENT</span><h2>Find what you need</h2></div></div>
          <div className="nv-department-grid">
            {visibleCategories.slice(0,8).map(c => <button key={c.id} onClick={() => setCategory(c.slug)} className={category === c.slug ? "selected" : ""}><span>◆</span><strong>{c.name}</strong></button>)}
          </div>
        </section>

        {deals.length > 0 && <section id="deals" className="nv-section"><SectionTitle kicker="HOT DEALS" title="Deals of the Week" /><ProductGrid products={deals}/></section>}
        {best.length > 0 && <section className="nv-section"><SectionTitle kicker="TOP PICKS" title="Best Sellers" /><ProductGrid products={best}/></section>}

        <section id="bulk" className="nv-promo">
          <div><span className="nv-kicker">FOR BUSINESS</span><h2>Buy more. Save more.</h2><p>Access a marketplace built for smart sourcing, sellers and growing businesses.</p><Link href="/register/customer">Create Business Account</Link></div>
        </section>

        {arrivals.length > 0 && <section id="new" className="nv-section"><SectionTitle kicker="JUST IN" title="New Arrivals" /><ProductGrid products={arrivals}/></section>}

        <section id="catalog" className="nv-section">
          <div className="nv-catalog-head">
            <div><span className="nv-kicker">NEWVELION CATALOG</span><h2>Shop all products</h2><p>{loading ? "Loading products..." : shown.length + " products available"}</p></div>
            <div className="nv-sort"><select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Sort: Recommended</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="rating">Top Rated</option></select>{(q || category) && <button onClick={clearFilters}>Clear</button>}</div>
          </div>
          {error && <div className="nv-error">{error}</div>}
          {loading ? <div className="nv-skeleton-grid">{Array.from({length:8}).map((_,i)=><div key={i}/>)}</div> : shown.length ? <ProductGrid products={shown}/> : <div className="nv-empty"><b>No products match your search.</b><button onClick={clearFilters}>Reset filters</button></div>}
        </section>

        {suppliers.length > 0 && <section className="nv-section"><SectionTitle kicker="SUPPLY NETWORK" title="Verified suppliers" /><div className="nv-suppliers">{suppliers.slice(0,6).map(s => <Link key={s.id} href={"/fornecedores/"+encodeURIComponent(s.slug)}><span>{s.logoUrl ? <Image src={s.logoUrl} alt={s.name} width={52} height={52} unoptimized/> : s.name.slice(0,1)}</span><div><b>{s.name}</b><small>{s.countryName} • {s.productCount} products</small>{s.verified && <small className="verified">✓ Verified supplier</small>}</div></Link>)}</div></section>}
      </div>

      <footer className="nv-footer"><div className="nv-container nv-footer-grid"><div><div className="nv-logo footer-logo"><span className="nv-mark"><i/><i/><i/></span><span>Newvelion</span></div><p>Commerce infrastructure.</p></div><div><b>Customer Service</b><Link href="/support">Help & Support</Link><Link href="/account">My Account</Link></div><div><b>About Newvelion</b><Link href="/fornecedores">Suppliers</Link><Link href="/terms">Terms</Link></div><div><b>Business</b><Link href="/fornecedores">Become a Supplier</Link><Link href="/register/customer">Business Account</Link></div></div><div className="nv-container nv-copyright">© 2026 Newvelion. All rights reserved.</div></footer>
    </main>
  );
}

function SectionTitle({kicker,title}:{kicker:string;title:string}) { return <div className="nv-section-heading"><div><span className="nv-kicker">{kicker}</span><h2>{title}</h2></div><Link href="#catalog">View all →</Link></div>; }

function ProductGrid({products}:{products:Product[]}) { return <div className="nv-product-grid">{products.map(p => <ProductCard key={p.id} product={p}/>)}</div>; }

function ProductCard({product}:{product:Product}) {
  const [favorite,setFavorite]=useState(false); const [adding,setAdding]=useState(false);
  useEffect(()=>{let active=true;void(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user)return;const {data}=await supabase.from("customer_favorites").select("id").eq("user_id",user.id).eq("product_id",product.id).maybeSingle();if(active)setFavorite(Boolean(data));})();return()=>{active=false}},[product.id]);
  async function addToCart(){const {data:{user}}=await supabase.auth.getUser();if(!user){window.location.href="/login";return}const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();if(profile?.role!=="customer"){window.location.href="/register/customer";return}setAdding(true);const {error}=await supabase.from("customer_cart_items").upsert({user_id:user.id,product_id:product.id,quantity:1},{onConflict:"user_id,product_id"});setAdding(false);if(error){window.alert(error.message);return}window.location.href="/cart"}
  async function toggleFavorite(){const {data:{user}}=await supabase.auth.getUser();if(!user){window.location.href="/login";return}if(favorite){await supabase.from("customer_favorites").delete().eq("user_id",user.id).eq("product_id",product.id);setFavorite(false)}else{const {error}=await supabase.from("customer_favorites").insert({user_id:user.id,product_id:product.id});if(!error)setFavorite(true)}}
  const discount=product.compareAtPrice&&product.compareAtPrice>product.price?Math.round((1-product.price/product.compareAtPrice)*100):0;
  return <article className="nv-product-card"><div className="nv-product-image"><Link href={"/produto/"+encodeURIComponent(product.slug)}>{product.images[0]?<Image src={product.images[0]} alt={product.name} fill unoptimized sizes="(max-width:768px) 50vw,25vw" loading="lazy"/>:<span>No image</span>}</Link>{discount>0&&<span className="nv-save">-{discount}%</span>}<button className="nv-heart" onClick={toggleFavorite} aria-label="Add to wishlist">{favorite?"♥":"♡"}</button></div><div className="nv-product-body">{product.category&&<small>{product.category.name}</small>}<Link href={"/produto/"+encodeURIComponent(product.slug)} className="nv-product-name">{product.name}</Link>{product.supplier&&<p className="nv-supplier-name">{product.supplier.verified?"✓ ":""}{product.supplier.name}</p>}<div className="nv-price-row"><strong>{money(product.price)}</strong>{product.compareAtPrice&&product.compareAtPrice>product.price&&<del>{money(product.compareAtPrice)}</del>}</div>{product.rating>0&&<div className="nv-rating">★ {product.rating.toFixed(1)} <span>({product.reviewCount})</span></div>}<button className="nv-add" onClick={addToCart} disabled={adding||product.stock<=0}>{adding?"Adding...":product.stock>0?"Add to Cart":"Out of Stock"}</button></div></article>;
}
