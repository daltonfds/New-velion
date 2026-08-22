"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("orders").select("*").eq("seller_id", session.user.id).order("created_at", { ascending: false });
      if (data) setOrders(data);
    };
    load();
  }, []);
  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-light-text mb-6">Orders</h1>
        <div className="bg-white p-6 rounded-xl border border-light-border">
          {orders.length === 0 ? <p className="text-light-muted">No orders yet.</p> : orders.map((o: any) => (
            <div key={o.id} className="flex justify-between py-3 border-b border-light-border">
              <div><p className="font-medium">{o.customer_name}</p><p className="text-xs text-light-muted">#{o.id.slice(0, 8)}</p></div>
              <div className="text-right"><p className="font-bold">R {o.total_price}</p><p className="text-xs text-light-muted">{o.status}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
