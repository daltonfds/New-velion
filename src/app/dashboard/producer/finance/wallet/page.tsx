"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";
export default function ProducerWalletPage() {
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("profiles").select("balance").eq("id", session.user.id).single();
      if (data) setBalance(data.balance || 0);
    };
    load();
  }, []);
  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto"><h1 className="text-3xl font-bold mb-6">Wallet</h1><div className="bg-white p-6 rounded-xl border border-light-border"><p className="text-sm text-light-muted">Available Balance</p><p className="text-3xl font-bold text-primary">R {balance}</p></div></div>
    </div>
  );
}
