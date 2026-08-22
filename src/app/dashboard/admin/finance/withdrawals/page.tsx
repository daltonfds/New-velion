"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";
export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("withdrawals").select("*").eq("status", "pending");
      if (data) setWithdrawals(data);
    };
    load();
  }, []);
  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto"><h1 className="text-3xl font-bold mb-6">Withdrawals</h1><div className="bg-white p-6 rounded-xl border border-light-border">{withdrawals.length === 0 ? <p className="text-light-muted">No pending withdrawals.</p> : withdrawals.map((w: any) => <div key={w.id} className="flex justify-between py-2 border-b border-light-border"><p>R {w.amount}</p><p className="text-xs text-light-muted">{w.status}</p></div>)}</div></div>
    </div>
  );
}
