"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import {
  ArrowDownToLine, ArrowLeftRight, Award, BadgeCheck, BarChart3, Bell, ClipboardCheck, Gift, Globe,
  LayoutDashboard, LayoutGrid, Link2, LogOut, Menu, Package, Percent, Plug, ReceiptText, Scale,
  Settings, Star, Store, TrendingUp, Trophy, Truck, UserRound, Users, Wallet, Warehouse, type LucideIcon,
} from "lucide-react";

export type AppArea = "seller" | "supplier" | "affiliate" | "admin";

type IconName =
  | "home" | "grid" | "box" | "sales" | "wallet" | "chart" | "trophy" | "link" | "download" | "users"
  | "bell" | "globe" | "menu" | "logout" | "percent" | "plug" | "trending" | "truck" | "settings" | "user"
  | "gift" | "review" | "star" | "transfer" | "scale" | "idcard" | "award" | "store" | "warehouse";

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  group?: string;
}

function countryFlag(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return "";
  return String.fromCodePoint(...normalized.split("").map((letter) => 127397 + letter.charCodeAt(0)));
}

const iconMap: Record<IconName, LucideIcon> = {
  home: LayoutDashboard, grid: LayoutGrid, box: Package, sales: ReceiptText, wallet: Wallet, chart: BarChart3,
  trophy: Trophy, link: Link2, download: ArrowDownToLine, users: Users, bell: Bell, globe: Globe, menu: Menu,
  logout: LogOut, percent: Percent, plug: Plug, trending: TrendingUp, truck: Truck, settings: Settings,
  user: UserRound, gift: Gift, review: ClipboardCheck, star: Star, transfer: ArrowLeftRight, scale: Scale,
  idcard: BadgeCheck, award: Award, store: Store, warehouse: Warehouse,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const Cmp = iconMap[name];
  return <Cmp width={size} height={size} strokeWidth={1.75} aria-hidden />;
}

const groupLabels: Record<string, string> = {
  Platform: "Plataforma", Overview: "Visão geral", Sell: "Vender", Finance: "Finanças", Grow: "Crescer",
  Operations: "Operação", Account: "Conta", People: "Pessoas", Catalog: "Catálogo",
  "Orders & money": "Pedidos e dinheiro", Business: "Negócio",
};

const navigation: Record<AppArea, NavItem[]> = {
  seller: [
    { label: "Dashboard", href: "/dashboard/seller", icon: "home", group: "Overview" },
    { label: "Marketplace", href: "/dashboard/seller/marketplace", icon: "grid", group: "Sell" },
    { label: "My Products", href: "/dashboard/seller/products", icon: "box", group: "Sell" },
    { label: "Orders & Sales", href: "/dashboard/seller/sales", icon: "sales", group: "Sell" },
    { label: "Links", href: "/dashboard/seller/links", icon: "link", group: "Sell" },
    { label: "Commissions", href: "/dashboard/seller/commissions", icon: "percent", group: "Finance" },
    { label: "Wallet", href: "/dashboard/seller/wallet", icon: "wallet", group: "Finance" },
    { label: "Withdrawals", href: "/dashboard/seller/withdrawals", icon: "download", group: "Finance" },
    { label: "Analytics", href: "/dashboard/seller/performance", icon: "chart", group: "Grow" },
    { label: "Top Scale", href: "/top-scale", icon: "trending", group: "Grow" },
    { label: "Ranking", href: "/dashboard/seller/ranking", icon: "trophy", group: "Grow" },
    { label: "Integrations", href: "/dashboard/seller/integrations", icon: "plug", group: "Grow" },
    { label: "Become affiliate", href: "/dashboard/affiliate", icon: "gift", group: "Grow" },
  ],

  supplier: [
    { label: "Dashboard", href: "/dashboard/supplier", icon: "home", group: "Operations" },
    { label: "Products", href: "/dashboard/supplier/products", icon: "box", group: "Operations" },
    { label: "Orders & Fulfillment", href: "/dashboard/supplier/orders", icon: "sales", group: "Operations" },
    { label: "Shipping", href: "/dashboard/supplier/shipping", icon: "truck", group: "Operations" },
    { label: "Withdrawals", href: "/dashboard/supplier/withdrawals", icon: "download", group: "Finance" },
    { label: "Settings", href: "/dashboard/supplier/settings", icon: "settings", group: "Account" },
    { label: "Profile", href: "/dashboard/supplier/profile", icon: "user", group: "Account" },
    { label: "Become affiliate", href: "/dashboard/affiliate", icon: "gift", group: "Account" },
  ],

  affiliate: [
    { label: "Dashboard", href: "/dashboard/affiliate", icon: "home" },
    { label: "Referral program", href: "/dashboard/affiliate", icon: "link" },
    { label: "Withdrawals", href: "/dashboard/affiliate/withdrawals", icon: "download" },
  ],

  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: "home", group: "Overview" },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: "chart", group: "Overview" },
    { label: "Users", href: "/dashboard/admin/users", icon: "users", group: "People" },
    { label: "Sellers", href: "/dashboard/admin/sellers", icon: "store", group: "People" },
    { label: "Suppliers", href: "/dashboard/admin/suppliers", icon: "warehouse", group: "People" },
    { label: "KYC", href: "/dashboard/admin/kyc", icon: "idcard", group: "People" },
    { label: "Products", href: "/dashboard/admin/products", icon: "box", group: "Catalog" },
    { label: "Product Review", href: "/dashboard/admin/products/review", icon: "review", group: "Catalog" },
    { label: "Customer Reviews", href: "/dashboard/admin/product-reviews", icon: "star", group: "Catalog" },
    { label: "Categories", href: "/dashboard/admin/categories", icon: "grid", group: "Catalog" },
    { label: "Orders", href: "/dashboard/admin/checkout-sessions", icon: "sales", group: "Orders & money" },
    { label: "Transactions", href: "/dashboard/admin/transactions", icon: "transfer", group: "Orders & money" },
    { label: "Commissions", href: "/dashboard/admin/commissions", icon: "percent", group: "Orders & money" },
    { label: "Withdrawals", href: "/dashboard/admin/withdrawals", icon: "download", group: "Orders & money" },
    { label: "Disputes", href: "/dashboard/admin/disputes", icon: "scale", group: "Orders & money" },
    { label: "Business Settings", href: "/dashboard/admin/platform-settings", icon: "settings", group: "Business" },
    { label: "Club memberships", href: "/dashboard/admin/club-memberships", icon: "award", group: "Business" },
  ],

};

