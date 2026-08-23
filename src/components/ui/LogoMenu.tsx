"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import VelionLogo from "./VelionLogo";

export default function LogoMenu({ onToggle }: { onToggle?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    onToggle?.(next);
  }

  return (
    <div className="flex items-center gap-3 px-4 h-16 border-b border-cardborder bg-white/90 backdrop-blur">
      <button
        onClick={handleToggle}
        aria-label="Abrir menu"
        className="p-2 rounded-lg hover:bg-bgmuted active:scale-95 transition-all duration-200"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      <VelionLogo size={28} />
    </div>
  );
}
