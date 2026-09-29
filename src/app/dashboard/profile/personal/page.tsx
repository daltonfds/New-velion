"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";

export default function PersonalProfilePage() {
  const [saved, setSaved] = useState(false);

  return (
    <AppShell area="seller" title="Personal Profile" subtitle="Manage your personal information.">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link href="/dashboard/profile" className="text-sm text-slate-500 hover:text-[#16294F]">
            ← Account
          </Link>
          <h2 className="mt-3 text-2xl font-bold text-[#16294F]">Personal information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep your NewVelion account information up to date.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
          className="rounded-xl border border-slate-200 bg-white"
        >
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="font-semibold text-slate-900">Profile details</h3>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              First name
              <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#16294F]" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Last name
              <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#16294F]" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Email
              <input type="email" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#16294F]" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Phone
              <input type="tel" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#16294F]" />
            </label>

            <label className="text-sm font-medium text-slate-700 md:col-span-2">
              Country
              <select className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-[#16294F]">
                <option value="">Select country</option>
                <option value="MZ">Mozambique</option>
                <option value="ZA">South Africa</option>
                <option value="FR">France</option>
                <option value="AO">Angola</option>
                <option value="PT">Portugal</option>
              </select>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <span className="text-sm text-emerald-600">{saved ? "Changes saved." : ""}</span>
            <button className="rounded-lg bg-[#16294F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#203862]">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
