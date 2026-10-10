"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/layout/AppShell";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export default function ProfilePage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      setIsAdmin(!error && String(data?.role || "").toLowerCase() === "admin");
    }
    void loadRole();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <p className="text-sm font-medium text-slate-600">Loading account settings…</p>
      </div>
    );
  }

  return (
    <AppShell
      area={isAdmin ? "admin" : "seller"}
      title="Profile & Settings"
      subtitle={isAdmin ? "Manage your administrator profile, access and platform settings." : "Manage your account, profile and payout preferences."}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#16294F]">
            Account
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal information and account preferences.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/dashboard/profile/personal"
            className="group rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#eef4fb] text-[#16294F]">
                <Icon>
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </Icon>
              </div>
              <span className="text-slate-400 group-hover:text-blue-600">→</span>
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900">
              Personal profile
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Update your name, contact information and personal details.
            </p>
          </Link>

          <Link
            href={isAdmin ? "/dashboard/admin/platform-settings" : "/dashboard/seller/settings"}
            className="group rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#eef4fb] text-[#16294F]">
                <Icon>
                  <path d="M12 3v3" />
                  <path d="M12 18v3" />
                  <path d="M3 12h3" />
                  <path d="M18 12h3" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="m5.6 5.6 2.1 2.1" />
                  <path d="m16.3 16.3 2.1 2.1" />
                  <path d="m18.4 5.6-2.1 2.1" />
                  <path d="m7.7 16.3-2.1 2.1" />
                </Icon>
              </div>
              <span className="text-slate-400 group-hover:text-blue-600">→</span>
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900">
              {isAdmin ? "Administrator settings" : "Settings"}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {isAdmin ? "Manage platform configuration and administrator preferences." : "Manage account preferences, payout methods and security settings."}
            </p>
          </Link>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="font-semibold text-slate-900">Account information</h3>
            <p className="mt-1 text-sm text-slate-500">
              Your Newvelion account preferences are managed from this area.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <Link
              href="/dashboard/profile/personal"
              className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Personal information
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Name, phone, country and contact details
                </p>
              </div>
              <span className="text-slate-400">→</span>
            </Link>

            <Link
              href={isAdmin ? "/dashboard/admin/platform-settings" : "/dashboard/seller/settings"}
              className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {isAdmin ? "Business settings" : "Payout settings"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {isAdmin ? "Configure platform fees and marketplace rules" : "Configure your available withdrawal methods"}
                </p>
              </div>
              <span className="text-slate-400">→</span>
            </Link>

            <Link
              href={isAdmin ? "/dashboard/admin/users" : "/dashboard/seller/settings"}
              className="flex items-center justify-between px-6 py-5 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {isAdmin ? "User management" : "Account preferences"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {isAdmin ? "Review user accounts, roles and verification status" : "Notifications and other account preferences"}
                </p>
              </div>
              <span className="text-slate-400">→</span>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
