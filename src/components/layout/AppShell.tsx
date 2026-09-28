"use client";

import { useState } from "react";
import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";

export type AppArea = "seller" | "admin";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navigation: Record<AppArea, NavItem[]> = {
  seller: [
    { label: "Dashboard", href: "/dashboard/seller", icon: "⌂" },
    { label: "Marketplace", href: "/marketplace", icon: "▦" },
    { label: "My Products", href: "/dashboard/seller/products", icon: "□" },
    { label: "Orders & Sales", href: "/dashboard/seller/sales", icon: "↗" },
    { label: "Commissions", href: "/dashboard/seller/commissions", icon: "$" },
    { label: "Wallet", href: "/dashboard/seller/wallet", icon: "◉" },
    { label: "Analytics", href: "/dashboard/seller/performance", icon: "▥" },
    { label: "Links", href: "/dashboard/seller/links", icon: "↗" },
    { label: "Withdrawals", href: "/dashboard/seller/withdrawals", icon: "↓" },
  ],

  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: "⌂" },
    { label: "Users", href: "/dashboard/admin/users", icon: "♙" },
    { label: "Sellers", href: "/dashboard/admin/sellers", icon: "♙" },
    { label: "Products", href: "/dashboard/admin/products", icon: "□" },
    { label: "Categories", href: "/dashboard/admin/categories", icon: "▦" },
    { label: "Transactions", href: "/dashboard/admin/transactions", icon: "↔" },
    { label: "Commissions", href: "/dashboard/admin/commissions", icon: "$" },
    { label: "Withdrawals", href: "/dashboard/admin/withdrawals", icon: "↓" },
    { label: "Disputes", href: "/dashboard/admin/disputes", icon: "!" },
    { label: "KYC", href: "/dashboard/admin/kyc", icon: "✓" },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: "▥" },
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

  const items = navigation[area];

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="flex h-20 items-center border-b border-gray-100 px-6">
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
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-500 transition group-hover:bg-white group-hover:text-indigo-600">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-gray-100 p-3">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
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
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              ☰
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
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              ♧
            </button>

            <Link
              href="/dashboard/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700"
            >
              U
            </Link>
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)] p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
