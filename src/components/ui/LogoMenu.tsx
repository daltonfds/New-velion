"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import VelionLogo from "./VelionLogo";

export default function LogoMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-light-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu Hambúrguer + Logo */}
        <div className="flex items-center gap-3">
          <button onClick={() => setIsOpen(!isOpen)} className="text-light-text">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <VelionLogo className="w-7 h-7" />
        </div>
      </div>

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white p-4 pt-16">
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a href="#sellers" className="text-light-text hover:text-primary" onClick={() => setIsOpen(false)}>Sellers</a>
              <a href="#producers" className="text-light-text hover:text-primary" onClick={() => setIsOpen(false)}>Producers</a>
              <a href="#logistics" className="text-light-text hover:text-primary" onClick={() => setIsOpen(false)}>Logistics</a>
              <a href="#about" className="text-light-text hover:text-primary" onClick={() => setIsOpen(false)}>About</a>
              <a href="/login" className="text-light-text hover:text-primary" onClick={() => setIsOpen(false)}>Login</a>
              <a href="/apply" className="bg-primary text-white rounded-full py-2 px-4 text-center" onClick={() => setIsOpen(false)}>Start Selling</a>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
