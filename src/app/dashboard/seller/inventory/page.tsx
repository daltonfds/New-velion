"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";

export default function SellerInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("products").select("*").eq("supplier_id", session.user.id);
      if (data) setProducts(data);
    };
    load();
  }, []);
  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto"><h1 className="text-3xl font-bold mb-6">Inventory</h1><div className="bg-white p-6 rounded-xl border border-light-border">{products.length === 0 ? <p className="text-light-muted">No inventory.</p> : products.map((p: any) => <div key={p.id} className="flex justify-between py-3 border-b border-light-border"><p>{p.name}</p><p className="text-sm text-light-muted">Stock: 0</p></div>)}</div></div>
    </div>
  );
}
