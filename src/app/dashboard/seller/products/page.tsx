"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VelionLogo from "@/components/ui/VelionLogo";
import { supabase } from "@/lib/supabase";

export default function SellerProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      // Buscar todos os produtos ativos (Marketplace)
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (data) {
        setProducts(data);
      }

      setLoading(false);
    };

    loadProducts();
  }, [router]);

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <VelionLogo className="w-8 h-8" />
            <span className="font-display text-xl font-semibold text-light-text">Velion Seller</span>
          </div>
          <button
            onClick={() => { supabase.auth.signOut(); router.replace("/login"); }}
            className="text-sm text-light-muted hover:text-light-text"
          >
            Sign Out
          </button>
        </div>

        <h1 className="text-3xl font-bold text-light-text mb-2">Products</h1>
        <p className="text-light-muted text-sm mb-8">Browse and manage the products available in the marketplace.</p>

        <div className="bg-white p-6 rounded-xl border border-light-border shadow-sm">
          {loading ? (
            <p className="text-light-muted text-sm">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-light-muted text-sm">No products available.</p>
          ) : (
            <div className="space-y-4">
              {products.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between border-b border-light-border pb-4">
                  <div>
                    <p className="text-sm font-medium text-light-text">{product.name}</p>
                    <p className="text-xs text-light-muted">{product.description || "No description"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">R {product.price}</p>
                    <p className="text-xs text-light-muted">Stock: {product.is_active ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
