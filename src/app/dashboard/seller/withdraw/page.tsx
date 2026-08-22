"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";

export default function SellerWithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Verificar saldo
      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", session.user.id).single();
      if (!profile || profile.balance < Number(amount)) {
        alert("Insufficient balance!");
        setLoading(false);
        return;
      }

      // Inserir solicitação de saque
      await supabase.from("withdrawals").insert({
        seller_id: session.user.id,
        amount: Number(amount),
        method,
        status: "pending",
      });

      // Atualizar saldo
      await supabase.from("profiles").update({
        balance: profile.balance - Number(amount)
      }).eq("id", session.user.id);

      alert("Withdrawal requested!");
      setAmount("");
    } catch (err) {
      alert("Error processing withdrawal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Withdraw Funds</h1>
        <div className="bg-white p-6 rounded-xl border border-light-border max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="text-xs text-light-muted">Amount (R)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-lg" required />
            <label className="text-xs text-light-muted">Payout Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-3 border rounded-lg">
              <option>Bank Transfer</option>
              <option>M-Pesa</option>
              <option>Emola</option>
            </select>
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-full">
              {loading ? "Processing..." : "Request Withdrawal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
