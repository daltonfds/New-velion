"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";

export default function ProducerInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("products").select("*").eq("supplier_id", session.user.id);
      if (data) setProducts(data);
    };
    load();
  }, []);

  const addBatch = async (product_id: string, expiry_date: string, quantity: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("batches").insert({
      product_id,
      quantity,
      expiry_date,
      status: "available"
    });
    alert("Batch added!");
  };

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Inventory</h1>
        <div className="bg-white p-6 rounded-xl border border-light-border">
          {products.length === 0 ? <p className="text-light-muted">No inventory.</p> : products.map((p: any) => (
            <div key={p.id} className="flex justify-between py-3 border-b border-light-border">
              <div><p className="font-medium">{p.name}</p><p className="text-xs text-light-muted">Available: 0</p></div>
              <div className="flex gap-2">
                <button onClick={() => addBatch(p.id, "2026-12-31", 100)} className="px-3 py-1 bg-primary text-white text-xs rounded-full">Add Batch</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