interface AppShellProps {
  area: AppArea;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppShell({
  area,
  children,
  title,
  subtitle,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileInitial, setProfileInitial] = useState("U");
  const [accountRole, setAccountRole] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [pt, setPt] = useState(false);
  const [referralPopupOpen, setReferralPopupOpen] = useState(false);

  useEffect(() => {
    const sync = () => setPt(localStorage.getItem("newvelion-language") === "pt");
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("newvelion-language-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("newvelion-language-change", sync);
    };
  }, []);

  const t = (en: string, ptText: string) => pt ? ptText : en;

  useEffect(() => {
    if (!["seller", "supplier", "affiliate"].includes(area)) return;
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user;
      const seenKey = user ? `newvelion-referral-popup-seen:${user.id}` : "";
      if (!active || !user || localStorage.getItem(seenKey) === "1") return;
      localStorage.setItem(seenKey, "1");
      setReferralPopupOpen(true);
    }).catch((error) => console.error("Referral popup:", error));
    return () => { active = false; };
  }, [area]);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    setLoggingOut(true);
    sessionStorage.removeItem("newvelion-referral-popup-shown");

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
  }

  const items = area === "affiliate" && accountRole === "seller"
    ? [...navigation.affiliate, { label: "Seller dashboard", href: "/dashboard/seller", icon: "home" as IconName }]
    : area === "affiliate" && accountRole === "supplier"
      ? [...navigation.affiliate, { label: "Supplier dashboard", href: "/dashboard/supplier", icon: "home" as IconName }]
      : navigation[area];

  const groups = items.reduce<{ key: string; items: NavItem[] }[]>((acc, item) => {
    const key = item.group ?? "Platform";
    const found = acc.find((group) => group.key === key);
    if (found) found.items.push(item);
    else acc.push({ key, items: [item] });
    return acc;
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfileInitial() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user || !active) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,nome_completo,country_code,pais,role")
        .eq("id", user.id)
        .maybeSingle();

      const name = String(
        profile?.full_name ||
        profile?.nome_completo ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email ||
        ""
      ).trim();

      if (active && name) {
        setProfileInitial(name.trim().charAt(0).toUpperCase());
      }
      if (active) setCountryCode(String(profile?.country_code || profile?.pais || "").trim().toUpperCase());
      if (active) setAccountRole(String(profile?.role || ""));
    }

    loadProfileInitial();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="nv-app-shell min-h-screen bg-ink-50 text-ink-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-600 focus:shadow-lg"
      >
        {t("Skip to content", "Saltar para o conteúdo")}
      </a>

      {mobileOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col",
          "border-r border-ink-200 bg-white",
          "transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-[72px] items-center border-b border-ink-200 px-6">
          <NewvelionBrand size="md" />
        </div>

        <nav aria-label={t("Main navigation", "Navegação principal")} className="flex-1 overflow-y-auto px-3 pb-5">
          {groups.map((group, index) => (
            <div key={group.key} className={index === 0 ? "pt-4" : "pt-6"}>
              <p className="px-3 pb-2 text-xs font-semibold text-ink-500">
                {t(group.key, groupLabels[group.key] ?? group.key)}
              </p>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.label + item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        "group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
                        active
                          ? "bg-brand-50 font-semibold text-brand-600"
                          : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-5 w-5 shrink-0 items-center justify-center transition-colors duration-150",
                          active ? "text-brand-600" : "text-ink-400 group-hover:text-ink-700",
                        ].join(" ")}
                      >
                        <Icon name={item.icon} />
                      </span>

                      <span>{t(item.label, ({Dashboard:"Painel",Marketplace:"Mercado", "My Products":"Meus produtos","Orders & Sales":"Pedidos e vendas",Commissions:"Comissões",Wallet:"Carteira",Analytics:"Análises","Top Scale":"Top Scale",Ranking:"Classificação",Integrations:"Integrações",Links:"Links",Withdrawals:"Levantamentos",Products:"Produtos","Orders & Fulfillment":"Pedidos e logística",Shipping:"Envio",Settings:"Definições",Profile:"Perfil",Users:"Utilizadores",Sellers:"Vendedores",Suppliers:"Fornecedores","Business Settings":"Definições da plataforma","Product Review":"Revisão de produtos","Customer Reviews":"Avaliações de clientes",Categories:"Categorias",Orders:"Pedidos",Transactions:"Transações",Disputes:"Disputas",KYC:"KYC","Become affiliate":"Tornar-se afiliado","Club memberships":"Adesões ao clube","Seller dashboard":"Painel do vendedor","Supplier dashboard":"Painel do fornecedor"} as Record<string,string>)[item.label] || item.label)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-ink-200 p-3">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
              {profileInitial}
              {countryFlag(countryCode) && <span title={countryCode} className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-white text-xs leading-none">{countryFlag(countryCode)}</span>}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{t("Account", "Conta")}</p>
              <p className="truncate text-xs text-ink-500">{t("Profile & settings", "Perfil e definições")}</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="mt-0.5 flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-ink-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <Icon name="logout" size={18} />
            </span>
            <span>{t("Log out", "Sair")}</span>
          </button>
        </div>
      </aside>

      <Dialog
        open={logoutOpen}
        onClose={() => { if (!loggingOut) setLogoutOpen(false); }}
        title={t("Log out?", "Sair?")}
        description={t("Are you sure you want to log out of your Newvelion account?", "Tem a certeza de que pretende sair da sua conta Newvelion?")}
        className="sm:max-w-sm"
        footer={
          <>
            <Button variant="secondary" disabled={loggingOut} onClick={() => setLogoutOpen(false)}>
              {t("Cancel", "Cancelar")}
            </Button>
            <Button loading={loggingOut} onClick={handleLogout}>
              {loggingOut ? t("Logging out...", "A sair...") : t("Log out", "Sair")}
            </Button>
          </>
        }
      />

      <Dialog
        open={referralPopupOpen}
        onClose={() => setReferralPopupOpen(false)}
        title="R50 for each seller or supplier you refer"
        description="Newvelion Partner Program"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReferralPopupOpen(false)}>Maybe later</Button>
            <Link
              href="/dashboard/affiliate"
              onClick={() => setReferralPopupOpen(false)}
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Become affiliate
            </Link>
          </>
        }
      >
        <p className="leading-6">You earn R50 when a business you referred confirms its first sale. At 5, 10 and 25 active referrals you also receive a prize. Affiliate rewards stay separate from your sales and supplier balances.</p>
      </Dialog>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-ink-200 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 text-ink-600 transition-colors duration-150 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" size={19} />
            </button>

            <div>
              {title && <h1 className="text-lg font-semibold text-ink-900">{title}</h1>}

              {subtitle && (
                <p className="hidden text-sm text-ink-500 sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label
              className="relative flex h-10 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 text-sm text-ink-700 transition-colors duration-150 hover:bg-ink-50 focus-within:ring-2 focus-within:ring-brand-600"
              title={t("Choose language", "Escolher idioma")}
            >
              <Icon name="globe" size={17} />
              <span className="sr-only">{t("Language", "Idioma")}</span>
              <select
                aria-label={t("Choose language", "Escolher idioma")}
                value={pt ? "pt" : "en"}
                onChange={(event) => {
                  const language = event.target.value === "pt" ? "pt" : "en";
                  localStorage.setItem("newvelion-language", language);
                  setPt(language === "pt");
                  document.documentElement.lang = language;
                  window.dispatchEvent(new Event("newvelion-language-change"));
                }}
                className="max-w-[92px] cursor-pointer appearance-none border-0 bg-transparent py-1 pr-1 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </label>
            <NotificationCenter />

            <Link
              href="/dashboard/profile"
              aria-label="Account profile"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 transition-colors duration-150 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              {profileInitial}
              {countryFlag(countryCode) && <span title={countryCode} className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-white text-xs leading-none">{countryFlag(countryCode)}</span>}
            </Link>
          </div>
        </header>

        <main id="main-content" className="nv-dashboard min-h-[calc(100vh-4.5rem)] bg-ink-50 p-4 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
