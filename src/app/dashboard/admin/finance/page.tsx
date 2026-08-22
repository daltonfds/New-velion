"use client";
import Link from "next/link";
import VelionLogo from "@/components/ui/VelionLogo";
export default function AdminFinancePage() {
  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto"><h1 className="text-3xl font-bold mb-6">Finance</h1>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Link href="/dashboard/admin/finance/payments" className="bg-white p-4 rounded-xl border border-light-border text-center">Payments</Link>
          <Link href="/dashboard/admin/finance/settlements" className="bg-white p-4 rounded-xl border border-light-border text-center">Settlements</Link>
          <Link href="/dashboard/admin/finance/withdrawals" className="bg-white p-4 rounded-xl border border-light-border text-center">Withdrawals</Link>
        </div>
      </div>
    </div>
  );
}
