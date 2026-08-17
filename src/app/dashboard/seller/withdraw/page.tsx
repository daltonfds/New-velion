"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { requestWithdrawal } from "./actions";
import { useToast } from "@/components/ui/Toast";

export default function WithdrawPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await requestWithdrawal(formData);
      showToast("Withdrawal requested successfully!", "success");
      setAmount("");
    } catch (err: any) {
      showToast(err.message || "Error processing withdrawal", "error");
    } finally {
      setLoading(false);
    }
  }

  const numericAmount = parseFloat(amount) || 0;
  const fee = (numericAmount * 0.025) + 10;
  const total = numericAmount + fee;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Withdraw Funds</h1>
        <p className="text-muted text-sm">Request a payout from your available balance.</p>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Amount (R)</label>
            <input 
              type="number" 
              name="amount" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              placeholder="50.00" 
              className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark" 
              required 
              min="1"
            />
          </div>
          {numericAmount > 0 && (
            <div className="text-xs text-muted space-y-1 bg-secondary/50 p-3 rounded-lg">
              <p>Withdrawal Amount: <span className="font-bold text-dark">R {numericAmount.toFixed(2)}</span></p>
              <p>Processing Fee (2.5% + R10): <span className="font-bold text-error">R {fee.toFixed(2)}</span></p>
              <p className="border-t border-border pt-1 mt-1">Total Deduction: <span className="font-bold text-dark">R {total.toFixed(2)}</span></p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Payout Method</label>
            <select name="method" value={method} onChange={e => setMethod(e.target.value)} className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark">
              <option>Bank Transfer</option>
              <option>M-Pesa</option>
              <option>Emola</option>
            </select>
          </div>
          <Button type="submit" disabled={loading || numericAmount <= 0} className="w-full">Request Withdrawal</Button>
        </form>
        <div className="mt-4 text-center text-xs text-muted">
          Cash on Delivery & Electronic Payments are currently in Beta. Coming Soon.
        </div>
      </div>
    </DashboardLayout>
  );
}
