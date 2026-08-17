"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import VelionLogo from "@/components/ui/VelionLogo";

const menuItems = [
  { name: "Dashboard", path: "/dashboard/seller" },
  { name: "Orders", path: "/dashboard/seller/orders" },
  { name: "Products", path: "/dashboard/seller/products" },
  { name: "Integrations", path: "/dashboard/seller/integrations" },
  { name: "Wallet", path: "/dashboard/seller/wallet" },
  { name: "Settings", path: "/dashboard/seller/settings" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-secondary">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border hidden md:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <VelionLogo className="w-10 h-10" showText={false} />
          <span className="font-display text-lg font-semibold text-dark">Velion</span>
        </div>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-secondary hover:text-dark"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-border">
          <Link href="/login" className="text-sm text-muted hover:text-error block px-4 py-2">Sign Out</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
