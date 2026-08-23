"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase.from("orders").select("*").eq("seller_id", session.user.id);
      if (data) setOrders(data);
    };
    load();
  }, [router]);

  const filteredOrders = filter === "all" ? orders : orders.filter((o: any) => o.status === filter);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="bg-white p-6 rounded-xl border border-light-border">
        <div className="flex gap-2 mb-4">
          {["all", "pending", "processing", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                filter === status ? "bg-primary text-white" : "bg-light-bg text-light-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        {filteredOrders.length === 0 ? <p className="text-sm text-light-muted">No orders.</p> : filteredOrders.map((o: any) => (
          <div key={o.id} className="flex justify-between py-3 border-b border-light-border">
            <div>
              <p className="font-medium">{o.customer_name}</p>
              <p className="text-xs text-light-muted">#{o.id.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">R {o.total_price}</p>
              <p className="text-xs text-light-muted">{o.status}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
