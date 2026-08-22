"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
export default function SellerWithdrawalsPage() {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("Bank Transfer");
  const handleSubmit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("withdrawals").insert({ seller_id: session.user.id, amount, method, status: "pending" });
    alert("Withdrawal requested!");
  };
  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto"><h1 className="text-3xl font-bold mb-6">Withdrawals</h1>
      <div className="bg-white p-6 rounded-xl border border-light-border max-w-md">
        <label className="text-xs text-light-muted">Amount (R)</label><input value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full p-3 border rounded-lg mt-1 mb-4" />
        <label className="text-xs text-light-muted">Method</label><select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-3 border rounded-lg mt-1 mb-4"><option>Bank Transfer</option><option>M-Pesa</option><option>Emola</option></select>
        <button onClick={handleSubmit} className="w-full py-3 bg-primary text-white rounded-full">Request Withdrawal</button>
      </div></div>
    </div>
  );
}
