"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { getWalletSummary, type WalletSummary } from "@/lib/services/wallet";
import {
  getSellerSalesSummary,
  type SellerSalesSummary,
} from "@/lib/services/sales";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function SellerDashboardPage() {
  const router = useRouter();

  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [sales, setSales] = useState<SellerSalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        const profileResult = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileResult.error) {
          throw profileResult.error;
        }

        if (profileResult.data?.role === "admin") {
          router.replace("/dashboard/admin");
          return;
        }

        const [walletData, salesData] = await Promise.all([
          getWalletSummary(user.id),
          getSellerSalesSummary(user.id),
        ]);

        setWallet(walletData);
        setSales(salesData);
      } catch (err) {
        console.error("Failed to load seller dashboard:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  return (
    <AppShell area="seller">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your Newvelion affiliate performance.
          </p>
        </div>

        {error && (
          <Card>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {loading ? "Loading..." : money(wallet?.disponivel ?? 0)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Ready for withdrawal
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">Pending Balance</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {loading ? "Loading..." : money(wallet?.retido ?? 0)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Guarantee currently retained
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {loading ? "Loading..." : sales?.totalSales ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Paid sales
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-500">Total Commission</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {loading
                ? "Loading..."
                : money(sales?.totalCommission ?? 0)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Commission from paid sales
            </p>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="text-base font-semibold text-gray-900">
              Wallet
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Available</span>
                <span className="font-medium text-gray-900">
                  {loading ? "Loading..." : money(wallet?.disponivel ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Retained</span>
                <span className="font-medium text-gray-900">
                  {loading ? "Loading..." : money(wallet?.retido ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Reserved</span>
                <span className="font-medium text-gray-900">
                  {loading ? "Loading..." : money(wallet?.reservado ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Total Balance
                </span>
                <span className="font-semibold text-gray-900">
                  {loading ? "Loading..." : money(wallet?.saldo_total ?? 0)}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-gray-900">
              Sales Performance
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Paid sales</span>
                <span className="font-medium text-gray-900">
                  {loading ? "Loading..." : sales?.totalSales ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Commission earned
                </span>
                <span className="font-semibold text-gray-900">
                  {loading
                    ? "Loading..."
                    : money(sales?.totalCommission ?? 0)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
