"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";
export default function ProducerWithdrawalsPage() {
  const [amount, setAmount] = useState(0);
  const handleSubmit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("withdrawals").insert({ seller_id: session.user.id, amount, method: "Bank Transfer", status: "pending" });
    alert("Withdrawal requested!");
  };
  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto"><h1 className="text-3xl font-bold mb-6">Withdrawals</h1><div className="bg-white p-6 rounded-xl border border-light-border max-w-md"><p className="text-xs text-light-muted">Amount (R)</p><input value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full p-3 border rounded-lg mb-4" /><button onClick={handleSubmit} className="w-full py-3 bg-primary text-white rounded-full">Request Withdrawal</button></div></div>
    </div>
  );
}
