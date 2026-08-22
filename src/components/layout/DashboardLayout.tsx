"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";
import { LayoutDashboard, Package, ShoppingCart, Wallet, User, Settings, LogOut, Search } from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard/seller", icon: LayoutDashboard },
  { name: "Products", path: "/dashboard/seller/products", icon: Package },
  { name: "Orders", path: "/dashboard/seller/orders", icon: ShoppingCart },
  { name: "Wallet", path: "/dashboard/seller/wallet", icon: Wallet },
  { name: "Profile", path: "/dashboard/seller/profile", icon: User },
  { name: "Settings", path: "/dashboard/seller/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-light-border hidden md:flex flex-col p-4">
        <div className="flex items-center gap-3 mb-8">
          <VelionLogo className="w-8 h-8" />
          <span className="font-display text-lg font-semibold">Velion</span>
        </div>
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.path ? "bg-primary/10 text-primary" : "text-light-muted hover:bg-light-bg hover:text-light-text"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>
        <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-lg mt-auto">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Content */}
      <main className="md:ml-64 p-6 pb-28 md:pb-6">{children}</main>

      {/* Mobile Bottom Menu (Floating Premium) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-xl border border-light-border rounded-2xl shadow-2xl p-2 flex items-center justify-between">
          {menuItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${
                pathname === item.path ? "bg-primary/10 text-primary" : "text-light-muted"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
