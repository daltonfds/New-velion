"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";

export default function AdminMarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", false);
      if (data) setProducts(data);
    };
    load();
  }, []);

  const approveProduct = async (id: string) => {
    await supabase.from("products").update({ is_active: true }).eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  };

  const rejectProduct = async (id: string) => {
    await supabase.from("products").update({ is_active: false }).eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Marketplace Approvals</h1>
        <div className="bg-white p-6 rounded-xl border border-light-border">
          {products.length === 0 ? <p className="text-light-muted">No pending products.</p> : products.map((p: any) => (
            <div key={p.id} className="flex justify-between py-3 border-b border-light-border">
              <div><p className="font-medium">{p.name}</p><p className="text-xs text-light-muted">R {p.price}</p></div>
              <div className="flex gap-2">
                <button onClick={() => approveProduct(p.id)} className="px-4 py-2 bg-success text-white rounded-full text-xs">Approve</button>
                <button onClick={() => rejectProduct(p.id)} className="px-4 py-2 bg-error text-white rounded-full text-xs">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
