"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar produtos da API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.filter((p: any) => !p.is_active)); // Mostrar apenas os pendentes
    } catch (err) {
      console.error("Erro ao buscar produtos", err);
    } finally {
      setLoading(false);
    }
  };

  // Aprovar ou rejeitar
  const handleAction = async (id: string, is_active: boolean) => {
    if (!confirm(`Are you sure you want to ${is_active ? 'approve' : 'reject'} this product?`)) return;
    
    try {
      await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active }),
      });
      // Recarregar a lista após a ação
      fetchProducts();
    } catch (err) {
      alert("Error updating product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Product Approvals</h1>
        <p className="text-muted text-sm">Review and approve producer products.</p>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex gap-2">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Pending</span>
          <span className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full">Approved</span>
          <span className="px-3 py-1 bg-error/10 text-error text-xs font-medium rounded-full">Rejected</span>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-muted text-sm">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">No products awaiting approval.</div>
          ) : (
            <div className="space-y-4">
              {products.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                  <div className="flex items-center gap-4">
                    {product.images && product.images.length > 0 && (
                      <img src={product.images[0]} alt={product.name} className="w-16 h-16 rounded-lg object-cover border border-border" />
                    )}
                    <div>
                      <h4 className="font-medium text-dark">{product.name}</h4>
                      <p className="text-sm text-muted">R {product.price}</p>
                      <p className="text-xs text-muted">Category: {product.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="bg-success hover:bg-success/90 text-xs px-4 py-2"
                      onClick={() => handleAction(product.id, true)}
                    >
                      Approve
                    </Button>
                    <Button 
                      className="bg-error hover:bg-error/90 text-xs px-4 py-2"
                      onClick={() => handleAction(product.id, false)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
