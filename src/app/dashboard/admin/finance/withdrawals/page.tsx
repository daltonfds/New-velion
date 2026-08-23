"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("withdrawals").select("*").eq("status", "pending");
      if (data) setWithdrawals(data);
    };
    load();
  }, []);

  const approveWithdrawal = async (id: string) => {
    await supabase.from("withdrawals").update({ status: "approved" }).eq("id", id);
    setWithdrawals(withdrawals.filter((w) => w.id !== id));
    alert("Withdrawal approved!");
  };

  const rejectWithdrawal = async (id: string) => {
    await supabase.from("withdrawals").update({ status: "rejected" }).eq("id", id);
    setWithdrawals(withdrawals.filter((w) => w.id !== id));
    alert("Withdrawal rejected!");
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Withdrawals</h1>
      <div className="bg-white p-6 rounded-xl border border-light-border">
        {withdrawals.length === 0 ? <p className="text-sm text-light-muted">No pending withdrawals.</p> : withdrawals.map((w: any) => (
          <div key={w.id} className="flex justify-between py-4 border-b border-light-border">
            <div>
              <p className="font-medium">R {w.amount}</p>
              <p className="text-xs text-light-muted">{w.method}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approveWithdrawal(w.id)} className="px-4 py-2 bg-success text-white rounded-full text-xs">Approve</button>
              <button onClick={() => rejectWithdrawal(w.id)} className="px-4 py-2 bg-error text-white rounded-full text-xs">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
