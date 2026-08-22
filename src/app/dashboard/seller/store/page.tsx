"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";

export default function SellerStorePage() {
  const [storeProducts, setStoreProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("products").select("*").eq("supplier_id", session.user.id);
      if (data) setStoreProducts(data);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <VelionLogo className="w-8 h-8" /><span className="font-display text-xl font-semibold">My Store</span>
          </div>
          <Link href="/dashboard/seller/store/products"><button className="px-4 py-2 bg-primary text-white rounded-full text-sm">+ Add Product</button></Link>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <Link href="/dashboard/seller/store/products" className="bg-white p-4 rounded-xl border border-light-border text-center">Products ({storeProducts.length})</Link>
          <Link href="/dashboard/seller/store/collections" className="bg-white p-4 rounded-xl border border-light-border text-center">Collections (0)</Link>
          <div className="bg-white p-4 rounded-xl border border-light-border text-center">Pricing</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-light-border">
          <h3 className="font-semibold text-light-text mb-4">Store Products</h3>
          {storeProducts.length === 0 ? <p className="text-light-muted text-sm">No products in your store.</p> : storeProducts.map((p: any) => (
            <div key={p.id} className="flex justify-between border-b border-light-border py-3">
              <p className="text-sm">{p.name}</p><p className="text-sm font-bold">R {p.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
