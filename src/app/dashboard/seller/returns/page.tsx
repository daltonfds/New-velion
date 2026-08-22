"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createDispute } from "./actions";
import VelionLogo from "@/components/ui/VelionLogo";
import { supabase } from "@/lib/supabase";

export default function SellerReturnsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("orders").select("*").eq("seller_id", session.user.id);
      if (data) setOrders(data);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("order_id", orderId);
    formData.append("reason", reason);
    formData.append("description", description);
    try {
      await createDispute(formData);
      alert("Dispute submitted!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Returns & Disputes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-light-border">
            <h3 className="font-semibold mb-4">Open Dispute</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="text-xs text-light-muted">Order ID</label>
              <select value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full p-3 border rounded-lg">
                <option value="">Select Order</option>
                {orders.map((o: any) => <option key={o.id} value={o.id}>#{o.id.slice(0, 8)} - {o.customer_name}</option>)}
              </select>
              <label className="text-xs text-light-muted">Reason</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-3 border rounded-lg">
                <option value="">Select Reason</option>
                <option>Customer refused</option>
                <option>Damaged product</option>
                <option>Wrong product</option>
                <option>Other</option>
              </select>
              <label className="text-xs text-light-muted">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-lg h-20" />
              <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-full">Submit Dispute</button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-xl border border-light-border">
            <h3 className="font-semibold mb-4">Dispute History</h3>
            <p className="text-light-muted text-sm">No disputes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
