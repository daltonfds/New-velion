"use client";

import { use, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { createDispute } from "./actions";
import { useToast } from "@/components/ui/Toast";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { showToast } = useToast();
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDispute(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("order_id", id);
      await createDispute(formData);
      showToast("Dispute submitted!", "success");
      setIsDisputeOpen(false);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark">Order #VL-{id.slice(0, 8)}</h1>
        <div className="flex gap-2">
          <Button variant="outline">Back to Orders</Button>
          <Button onClick={() => setIsDisputeOpen(true)} className="bg-error/10 text-error hover:bg-error/20">Report Issue</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <div className="text-center py-8 text-muted text-sm">Order details loaded here.</div>
      </div>

      {isDisputeOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsDisputeOpen(false)} className="absolute top-4 right-4 text-muted hover:text-dark text-xl">×</button>
            <h2 className="text-xl font-bold text-dark mb-4">Open a Dispute</h2>
            <form onSubmit={handleDispute} className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1">Reason</label>
                <select name="reason" className="w-full px-4 py-2.5 border border-border rounded-lg bg-secondary/50" required>
                  <option value="">Select reason</option>
                  <option value="customer_refused">Customer refused delivery</option>
                  <option value="damaged_product">Damaged product</option>
                  <option value="wrong_product">Wrong product shipped</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Description</label>
                <textarea name="description" placeholder="Explain the issue..." className="w-full px-4 py-2.5 border border-border rounded-lg bg-secondary/50 h-24 resize-none" required />
              </div>
              <Button type="submit" disabled={loading} className="w-full justify-center">Submit Dispute</Button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
