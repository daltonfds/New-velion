"use client";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Wallet, User, Settings, LogOut,
  Factory, Warehouse, Truck, Users, BarChart3, ClipboardCheck,
} from "lucide-react";
import LogoMenu from "../ui/LogoMenu";

type UserType = "seller" | "producer" | "admin";

const NAV_BY_ROLE: Record<UserType, { icon: any; label: string; href: string }[]> = {
  seller: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/seller" },
    { icon: Package, label: "Marketplace", href: "/dashboard/seller/marketplace" },
    { icon: ShoppingCart, label: "Orders", href: "/dashboard/seller/orders" },
    { icon: Wallet, label: "Wallet", href: "/dashboard/seller/finance/wallet" },
    { icon: User, label: "Profile", href: "/dashboard/seller/profile" },
    { icon: Settings, label: "Settings", href: "/dashboard/seller/settings" },
  ],
  producer: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/producer" },
    { icon: Factory, label: "Products", href: "/dashboard/producer/products" },
    { icon: Warehouse, label: "Inventory", href: "/dashboard/producer/inventory" },
    { icon: Truck, label: "Fulfillment", href: "/dashboard/producer/fulfillment" },
    { icon: Wallet, label: "Finance", href: "/dashboard/producer/finance" },
    { icon: User, label: "Profile", href: "/dashboard/producer/profile" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
    { icon: ClipboardCheck, label: "Marketplace", href: "/dashboard/admin/marketplace" },
    { icon: Truck, label: "Operations", href: "/dashboard/admin/operations" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/admin/analytics" },
    { icon: Wallet, label: "Finance", href: "/dashboard/admin/finance" },
    { icon: Users, label: "Users", href: "/dashboard/admin/users" },
  ],
};

export default function DashboardLayout({
  children,
  userType = "seller",
}: {
  children: React.ReactNode;
  userType?: UserType;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = NAV_BY_ROLE[userType] ?? NAV_BY_ROLE.seller;

  return (
    <div className="min-h-screen flex">
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-all duration-200
        ${sidebarOpen ? "w-64" : "w-0 md:w-64"} overflow-hidden`}
      >
        <nav className="flex flex-col gap-1 p-3 mt-20">
          {navItems.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-body hover:bg-bgmuted transition-all duration-200"
            >
              <Icon size={18} />
              {label}
            </a>
          ))}
          <button className="flex items-center gap-3 px-3 py-2 mt-4 rounded-lg text-danger hover:bg-red-50">
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
      </aside>

      <div className="flex-1 md:ml-64">
        <div className="fixed top-0 left-0 right-0 z-50 md:left-64">
          <LogoMenu onToggle={setSidebarOpen} />
        </div>
        <main className="pt-16 p-4">{children}</main>
      </div>
    </div>
  );
}
