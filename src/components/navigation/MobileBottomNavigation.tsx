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
  item("Painel", "/dashboard/seller", LayoutDashboard),
  item("Vendas", "/dashboard/seller/sales", ShoppingBag),
  item("Produtos", "/dashboard/seller/products", Package),
  item("Carteira", "/dashboard/seller/wallet", Wallet),
];
const sellerMore = [
  item("Marketplace", "/dashboard/seller/marketplace", Store),
  item("Comissões", "/dashboard/seller/commissions", CreditCard),
  item("Análises", "/dashboard/seller/performance", ChartNoAxesCombined),
  item("Top Scale", "/top-scale", BarChart3),
  item("Classificação", "/dashboard/seller/ranking", Trophy),
  item("Integrações", "/dashboard/seller/integrations", Plug),
  item("Links de venda", "/dashboard/seller/links", Link2),
  item("Levantamentos", "/dashboard/seller/withdrawals", Wallet),
  item("Afiliados", "/dashboard/affiliate", Users),
];
const supplierMain = [
  item("Painel", "/dashboard/supplier", LayoutDashboard),
  item("Produtos", "/dashboard/supplier/products", Package),
  item("Pedidos", "/dashboard/supplier/orders", ClipboardList),
  item("Envios", "/dashboard/supplier/shipping", Truck),
];
const supplierMore = [
  item("Levantamentos", "/dashboard/supplier/withdrawals", Wallet),
  item("Definições", "/dashboard/supplier/settings", Settings),
  item("Perfil empresarial", "/dashboard/supplier/profile", UserRound),
  item("Programa de afiliados", "/dashboard/affiliate", Users),
];
const affiliateMain = [
  item("Painel", "/dashboard/affiliate", LayoutDashboard),
  item("Indicações", "/dashboard/affiliate", Link2),
  item("Levantamentos", "/dashboard/affiliate/withdrawals", Wallet),
];
const affiliateMore = [
  item("Painel de vendas", "/dashboard/seller", Store),
  item("Painel de fornecedor", "/dashboard/supplier", Truck),
];
const adminMain = [
  item("Painel", "/dashboard/admin", LayoutDashboard),
  item("Utilizadores", "/dashboard/admin/users", Users),
  item("Produtos", "/dashboard/admin/products", Package),
  item("Pedidos", "/dashboard/admin/checkout-sessions", ClipboardList),
];
const adminMore = [
  item("Vendedores", "/dashboard/admin/sellers", Store),
  item("Fornecedores / produtores", "/dashboard/admin/suppliers", Truck),
  item("Definições da plataforma", "/dashboard/admin/platform-settings", SlidersHorizontal),
  item("Revisão de produtos", "/dashboard/admin/products/review", BadgeCheck),
  item("Avaliações", "/dashboard/admin/product-reviews", MessageSquare),
  item("Categorias", "/dashboard/admin/categories", Tags),
  item("Transações", "/dashboard/admin/transactions", Receipt),
  item("Comissões", "/dashboard/admin/commissions", CreditCard),
  item("Levantamentos", "/dashboard/admin/withdrawals", Wallet),
  item("Adesões ao clube", "/dashboard/admin/club-memberships", Users),
  item("Disputas", "/dashboard/admin/disputes", ShieldCheck),
  item("Verificação KYC", "/dashboard/admin/kyc", FileCheck),
  item("Análises", "/dashboard/admin/analytics", ChartNoAxesCombined),
  item("Perfil", "/dashboard/profile", UserRound),
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
    : roleArea === "account" ? [item("Conta", "/account", UserRound), item("Painel", "/dashboard", LayoutDashboard)]
    : sellerMain;
  const moreItems = roleArea === "admin" ? adminMore
    : roleArea === "supplier" ? supplierMore
    : roleArea === "affiliate" ? affiliateMore
    : roleArea === "account" ? [item("Perfil", "/dashboard/profile", UserRound), item("Ajuda", "/support", CircleHelp)]
    : sellerMore;

  const active = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

  return (
    <>
      {open && (
        <div className="nv-mobile-more-backdrop" onClick={() => setOpen(false)}>
          <section className="nv-mobile-more-sheet" role="dialog" aria-modal="true" aria-label="Mais funções" onClick={(event) => event.stopPropagation()}>
            <div className="nv-mobile-more-heading">
              <div><span>Newvelion · {roleArea === "admin" ? "Administração" : roleArea === "supplier" ? "Fornecedor / Produtor" : roleArea === "affiliate" ? "Afiliado" : roleArea === "account" ? "Conta" : "Vendedor"}</span><h2>Mais funções</h2></div>
              <button type="button" aria-label="Fechar menu" onClick={() => setOpen(false)}><X size={21} /></button>
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
      <nav className={`nv-mobile-bottom-nav nv-mobile-bottom-nav-${roleArea}`} aria-label="Navegação principal mobile">
        {mainItems.map(({ label, href, icon: Icon }) => (
          <Link key={label + href} href={href} aria-current={active(href) ? "page" : undefined} className={active(href) ? "active" : ""}>
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
