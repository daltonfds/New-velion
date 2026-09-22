"use client";

import Link from "next/link";
import NewvelionLogo from "@/components/ui/NewvelionLogo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  Wallet,
  BarChart3,
  Users,
  Truck,
  Settings,
  ChevronDown,
} from "lucide-react";

const mainMenu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "My Products", href: "/products", icon: Package },
  { label: "Orders & Sales", href: "/orders", icon: ShoppingBag },
  { label: "Commissions", href: "/commissions", icon: Wallet },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const platformMenu = [
  { label: "Dashboard", href: "/platform", icon: LayoutDashboard },
  { label: "Marketplace", href: "/platform/marketplace", icon: Store },
  { label: "Products", href: "/platform/products", icon: Package },
  { label: "Store", href: "/platform/store", icon: ShoppingBag },
  { label: "Orders", href: "/platform/orders", icon: ShoppingBag },
  { label: "Customers", href: "/platform/customers", icon: Users },
  { label: "Suppliers", href: "/platform/suppliers", icon: Truck },
  { label: "Wallet", href: "/platform/wallet", icon: Wallet },
  { label: "Transactions", href: "/platform/transactions", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-20 items-center border-b border-slate-100 px-6">
        <Link href="/" aria-label="Newvelion">
          <NewvelionLogo />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <nav className="space-y-1">
          {mainMenu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="my-7 border-t border-slate-100" />

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Platform
        </p>

        <nav className="space-y-1">
          {platformMenu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-100 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            U
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              Account
            </p>
            <p className="truncate text-xs text-slate-400">
              Seller account
            </p>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>
    </aside>
  );
}
