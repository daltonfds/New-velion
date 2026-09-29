"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";

export default function SellerSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <AppShell area="seller" title="Settings" subtitle="Manage your account and payout preferences.">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link href="/dashboard/profile" className="text-sm text-slate-500 hover:text-[#16294F]">
            ← Account
          </Link>
          <h2 className="mt-3 text-2xl font-bold text-[#16294F]">Settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure how your NewVelion account operates.
          </p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="font-semibold text-slate-900">Payout methods</h3>
            <p className="mt-1 text-sm text-slate-500">
              Configure your withdrawal methods here. Withdrawal requests will only select a configured method.
            </p>
          </div>

          <div className="space-y-4 p-6">
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
              <input type="checkbox" className="h-4 w-4" />
              <div>
                <p className="font-medium text-slate-900">Bank Transfer</p>
                <p className="text-sm text-slate-500">Receive withdrawals through your bank account.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
              <input type="checkbox" className="h-4 w-4" />
              <div>
                <p className="font-medium text-slate-900">M-Pesa</p>
                <p className="text-sm text-slate-500">Available for supported Mozambique accounts.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
              <input type="checkbox" className="h-4 w-4" />
              <div>
                <p className="font-medium text-slate-900">e-Mola</p>
                <p className="text-sm text-slate-500">Available for supported Mozambique accounts.</p>
              </div>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="font-semibold text-slate-900">Account preferences</h3>
          </div>

          <div className="space-y-5 p-6">
            <label className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Email notifications</p>
                <p className="text-xs text-slate-500">Receive important account and payout notifications.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </label>

            <label className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Sales notifications</p>
                <p className="text-xs text-slate-500">Receive notifications when affiliate sales are recorded.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </label>
          </div>
        </section>

        <div className="flex items-center justify-end gap-4">
          {saved && <span className="text-sm text-emerald-600">Changes saved.</span>}
          <button
            onClick={() => setSaved(true)}
            className="rounded-lg bg-[#16294F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#203862]"
          >
            Save settings
          </button>
        </div>
      </div>
    </AppShell>
  );
}
