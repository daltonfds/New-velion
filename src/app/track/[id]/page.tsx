"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";

export default function TrackOrderPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single();
      if (data) setOrder(data);
      setLoading(false);
    };
    load();
  }, [params.id]);

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8">
        <div className="flex justify-center mb-6"><VelionLogo className="w-28 h-28" /></div>
        <h2 className="text-xl font-semibold text-light-text text-center mb-2">Order Tracking</h2>
        <p className="text-center text-light-muted text-sm mb-6">Tracking ID: #{params.id}</p>
        {loading ? <p className="text-light-muted text-center">Loading...</p> : order ? (
          <div className="space-y-4">
            <div className="flex justify-between border-b border-light-border pb-2">
              <p className="text-xs text-light-muted">Customer</p>
              <p className="text-sm text-light-text">{order.customer_name}</p>
            </div>
            <div className="flex justify-between border-b border-light-border pb-2">
              <p className="text-xs text-light-muted">Total</p>
              <p className="text-sm font-bold text-light-text">R {order.total_price}</p>
            </div>
            <div className="flex justify-between border-b border-light-border pb-2">
              <p className="text-xs text-light-muted">Status</p>
              <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">{order.status}</span>
            </div>
          </div>
        ) : <p className="text-light-muted text-center">Order not found.</p>}
      </div>
    </div>
  );
}
