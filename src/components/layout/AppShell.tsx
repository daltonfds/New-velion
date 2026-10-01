"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { supabase } from "@/lib/supabase";

export type AppArea = "seller" | "admin";

type IconName =
  | "home"
  | "grid"
  | "box"
  | "sales"
  | "wallet"
  | "chart"
  | "link"
  | "download"
  | "users"
  | "bell"
  | "menu"
  | "logout";

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const icons: Record<IconName, React.ReactNode> = {
    home: <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v12h14V9" />
      <path d="M9 21v-7h6v7" />
    </>,
    grid: <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </>,
    box: <>
      <path d="m4 7 8-4 8 4-8 4-8-4Z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </>,
    sales: <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 4-5 3 2 5-7" />
    </>,
    wallet: <>
      <path d="M4 7a3 3 0 0 1 3-3h13v16H7a3 3 0 0 1-3-3V7Z" />
      <path d="M4 8h16" />
      <path d="M16 13h4" />
      <circle cx="16" cy="13" r=".7" fill="currentColor" />
    </>,
    chart: <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <rect x="7" y="11" width="2.5" height="5" rx=".5" />
      <rect x="11" y="8" width="2.5" height="8" rx=".5" />
      <rect x="15" y="5" width="2.5" height="11" rx=".5" />
    </>,
    link: <>
      <path d="M10 13.5 8.5 15a3.5 3.5 0 0 1-5-5l2-2a3.5 3.5 0 0 1 5 0" />
      <path d="M14 10.5 15.5 9a3.5 3.5 0 0 1 5 5l-2 2a3.5 3.5 0 0 1-5 0" />
      <path d="m8 12 8-4" />
    </>,
    download: <>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </>,
    users: <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M17 11a3 3 0 0 0 0-6" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
    </>,
    bell: <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>,
    menu: <>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </>,
    logout: <>
      <path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </>,
  };

  return <svg {...props}>{icons[name]}</svg>;
}

const navigation: Record<AppArea, NavItem[]> = {
  seller: [
    { label: "Dashboard", href: "/dashboard/seller", icon: "home" },
    { label: "Marketplace", href: "/marketplace", icon: "grid" },
    { label: "My Products", href: "/dashboard/seller/products", icon: "box" },
    { label: "Orders & Sales", href: "/dashboard/seller/sales", icon: "sales" },
    { label: "Commissions", href: "/dashboard/seller/commissions", icon: "wallet" },
    { label: "Wallet", href: "/dashboard/seller/wallet", icon: "wallet" },
    { label: "Analytics", href: "/dashboard/seller/performance", icon: "chart" },
    { label: "Links", href: "/dashboard/seller/links", icon: "sales" },
    { label: "Withdrawals", href: "/dashboard/seller/withdrawals", icon: "download" },
  ],

  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: "home" },
    { label: "Users", href: "/dashboard/admin/users", icon: "users" },
    { label: "Sellers", href: "/dashboard/admin/sellers", icon: "users" },
    { label: "Products", href: "/dashboard/admin/products", icon: "box" },
    { label: "Categories", href: "/dashboard/admin/categories", icon: "grid" },
    { label: "Orders", href: "/dashboard/admin/checkout-sessions", icon: "box" },
    { label: "Transactions", href: "/dashboard/admin/transactions", icon: "sales" },
    { label: "Commissions", href: "/dashboard/admin/commissions", icon: "wallet" },
    { label: "Withdrawals", href: "/dashboard/admin/withdrawals", icon: "download" },
    { label: "Disputes", href: "/dashboard/admin/disputes", icon: "download" },
    { label: "KYC", href: "/dashboard/admin/kyc", icon: "users" },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: "chart" },
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
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
  }

  const items = navigation[area];

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      {mobileOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col",
          "border-r border-gray-200 bg-white",
          "transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-[76px] items-center border-b border-slate-100 px-6">
          <NewvelionBrand size="md" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Platform
          </p>

          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-[#eef4fb] text-[#16294F]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#16294F]",
                ].join(" ")}
              >
                {pathname === item.href && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#C99A2E]" />
                )}

                <span
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                    pathname === item.href
                      ? "text-[#16294F]"
                      : "text-slate-500 group-hover:text-[#16294F]",
                  ].join(" ")}
                >
                  <Icon name={item.icon} />
                </span>

                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-gray-100 p-3">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4fb] text-sm font-bold text-[#16294F]">
              U
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                Account
              </p>
              <p className="truncate text-xs text-gray-500">
                Profile & settings
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center">
              <Icon name="logout" size={18} />
            </span>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {logoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Icon name="logout" size={20} />
            </div>

            <h2
              id="logout-title"
              className="mt-4 text-lg font-bold text-slate-900"
            >
              Log out?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to log out of your NewVelion account?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setLogoutOpen(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="flex-1 rounded-lg bg-[#16294F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f1e3a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" size={19} />
            </button>

            <div>
              {title && (
                <h1 className="text-lg font-bold text-gray-900">{title}</h1>
              )}

              {subtitle && (
                <p className="hidden text-sm text-gray-500 sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
<NotificationCenter />

            <Link
              href="/dashboard/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4fb] text-sm font-bold text-[#16294F]"
            >
              U
            </Link>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4.75rem)] p-4 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
