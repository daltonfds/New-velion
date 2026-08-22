"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";
export default function ProducerFulfillmentPage() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("orders").select("*").eq("status", "pending");
      if (data) setOrders(data);
    };
    load();
  }, []);
  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto"><h1 className="text-3xl font-bold mb-6">Fulfillment Orders</h1><div className="bg-white p-6 rounded-xl border border-light-border">{orders.length === 0 ? <p className="text-light-muted">No pending fulfillment.</p> : orders.map((o: any) => <div key={o.id} className="flex justify-between py-2 border-b border-light-border"><p>{o.customer_name}</p><p className="font-bold">R {o.total_price}</p></div>)}</div></div>
    </div>
  );
}
