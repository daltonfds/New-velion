import Link from "next/link";

export default function Header() {
  return <header className="nv-header">
    <div className="nv-container nv-header-main">
      <Link href="/marketplace" className="nv-logo" aria-label="Newvelion home"><span className="nv-mark" aria-hidden="true"><i/><i/><i/></span><span>Newvelion</span></Link>
      <form className="nv-search" action="/marketplace"><input name="q" placeholder="Search for products, brands and more..." aria-label="Search products"/><button aria-label="Search">⌕</button></form>
      <nav className="nv-actions"><Link href="/account"><span>♙</span><b>Account</b></Link><Link href="/wishlist"><span>♡</span><b>Wishlist</b></Link><Link href="/cart"><span className="nv-cart-icon">▢<em>0</em></span><b>Cart</b></Link></nav>
    </div>
    <div className="nv-categories"><div className="nv-container nv-category-scroll"><Link href="/marketplace">All Departments</Link><Link href="/marketplace">Groceries</Link><Link href="/marketplace">Electronics</Link><Link href="/marketplace">Home</Link><Link href="/marketplace">Appliances</Link><Link href="/marketplace">Baby</Link><Link href="/marketplace">Sports</Link><Link href="/marketplace">Toys</Link></div></div>
    <nav className="nv-dealsbar"><div className="nv-container nv-deals-scroll"><Link href="/marketplace#deals">Deals</Link><Link href="/marketplace#new">New Arrivals</Link><Link href="/marketplace#bulk">Bulk Savings</Link><Link href="/marketplace#deals">Newvelion Sale</Link><Link href="/register/customer">Business Account</Link></div></nav>
  </header>;
}
