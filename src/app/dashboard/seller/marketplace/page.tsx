"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SellerMarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true);
      if (data) setProducts(data);
    };
    load();
  }, []);

  const addToStore = async (product: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("orders").insert({
      product_id: product.id,
      seller_id: session.user.id,
      customer_name: "Store Import",
      quantity: 1,
      total_price: product.price,
      status: "pending",
    });
    alert(`Product "${product.name}" imported to your store!`);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Discover Products</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.length === 0 && <p className="text-sm text-light-muted">No products available.</p>}
        {products.map((p) => (
          <div key={p.id} className="bg-white border border-light-border rounded-xl p-4">
            <p className="font-medium text-sm">{p.name}</p>
            <p className="text-sm text-primary font-bold mt-2">R {p.price}</p>
            <button onClick={() => addToStore(p)} className="mt-3 w-full py-2 bg-primary text-white text-xs rounded-full">Add to Store</button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
