"use client";

import { useEffect, useState } from "react";
import "./MobileBottomNavigation.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Users, Wallet, Settings, UserRound,
  CircleHelp, Plug, MoreHorizontal, X, ClipboardList, Store, ChartNoAxesCombined,
  Truck, BadgeCheck, BarChart3, Link2, Trophy, Tags, CreditCard, ShieldCheck,
  FileCheck, MessageSquare, Receipt, SlidersHorizontal
} from "lucide-react";

type Item = { label: string; href: string; icon: typeof LayoutDashboard };

const item = (label: string, href: string, icon: Item["icon"]): Item => ({ label, href, icon });

const sellerMain = [
  item("Dashboard", "/dashboard/seller", LayoutDashboard),
  item("Sales", "/dashboard/seller/sales", ShoppingBag),
  item("Products", "/dashboard/seller/products", Package),
  item("Wallet", "/dashboard/seller/wallet", Wallet),
];
const sellerMore = [
  item("Marketplace", "/dashboard/seller/marketplace", Store),
  item("Commissions", "/dashboard/seller/commissions", CreditCard),
  item("Analytics", "/dashboard/seller/performance", ChartNoAxesCombined),
  item("Top Scale", "/top-scale", BarChart3),
  item("Ranking", "/dashboard/seller/ranking", Trophy),
  item("Integrations", "/dashboard/seller/integrations", Plug),
  item("Sales Links", "/dashboard/seller/links", Link2),
  item("Withdrawals", "/dashboard/seller/withdrawals", Wallet),
  item("Affiliates", "/dashboard/affiliate", Users),
];
const supplierMain = [
  item("Dashboard", "/dashboard/supplier", LayoutDashboard),
  item("Products", "/dashboard/supplier/products", Package),
  item("Orders", "/dashboard/supplier/orders", ClipboardList),
  item("Shipments", "/dashboard/supplier/shipping", Truck),
];
const supplierMore = [
  item("Withdrawals", "/dashboard/supplier/withdrawals", Wallet),
  item("Settings", "/dashboard/supplier/settings", Settings),
  item("Business Profile", "/dashboard/supplier/profile", UserRound),
  item("Affiliate Program", "/dashboard/affiliate", Users),
];
const affiliateMain = [
  item("Dashboard", "/dashboard/affiliate", LayoutDashboard),
  item("Referrals", "/dashboard/affiliate", Link2),
  item("Withdrawals", "/dashboard/affiliate/withdrawals", Wallet),
];
const affiliateMore = [
  item("Sales Dashboard", "/dashboard/seller", Store),
  item("Supplier Dashboard", "/dashboard/supplier", Truck),
];
const adminMain = [
  item("Dashboard", "/dashboard/admin", LayoutDashboard),
  item("Users", "/dashboard/admin/users", Users),
  item("Products", "/dashboard/admin/products", Package),
  item("Orders", "/dashboard/admin/checkout-sessions", ClipboardList),
];
const adminMore = [
  item("Sellers", "/dashboard/admin/sellers", Store),
  item("Suppliers / Producers", "/dashboard/admin/suppliers", Truck),
  item("Platform Settings", "/dashboard/admin/platform-settings", SlidersHorizontal),
  item("Product Review", "/dashboard/admin/products/review", BadgeCheck),
  item("Reviews", "/dashboard/admin/product-reviews", MessageSquare),
  item("Categories", "/dashboard/admin/categories", Tags),
  item("Transactions", "/dashboard/admin/transactions", Receipt),
  item("Commissions", "/dashboard/admin/commissions", CreditCard),
  item("Withdrawals", "/dashboard/admin/withdrawals", Wallet),
  item("Club Memberships", "/dashboard/admin/club-memberships", Users),
  item("Disputes", "/dashboard/admin/disputes", ShieldCheck),
  item("KYC Verification", "/dashboard/admin/kyc", FileCheck),
  item("Analytics", "/dashboard/admin/analytics", ChartNoAxesCombined),
  item("Profile", "/dashboard/profile", UserRound),
];

export default function MobileBottomNavigation() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      const pathIsApp = pathname.startsWith("/dashboard/") || pathname === "/dashboard" || pathname === "/account";
      document.body.classList.toggle("nv-has-mobile-nav", media.matches && pathIsApp);
    };
    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      document.body.classList.remove("nv-has-mobile-nav");
    };
  }, [pathname]);

  if (!(pathname.startsWith("/dashboard/") || pathname === "/dashboard" || pathname === "/account")) return null;

  const roleArea = pathname.startsWith("/dashboard/admin") ? "admin"
    : pathname.startsWith("/dashboard/supplier") ? "supplier"
    : pathname.startsWith("/dashboard/affiliate") ? "affiliate"
    : pathname.startsWith("/dashboard/seller") || pathname === "/dashboard" ? "seller"
    : "account";

  const mainItems = roleArea === "admin" ? adminMain
    : roleArea === "supplier" ? supplierMain
    : roleArea === "affiliate" ? affiliateMain
    : roleArea === "account" ? [item("Account", "/account", UserRound), item("Dashboard", "/dashboard", LayoutDashboard)]
    : sellerMain;
  const moreItems = roleArea === "admin" ? adminMore
    : roleArea === "supplier" ? supplierMore
    : roleArea === "affiliate" ? affiliateMore
    : roleArea === "account" ? [item("Profile", "/dashboard/profile", UserRound), item("Help", "/support", CircleHelp)]
    : sellerMore;

  const active = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

  return (
    <>
      {open && (
        <div className="nv-mobile-more-backdrop" onClick={() => setOpen(false)}>
          <section className="nv-mobile-more-sheet" role="dialog" aria-modal="true" aria-label="More options" onClick={(event) => event.stopPropagation()}>
            <div className="nv-mobile-more-heading">
              <div><span>Newvelion · {roleArea === "admin" ? "Administration" : roleArea === "supplier" ? "Supplier / Producer" : roleArea === "affiliate" ? "Affiliate" : roleArea === "account" ? "Account" : "Seller"}</span><h2>More options</h2></div>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}><X size={21} /></button>
            </div>
            <div className="nv-mobile-more-grid">
              {moreItems.map(({ label, href, icon: Icon }) => (
                <Link key={label + href} href={href} className={active(href) ? "active" : ""} onClick={() => setOpen(false)}>
                  <span className="nv-mobile-more-icon"><Icon size={20} strokeWidth={1.8} /></span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
      <nav className={`nv-mobile-bottom-nav nv-mobile-bottom-nav-${roleArea}`} aria-label="Mobile primary navigation">
        {mainItems.map(({ label, href, icon: Icon }) => (
          <Link key={label + href} href={href} aria-current={active(href) ? "page" : undefined} className={active(href) ? "active" : ""}>
            <Icon size={21} strokeWidth={active(href) ? 2.2 : 1.8} />
            <span>{label}</span>
          </Link>
        ))}
        <button type="button" aria-expanded={open} aria-label={open ? "Close more options" : "Open more options"} className={open ? "active" : ""} onClick={() => setOpen(value => !value)}>
          {open ? <X size={21} /> : <MoreHorizontal size={22} />}
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
