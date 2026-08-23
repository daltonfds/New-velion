"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";
import { Menu, X, LayoutDashboard, Package, ShoppingCart, Wallet, User, Settings, LogOut, Users, Boxes } from "lucide-react";

export default function DashboardLayout({ children, userType = "seller" }: { children: ReactNode; userType?: "seller" | "producer" | "admin" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Menu de itens baseado no tipo de usuário
  const menuItems = userType === "admin" ? [
    { name: "Dashboard", path: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Marketplace", path: "/dashboard/admin/marketplace", icon: Boxes },
    { name: "Operations", path: "/dashboard/admin/operations", icon: ShoppingCart },
    { name: "Finance", path: "/dashboard/admin/finance", icon: Wallet },
    { name: "Users", path: "/dashboard/admin/users", icon: Users },
    { name: "Profile", path: "/dashboard/admin/profile", icon: User },
  ] : userType === "producer" ? [
    { name: "Dashboard", path: "/dashboard/producer", icon: LayoutDashboard },
    { name: "Products", path: "/dashboard/producer/products", icon: Package },
    { name: "Inventory", path: "/dashboard/producer/inventory", icon: Boxes },
    { name: "Finance", path: "/dashboard/producer/finance", icon: Wallet },
    { name: "Profile", path: "/dashboard/producer/profile", icon: User },
  ] : [
    { name: "Dashboard", path: "/dashboard/seller", icon: LayoutDashboard },
    { name: "Marketplace", path: "/dashboard/seller/marketplace", icon: Boxes },
    { name: "Products", path: "/dashboard/seller/products", icon: Package },
    { name: "Orders", path: "/dashboard/seller/orders", icon: ShoppingCart },
    { name: "Wallet", path: "/dashboard/seller/wallet", icon: Wallet },
    { name: "Profile", path: "/dashboard/seller/profile", icon: User },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Header (com hambúrguer + logo) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-light-border flex items-center gap-3 px-4 py-3">
        <button onClick={() => setIsOpen(!isOpen)} className="text-light-text">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <VelionLogo className="w-7 h-7" />
      </div>

      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-light-border hidden md:flex flex-col p-4 pt-16">
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.path ? "bg-primary/10 text-primary" : "text-light-muted hover:bg-light-bg hover:text-light-text"
              }`}
            >
              <item.icon size={16} />
              {item.name}
            </Link>
          ))}
        </nav>
        <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg mt-auto">
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Sidebar Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white p-4 pt-16 flex flex-col">
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.path ? "bg-primary/10 text-primary" : "text-light-muted hover:bg-light-bg hover:text-light-text"
                  }`}
                >
                  <item.icon size={16} />
                  {item.name}
                </Link>
              ))}
            </nav>
            <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg mt-auto">
              <LogOut size={16} /> Sign Out
            </button>
          </aside>
        </div>
      )}

      {/* Conteúdo */}
      <main className="md:ml-64 pt-14 p-4">{children}</main>
    </div>
  );
}
