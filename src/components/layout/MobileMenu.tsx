"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import VelionLogo from "@/components/ui/VelionLogo";

const menuItems = [
  { name: "Dashboard", path: "/dashboard/seller" },
  { name: "Orders", path: "/dashboard/seller/orders" },
  { name: "Products", path: "/dashboard/seller/products" },
  { name: "Wallet", path: "/dashboard/seller/wallet" },
  { name: "Profile", path: "/dashboard/seller/profile" },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted hover:text-dark">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-border shadow-lg p-4 flex flex-col gap-2 z-40">
          <div className="flex items-center gap-3 mb-4 px-2">
            <VelionLogo className="w-8 h-8" showText={false} />
            <span className="font-display font-semibold text-dark">Velion</span>
          </div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                pathname === item.path ? "bg-primary/10 text-primary" : "text-muted hover:bg-secondary hover:text-dark"
              }`}
            >
              {item.name}
            </Link>
          ))}
          <Link href="/login" className="mt-4 px-4 py-3 text-sm text-error font-medium border-t border-border pt-4">Sign Out</Link>
        </div>
      )}
    </div>
  );
}
