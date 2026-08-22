"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";

export default function SellerMarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true);
      if (data) setProducts(data);
    };
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-light-text mb-6">Discover Products</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.length === 0 && <p className="text-light-muted">No products available.</p>}
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-light-border rounded-xl p-4">
              <p className="font-medium text-light-text text-sm">{p.name}</p>
              <p className="text-sm text-primary font-bold mt-2">R {p.price}</p>
              <button className="mt-3 w-full py-2 bg-primary text-white text-xs rounded-full">Add to Store</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
