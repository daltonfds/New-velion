"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestWithdrawal } from "./actions";
import VelionLogo from "@/components/ui/VelionLogo";

export default function SellerWithdrawalsPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("method", method);
    try {
      await requestWithdrawal(formData);
      alert("Withdrawal requested successfully!");
      setAmount("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Withdrawals</h1>
        <div className="bg-white p-6 rounded-xl border border-light-border max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="text-xs text-light-muted">Amount (R)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-lg" required />
            <label className="text-xs text-light-muted">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full p-3 border rounded-lg">
              <option>Bank Transfer</option>
              <option>M-Pesa</option>
              <option>Emola</option>
            </select>
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-full">Request Withdrawal</button>
          </form>
        </div>
      </div>
    </div>
  );
}
