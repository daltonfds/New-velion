import Image from "next/image";
import Link from "next/link";
import { getPublicMarketplace } from "@/lib/public-marketplace/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getPublicMarketplace();
  const category = catalog.categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const products = catalog.products.filter((item) => item.category?.slug === slug);

  return <main className="nv-market">
    <header className="nv-header">
      <div className="nv-container nv-header-main">
        <Link href="/marketplace" className="nv-logo"><span className="nv-mark" aria-hidden="true"><i/><i/><i/></span><span>Newvelion</span></Link>
        <form className="nv-search" action="/marketplace"><input name="q" placeholder="Search for products, brands and more..." aria-label="Search products"/><button aria-label="Search">⌕</button></form>
        <nav className="nv-actions"><Link href="/account"><span>♙</span><b>Account</b></Link><Link href="/wishlist"><span>♡</span><b>Wishlist</b></Link><Link href="/cart"><span className="nv-cart-icon">▢<em>0</em></span><b>Cart</b></Link></nav>
      </div>
      <div className="nv-categories"><div className="nv-container nv-category-scroll"><Link href="/marketplace">All Departments</Link>{catalog.categories.slice(0,10).map(c=><Link key={c.id} href={"/marketplace/categoria/"+encodeURIComponent(c.slug)} className={c.slug===slug?"active":""}>{c.name}</Link>)}</div></div>
    </header>
    <nav className="nv-dealsbar"><div className="nv-container nv-deals-scroll"><Link href="/marketplace">Deals</Link><Link href="/marketplace">New Arrivals</Link><Link href="/marketplace">Bulk Savings</Link><Link href="/marketplace">Newvelion Sale</Link><Link href="/register/customer">Business Account</Link></div></nav>
    <div className="nv-container">
      <section className="nv-section">
        <div className="nv-catalog-head"><div><span className="nv-kicker">CATEGORY</span><h1>{category.name}</h1><p>{products.length} products available</p></div><div className="nv-sort"><select aria-label="Sort products"><option>Sort: Recommended</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Newest</option></select></div></div>
        <div className="nv-filter-layout">
          <aside className="nv-filter-sidebar" aria-label="Product filters">
            <div className="nv-filter-group"><h3>Category</h3><label className="nv-filter-option"><input type="checkbox" checked readOnly/> {category.name}</label></div>
            <div className="nv-filter-group"><h3>Brand</h3><label className="nv-filter-option"><input type="checkbox"/> Newvelion products</label></div>
            <div className="nv-filter-group"><h3>Price Range</h3><label className="nv-filter-option"><input type="checkbox"/> Under R 250</label><label className="nv-filter-option"><input type="checkbox"/> R 250 – R 1,000</label><label className="nv-filter-option"><input type="checkbox"/> Over R 1,000</label></div>
            <div className="nv-filter-group"><h3>Pack Size</h3><label className="nv-filter-option"><input type="checkbox"/> Single</label><label className="nv-filter-option"><input type="checkbox"/> Bulk / Case</label></div>
            <div className="nv-filter-group"><h3>Rating</h3><label className="nv-filter-option"><input type="checkbox"/> 4★ & above</label></div>
          </aside>
          <div>
            <button className="nv-filter-mobile">Filter</button>
            {products.length ? <div className="nv-product-grid">{products.map(p=><article key={p.id} className="nv-product-card"><div className="nv-product-image"><Link href={"/produto/"+encodeURIComponent(p.slug)}>{p.images[0]&&<Image src={p.images[0]} alt={p.name} fill unoptimized loading="lazy" sizes="(max-width:767px) 100vw,(max-width:1023px) 50vw,25vw"/>}</Link></div><div className="nv-product-body"><Link href={"/produto/"+encodeURIComponent(p.slug)} className="nv-product-name">{p.name}</Link><div className="nv-price-row"><strong>R {Number(p.price).toFixed(2)}</strong></div><Link href={"/produto/"+encodeURIComponent(p.slug)} className="nv-add">View Product</Link></div></article>)}</div> : <div className="nv-empty"><b>No products in this category yet.</b><Link href="/marketplace">Browse all products</Link></div>}
          </div>
        </div>
      </section>
    </div>
    <footer className="nv-footer"><div className="nv-container nv-footer-grid"><div><div className="nv-logo footer-logo"><span className="nv-mark"><i/><i/><i/></span><span>Newvelion</span></div><p>Commerce infrastructure.</p></div><div><b>Customer Service</b><Link href="/support">Help & Support</Link><Link href="/account">My Account</Link></div><div><b>About Newvelion</b><Link href="/fornecedores">Suppliers</Link><Link href="/terms">Terms</Link></div><div><b>Business</b><Link href="/register/supplier">Become a Supplier</Link><Link href="/register/customer">Business Account</Link></div></div><div className="nv-container nv-copyright">© 2026 Newvelion. All rights reserved.</div></footer>
  </main>;
}
