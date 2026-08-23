"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

export default function SellerWalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", session.user.id).single();
      if (profile) setBalance(profile.balance || 0);
      const { data } = await supabase.from("financial_ledger").select("*").eq("user_id", session.user.id);
      if (data) setTransactions(data);
    };
    load();
  }, [router]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-light-border shadow-sm">
          <p className="text-xs text-light-muted font-medium">Available Balance</p>
          <p className="text-xl font-bold text-primary mt-1">R {balance}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl border border-light-border">
        <h3 className="font-semibold mb-4">Transaction History</h3>
        {transactions.length === 0 ? <p className="text-sm text-light-muted">No transactions yet.</p> : transactions.map((t: any) => (
          <div key={t.id} className="flex justify-between py-2 border-b border-light-border">
            <p className="text-sm">{t.description}</p>
            <p className="text-sm font-bold">R {t.amount}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
