"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { formatMultiCurrency } from "@/lib/currency";
import { supabase } from "@/lib/supabase/client";

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [countryCode, setCountryCode] = useState("ZA");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [formatted, setFormatted] = useState({
    balance: { zar: "R 0.00", usd: "USD 0.00", local: "0.00" },
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar país do utilizador
      const { data: profile } = await supabase
        .from("profiles")
        .select("country, balance")
        .eq("id", user.id)
        .single();
      if (profile) {
        setCountryCode(profile.country || "ZA");
        setBalance(profile.balance || 0);
      }

      // Buscar transações do ledger
      const res = await fetch("/api/orders");
      const orders = await res.json();
      setTransactions(orders.slice(0, 5));

      // Formatar as 3 moedas
      const [bal] = await Promise.all([
        formatMultiCurrency(profile?.balance || 0, profile?.country || "ZA"),
      ]);
      setFormatted({ balance: bal });
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Wallet</h1>
        <p className="text-muted text-sm">Manage your earnings and withdrawals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-muted font-medium">Available Balance</p>
          <p className="text-3xl font-bold text-primary mt-2">{loading ? "..." : formatted.balance.zar}</p>
          <p className="text-sm text-muted">{loading ? "" : formatted.balance.usd}</p>
          <p className="text-sm text-muted">{loading ? "" : formatted.balance.local}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-muted font-medium">Pending Settlements</p>
          <p className="text-3xl font-bold text-warning mt-2">R 0.00</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark">Transaction History</h3>
          <Button variant="outline" className="text-xs px-4 py-2">Withdraw Funds</Button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-muted text-sm">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-muted text-sm py-8">No transactions yet.</div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                <div>
                  <p className="text-sm text-dark">{tx.customer_name}</p>
                  <p className="text-xs text-muted">#{tx.id.slice(0, 8)}</p>
                </div>
                <p className="text-sm font-bold text-primary">R {tx.total_price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
