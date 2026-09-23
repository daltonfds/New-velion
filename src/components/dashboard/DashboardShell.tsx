"use client";

import { ReactNode, useState } from "react";
import ProfileCompletionGuard from "@/components/profile/ProfileCompletionGuard";
import Link from "next/link";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";

type Lang = "en" | "pt";
type Area = "seller" | "supplier" | "admin";

const labels = {
  en: {
    seller: "Seller / Affiliate",
    supplier: "Supplier",
    admin: "Administration",
    dashboard: "Dashboard",
    marketplace: "Marketplace",
    availableProducts: "Available Products",
    selectedProducts: "Selected Products",
    sales: "Sales",
    commissions: "Commissions",
    performance: "Clicks & Conversions",
    links: "Sales Links",
    creatives: "Creatives",
    reports: "Reports",
    withdrawals: "Withdrawals",
    addProducts: "Add Products",
    catalog: "Catalog",
    prices: "Prices",
    stock: "Stock",
    offers: "Offers",
    affiliateCommission: "Affiliate Commission",
    metrics: "Metrics",
    orders: "Orders",
    users: "Users",
    sellers: "Sellers",
    suppliers: "Suppliers",
    products: "Products",
    categories: "Categories",
    transactions: "Transactions",
    disputes: "Disputes",
    kyc: "KYC",
    analytics: "Analytics",
    logout: "Log out",
    settings: "Settings",
    language: "Language",
  },
  pt: {
    seller: "Vendedor / Afiliado",
    supplier: "Fornecedor",
    admin: "Administração",
    dashboard: "Dashboard",
    marketplace: "Marketplace",
    availableProducts: "Produtos disponíveis",
    selectedProducts: "Produtos selecionados",
    sales: "Vendas",
    commissions: "Comissões",
    performance: "Cliques e conversões",
    links: "Links de venda",
    creatives: "Criativos",
    reports: "Relatórios",
    withdrawals: "Saques",
    addProducts: "Adicionar produtos",
    catalog: "Catálogo",
    prices: "Preços",
    stock: "Stock",
    offers: "Ofertas",
    affiliateCommission: "Comissão de afiliação",
    metrics: "Métricas",
    orders: "Pedidos",
    users: "Utilizadores",
    sellers: "Vendedores",
    suppliers: "Fornecedores",
    products: "Produtos",
    categories: "Categorias",
    transactions: "Transações",
    disputes: "Disputas",
    kyc: "KYC",
    analytics: "Analytics",
    logout: "Sair",
    settings: "Definições",
    language: "Idioma",
  },
} as const;

type LabelKey = keyof (typeof labels)["en"];

type NavItem = {
  key: LabelKey;
  href: string;
  icon: typeof LayoutDashboard;
};

const sellerItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard/seller", icon: LayoutDashboard },
  { key: "marketplace", href: "/marketplace", icon: ShoppingCart },
  { key: "availableProducts", href: "/dashboard/seller/products", icon: Package },
  { key: "selectedProducts", href: "/dashboard/seller/selected", icon: Boxes },
  { key: "sales", href: "/dashboard/seller/sales", icon: TrendingUp },
  { key: "commissions", href: "/dashboard/seller/commissions", icon: CircleDollarSign },
  { key: "performance", href: "/dashboard/seller/performance", icon: BarChart3 },
  { key: "links", href: "/dashboard/seller/links", icon: Tags },
  { key: "creatives", href: "/dashboard/seller/creatives", icon: FileText },
  { key: "reports", href: "/dashboard/seller/reports", icon: BarChart3 },
  { key: "withdrawals", href: "/dashboard/seller/withdrawals", icon: Wallet },
];

const supplierItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard/supplier", icon: LayoutDashboard },
  { key: "addProducts", href: "/dashboard/supplier/products/new", icon: Package },
  { key: "catalog", href: "/dashboard/supplier/catalog", icon: Boxes },
  { key: "prices", href: "/dashboard/supplier/prices", icon: Tags },
  { key: "stock", href: "/dashboard/supplier/stock", icon: Package },
  { key: "offers", href: "/dashboard/supplier/offers", icon: TrendingUp },
  { key: "affiliateCommission", href: "/dashboard/supplier/commissions", icon: CircleDollarSign },
  { key: "metrics", href: "/dashboard/supplier/metrics", icon: BarChart3 },
  { key: "orders", href: "/dashboard/supplier/orders", icon: ShoppingCart },
  { key: "withdrawals", href: "/dashboard/supplier/withdrawals", icon: Wallet },
];

const adminItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { key: "users", href: "/dashboard/admin/users", icon: Users },
  { key: "sellers", href: "/dashboard/admin/sellers", icon: Users },
  { key: "suppliers", href: "/dashboard/admin/suppliers", icon: Users },
  { key: "products", href: "/dashboard/admin/products", icon: Package },
  { key: "categories", href: "/dashboard/admin/categories", icon: Tags },
  { key: "transactions", href: "/dashboard/admin/transactions", icon: CircleDollarSign },
  { key: "commissions", href: "/dashboard/admin/commissions", icon: TrendingUp },
  { key: "withdrawals", href: "/dashboard/admin/withdrawals", icon: Wallet },
  { key: "disputes", href: "/dashboard/admin/disputes", icon: FileText },
  { key: "kyc", href: "/dashboard/admin/kyc", icon: Users },
  { key: "analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
];

const areaItems: Record<Area, NavItem[]> = {
  seller: sellerItems,
  supplier: supplierItems,
  admin: adminItems,
};

const areaNames: Record<Area, LabelKey> = {
  seller: "seller",
  supplier: "supplier",
  admin: "admin",
};

export default function DashboardShell({
  area,
  activeKey,
  title,
  subtitle,
  children,
}: {
  area: Area;
  activeKey: LabelKey;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [languageOpen, setLanguageOpen] = useState(false);

  const t = labels[lang];

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <ProfileCompletionGuard />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/marketplace" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1769e0] text-lg font-black text-white">
              V
            </div>
            <span className="text-xl font-bold tracking-tight">NewVelion</span>
          </Link>

          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-5">
          <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {t[areaNames[area]]}
          </div>

          <nav className="space-y-1">
            {areaItems[area].map((item) => {
              const Icon = item.icon;
              const active = item.key === activeKey;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#1769e0] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.9} />
                  <span>{t[item.key]}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-4">
          <Link
            href="/dashboard/profile"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <Settings size={18} />
            {t.settings}
          </Link>

          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <LogOut size={18} />
            {t.logout}
          </button>
        </div>
      </aside>

      {open && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-bold sm:text-xl">{title}</h1>
              {subtitle && (
                <p className="hidden text-sm text-slate-500 sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button
                onClick={() => setLanguageOpen((value) => !value)}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {lang.toUpperCase()}
                <ChevronDown size={15} />
              </button>

              {languageOpen && (
                <div className="absolute right-0 mt-2 w-28 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                  <button
                    onClick={() => {
                      setLang("en");
                      setLanguageOpen(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setLang("pt");
                      setLanguageOpen(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                  >
                    Português
                  </button>
                </div>
              )}
            </div>

            <button className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700 sm:flex">
              D
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
