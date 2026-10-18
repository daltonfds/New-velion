"use client";

import { useEffect, useState } from "react";
import "./MobileBottomNavigation.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Users, Wallet,
  Settings, UserRound, CircleHelp, Plug, MoreHorizontal, X,
  ClipboardList, Store, ChartNoAxesCombined
} from "lucide-react";

const primaryItems = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vendas", href: "/dashboard/sales", icon: ShoppingBag },
  { label: "Produtos", href: "/dashboard/products", icon: Package },
  { label: "Conta", href: "/account", icon: UserRound },
];

const moreItems = [
  { label: "Pedidos", href: "/dashboard/orders", icon: ClipboardList },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Afiliados", href: "/dashboard/affiliates", icon: Users },
  { label: "Pagamentos", href: "/dashboard/payouts", icon: Wallet },
  { label: "Estatísticas", href: "/dashboard/analytics", icon: ChartNoAxesCombined },
  { label: "Integrações e API", href: "/dashboard/integrations", icon: Plug },
  { label: "Definições", href: "/dashboard/settings", icon: Settings },
  { label: "Ajuda", href: "/support", icon: CircleHelp },
];

export default function MobileBottomNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      const pathIsApp = ["/dashboard", "/admin", "/seller", "/affiliate", "/account", "/orders", "/products", "/marketplace", "/integrations", "/settings", "/payouts", "/support"].some((prefix) => window.location.pathname === prefix || window.location.pathname.startsWith(prefix + "/"));
      document.body.classList.toggle("nv-has-mobile-nav", media.matches && pathIsApp);
    };
    sync();
    media.addEventListener("change", sync);
    return () => { media.removeEventListener("change", sync); document.body.classList.remove("nv-has-mobile-nav"); };
  }, [pathname]);

  // Keep the mobile app navigation out of public storefront, product, cart and auth pages.
  const isAppArea = /^\/(dashboard|admin|seller|affiliate|account|orders|products|marketplace|integrations|settings|payouts|support)(\/|$)/.test(pathname || "");
  const isAuthOrPublicAccount = /^\/(login|register|auth|produto|cart|wishlist)(\/|$)/.test(pathname || "");
  if (!isAppArea || isAuthOrPublicAccount) return null;

  const active = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

  return (
    <>
      {open && (
        <div className="nv-mobile-more-backdrop" onClick={() => setOpen(false)}>
          <section className="nv-mobile-more-sheet" role="dialog" aria-modal="true" aria-label="Mais funções" onClick={(event) => event.stopPropagation()}>
            <div className="nv-mobile-more-heading">
              <div><span>Newvelion</span><h2>Mais funções</h2></div>
              <button type="button" aria-label="Fechar menu" onClick={() => setOpen(false)}><X size={21} /></button>
            </div>
            <div className="nv-mobile-more-grid">
              {moreItems.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className={active(href) ? "active" : ""}>
                  <span className="nv-mobile-more-icon"><Icon size={20} strokeWidth={1.8} /></span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
      <nav className="nv-mobile-bottom-nav" aria-label="Navegação principal mobile">
        {primaryItems.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className={active(href) ? "active" : ""}>
            <Icon size={21} strokeWidth={active(href) ? 2.2 : 1.8} />
            <span>{label}</span>
          </Link>
        ))}
        <button type="button" aria-expanded={open} aria-label={open ? "Fechar mais funções" : "Abrir mais funções"} className={open ? "active" : ""} onClick={() => setOpen(value => !value)}>
          {open ? <X size={21} /> : <MoreHorizontal size={22} />}
          <span>Mais</span>
        </button>
      </nav>
    </>
  );
}
