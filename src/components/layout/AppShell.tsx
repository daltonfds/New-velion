"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { AppFrame, SELLER_BOTTOM_NAV, type NavGroup } from "@/components/ui-kit/newvelion-ui";
import { LogOut } from "lucide-react";

export type AppArea = "seller" | "supplier" | "affiliate" | "admin";

interface NavItem {
  label: string;
  href: string;
  group?: string;
}

const navigation: Record<AppArea, NavItem[]> = {
  seller: [
    { label: "Dashboard", href: "/dashboard/seller", group: "Overview" },
    { label: "Marketplace", href: "/dashboard/seller/marketplace", group: "Sell" },
    { label: "My Products", href: "/dashboard/seller/products", group: "Sell" },
    { label: "Orders & Sales", href: "/dashboard/seller/sales", group: "Sell" },
    { label: "Links", href: "/dashboard/seller/links", group: "Sell" },
    { label: "Commissions", href: "/dashboard/seller/commissions", group: "Finance" },
    { label: "Wallet", href: "/dashboard/seller/wallet", group: "Finance" },
    { label: "Withdrawals", href: "/dashboard/seller/withdrawals", group: "Finance" },
    { label: "Analytics", href: "/dashboard/seller/performance", group: "Grow" },
    { label: "Top Scale", href: "/top-scale", group: "Grow" },
    { label: "Ranking", href: "/dashboard/seller/ranking", group: "Grow" },
    { label: "Integrations", href: "/dashboard/seller/integrations", group: "Grow" },
    { label: "Become affiliate", href: "/dashboard/affiliate", group: "Grow" },
  ],
  supplier: [
    { label: "Dashboard", href: "/dashboard/supplier", group: "Operations" },
    { label: "Products", href: "/dashboard/supplier/products", group: "Operations" },
    { label: "Orders & Fulfillment", href: "/dashboard/supplier/orders", group: "Operations" },
    { label: "Shipping", href: "/dashboard/supplier/shipping", group: "Operations" },
    { label: "Withdrawals", href: "/dashboard/supplier/withdrawals", group: "Finance" },
    { label: "Settings", href: "/dashboard/supplier/settings", group: "Account" },
    { label: "Profile", href: "/dashboard/supplier/profile", group: "Account" },
    { label: "Become affiliate", href: "/dashboard/affiliate", group: "Account" },
  ],
  affiliate: [
    { label: "Dashboard", href: "/dashboard/affiliate", group: "Overview" },
    { label: "Referral program", href: "/dashboard/affiliate", group: "Grow" },
    { label: "Withdrawals", href: "/dashboard/affiliate/withdrawals", group: "Finance" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", group: "Overview" },
    { label: "Analytics", href: "/dashboard/admin/analytics", group: "Overview" },
    { label: "Users", href: "/dashboard/admin/users", group: "People" },
    { label: "Sellers", href: "/dashboard/admin/sellers", group: "People" },
    { label: "Suppliers", href: "/dashboard/admin/suppliers", group: "People" },
    { label: "KYC", href: "/dashboard/admin/kyc", group: "People" },
    { label: "Products", href: "/dashboard/admin/products", group: "Catalog" },
    { label: "Product Review", href: "/dashboard/admin/products/review", group: "Catalog" },
    { label: "Customer Reviews", href: "/dashboard/admin/product-reviews", group: "Catalog" },
    { label: "Categories", href: "/dashboard/admin/categories", group: "Catalog" },
    { label: "Orders", href: "/dashboard/admin/checkout-sessions", group: "Orders & money" },
    { label: "Transactions", href: "/dashboard/admin/transactions", group: "Orders & money" },
    { label: "Commissions", href: "/dashboard/admin/commissions", group: "Orders & money" },
    { label: "Withdrawals", href: "/dashboard/admin/withdrawals", group: "Orders & money" },
    { label: "Disputes", href: "/dashboard/admin/disputes", group: "Orders & money" },
    { label: "Business Settings", href: "/dashboard/admin/platform-settings", group: "Business" },
    { label: "Club memberships", href: "/dashboard/admin/club-memberships", group: "Business" },
  ],
};

const ptLabels: Record<string, string> = {
  Dashboard: "Painel", Marketplace: "Mercado", "My Products": "Meus produtos",
  "Orders & Sales": "Pedidos e vendas", Commissions: "Comissões", Wallet: "Carteira",
  Analytics: "Análises", "Top Scale": "Top Scale", Ranking: "Classificação",
  Integrations: "Integrações", Links: "Links", Withdrawals: "Levantamentos",
  Products: "Produtos", "Orders & Fulfillment": "Pedidos e logística", Shipping: "Envio",
  Settings: "Definições", Profile: "Perfil", Users: "Utilizadores", Sellers: "Vendedores",
  Suppliers: "Fornecedores", "Business Settings": "Definições da plataforma",
  "Product Review": "Revisão de produtos", "Customer Reviews": "Avaliações de clientes",
  Categories: "Categorias", Orders: "Pedidos", Transactions: "Transações",
  Disputes: "Disputas", KYC: "KYC", "Become affiliate": "Tornar-se afiliado",
  "Club memberships": "Adesões ao clube", "Referral program": "Programa de referência",
  "Orders & money": "Pedidos e dinheiro", Overview: "Visão geral", Sell: "Vender",
  Finance: "Finanças", Grow: "Crescer", Operations: "Operação", Account: "Conta",
  People: "Pessoas", Catalog: "Catálogo", Business: "Negócio",
};

interface AppShellProps {
  area: AppArea;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppShell({ area, children, title, subtitle }: AppShellProps) {
  const [profileInitial, setProfileInitial] = useState("U");
  const [accountRole, setAccountRole] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [pt, setPt] = useState(false);
  const [referralPopupOpen, setReferralPopupOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const t = (value: string) => pt ? (ptLabels[value] || value) : value;

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

  useEffect(() => {
    let active = true;
    async function loadProfileInitial() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user || !active) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,nome_completo,role")
        .eq("id", user.id)
        .maybeSingle();
      const name = String(
        profile?.full_name || profile?.nome_completo ||
        user.user_metadata?.full_name || user.user_metadata?.name || user.email || ""
      ).trim();
      if (active && name) setProfileInitial(name.charAt(0).toUpperCase());
      if (active) setAccountRole(String(profile?.role || ""));
    }
    void loadProfileInitial();
    return () => { active = false; };
  }, []);

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
    ? [...navigation.affiliate, { label: "Seller dashboard", href: "/dashboard/seller", group: "Account" }]
    : area === "affiliate" && accountRole === "supplier"
      ? [...navigation.affiliate, { label: "Supplier dashboard", href: "/dashboard/supplier", group: "Account" }]
      : navigation[area];

  const grouped = items.reduce<{ key: string; items: NavItem[] }[]>((acc, item) => {
    const key = item.group ?? "Platform";
    const existing = acc.find((group) => group.key === key);
    if (existing) existing.items.push(item);
    else acc.push({ key, items: [item] });
    return acc;
  }, []);
  const nav: NavGroup[] = grouped.map((group) => ({
    label: t(group.key),
    items: group.items.map((item) => ({
      label: t(item.label),
      href: item.href,
      active: pathname === item.href || (item.href !== "/dashboard/seller" && item.href !== "/dashboard/supplier" && pathname.startsWith(item.href + "/")),
    })),
  }));
  nav.push({
    label: t("Account"),
    items: [{ label: t("Profile"), href: "/dashboard/profile", active: pathname === "/dashboard/profile" }],
  });

  const bottomNavLabels: Record<string, string> = {
    "Painel": "Dashboard",
    "Mercado": "Marketplace",
    "Vendas": "Sales",
    "Carteira": "Wallet",
    "Mais": "More",
  };
  const bottomNav = area === "seller" ? SELLER_BOTTOM_NAV.map((item) => ({
    ...item,
    label: pt ? item.label : (bottomNavLabels[item.label] || item.label),
    active: pathname === item.href || (item.href !== "/dashboard/seller" && pathname.startsWith(item.href + "/")),
  })) : undefined;

  return (
    <>
      <AppFrame
        nav={nav}
        title={title || t("Dashboard")}
        initial={profileInitial}
        bottomNav={bottomNav}
        actions={
          <div className="flex items-center gap-2">
            <label className="flex h-10 items-center gap-1.5 rounded-lg border border-ink-300 bg-white px-2.5 text-xs font-semibold text-ink-700">
              <span className="sr-only">{t("Choose language")}</span>
              <select
                aria-label={t("Choose language")}
                value={pt ? "pt" : "en"}
                onChange={(event) => {
                  const language = event.target.value === "pt" ? "pt" : "en";
                  localStorage.setItem("newvelion-language", language);
                  setPt(language === "pt");
                  document.documentElement.lang = language;
                  window.dispatchEvent(new Event("newvelion-language-change"));
                }}
                className="max-w-[105px] cursor-pointer bg-transparent py-1 outline-none"
              >
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </label>
            <NotificationCenter />
            <Link
              href="/dashboard/profile"
              aria-label={t("Profile")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white text-sm font-semibold text-brand-600 transition hover:bg-ink-50"
            >
              {profileInitial}
            </Link>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              aria-label={t("Log out")}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-600 transition hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={17} aria-hidden />
            </button>
          </div>
        }
      >
        <>
          {subtitle ? <p className="mb-5 text-sm text-ink-500">{subtitle}</p> : null}
          {children}
        </>
      </AppFrame>

      <Dialog
        open={logoutOpen}
        onClose={() => { if (!loggingOut) setLogoutOpen(false); }}
        title={t("Log out?")}
        description={t("Are you sure you want to log out of your Newvelion account?")}
        className="sm:max-w-sm"
        footer={
          <>
            <Button variant="secondary" disabled={loggingOut} onClick={() => setLogoutOpen(false)}>{t("Cancel")}</Button>
            <Button loading={loggingOut} onClick={handleLogout}>{loggingOut ? t("Logging out...") : t("Log out")}</Button>
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
    </>
  );
}
