"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";
import {
  menuConfig,
  type DashboardRole,
} from "@/components/navigation/menuConfig";

interface DashboardNavigationProps {
  role: DashboardRole;
}

export default function DashboardNavigation({
  role,
}: DashboardNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const groups = menuConfig[role];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-light-border bg-white">
        <div className="flex h-full items-center px-4">
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-light-text transition-colors hover:bg-secondary"
          >
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <div className="ml-2 flex items-center gap-2">
            <VelionLogo className="h-8 w-8" />
            <span className="font-display text-base font-semibold text-light-text">
              Velion
            </span>
          </div>
        </div>
      </header>

      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-72 overflow-y-auto border-r border-light-border bg-white transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4">
          {groups.map((group, groupIndex) => (
            <div
              key={`${group.label ?? "main"}-${groupIndex}`}
              className={groupIndex > 0 ? "mt-6" : ""}
            >
              {group.label && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-light-muted">
                  {group.label}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== `/dashboard/${role}` &&
                      pathname.startsWith(`${item.href}/`));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-light-muted hover:bg-secondary hover:text-light-text"
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.8} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-8 border-t border-light-border pt-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-red-50"
            >
              <LogOut size={18} strokeWidth={1.8} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
