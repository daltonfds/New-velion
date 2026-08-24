"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const pathname = usePathname();
  const groups = menuConfig[role];

  const toggleGroup = (label: string) => {
    setOpenGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 h-14 border-b border-light-border bg-white">
        <div className="flex h-full items-center px-3">
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-light-text transition-all duration-200 hover:bg-secondary active:scale-95"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="ml-2 flex items-center gap-2">
            <VelionLogo className="h-7 w-7" />
            <span className="font-display text-sm font-semibold text-light-text">
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
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        />
      )}

      <aside
        className={`fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-72 overflow-y-auto border-r border-light-border bg-white shadow-lg transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-3">
          {groups.map((group, groupIndex) => {
            const groupLabel = group.label;

            const hasActiveItem = group.items.some(
              (item) =>
                pathname === item.href ||
                (item.href !== `/dashboard/${role}` &&
                  pathname.startsWith(`${item.href}/`))
            );

            const isGroupOpen =
              groupLabel !== undefined
                ? openGroups[groupLabel] ?? hasActiveItem
                : true;

            return (
              <div
                key={`${groupLabel ?? "main"}-${groupIndex}`}
                className={groupIndex > 0 ? "mt-4" : ""}
              >
                {groupLabel ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupLabel)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-light-muted transition-colors hover:bg-secondary"
                  >
                    <span>{groupLabel}</span>

                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-200 ${
                        isGroupOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : null}

                <div
                  className={`grid transition-all duration-200 ${
                    isGroupOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="mt-1 space-y-1">
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
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-light-muted hover:bg-secondary hover:text-light-text active:scale-[0.98]"
                            }`}
                          >
                            <Icon size={17} strokeWidth={1.8} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="mt-6 border-t border-light-border pt-3">
            <button
              type="button"
              onClick={() => setShowSignOutConfirm(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-error transition-all duration-200 hover:bg-red-50 active:scale-[0.98]"
            >
              <LogOut size={17} strokeWidth={1.8} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>

      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h2 className="text-h2 font-semibold text-light-text">
              Sign out?
            </h2>

            <p className="mt-2 text-body text-light-muted">
              Are you sure you want to sign out of Velion?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                className="rounded-lg border border-light-border px-4 py-2 text-sm font-medium text-light-text transition-all duration-200 hover:bg-secondary active:scale-95"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
