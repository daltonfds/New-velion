"use client";

import { Menu, Search } from "lucide-react";
import NewvelionLogo from "@/components/ui/NewvelionLogo";
import NotificationsBell from "@/components/platform/NotificationsBell";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <button
          className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <NewvelionLogo />
      </div>

      <div className="relative hidden w-full max-w-md sm:block">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          placeholder="Search products, orders, suppliers..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-3">
        <NotificationsBell />

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          U
        </div>
      </div>
    </header>
  );
}
