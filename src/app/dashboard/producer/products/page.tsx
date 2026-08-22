"use client";

import { useEffect, useState } from "react";
import { createProduct } from "./actions";
import VelionLogo from "@/components/ui/VelionLogo";
import { supabase } from "@/lib/supabase";

export default function ProducerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("products").select("*").eq("supplier_id", session.user.id);
      if (data) setProducts(data);
    };
    load();
  }, []);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    try {
      await createProduct(formData);
      alert("Product added (pending admin approval)!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-light-border">
            <h3 className="font-semibold mb-4">Add New Product</h3>
            <form onSubmit={addProduct} className="space-y-4">
              <label className="text-xs text-light-muted">Product Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-lg" required />
              <label className="text-xs text-light-muted">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-lg h-20" />
              <label className="text-xs text-light-muted">Price (R)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 border rounded-lg" required />
              <button type="submit" className="w-full py-3 bg-primary text-white rounded-full">Add Product</button>
            </form>
          </div>
          <div className="bg-white p-6 rounded-xl border border-light-border">
            <h3 className="font-semibold mb-4">Your Products</h3>
            {products.length === 0 ? <p className="text-light-muted">No products yet.</p> : products.map((p: any) => (
              <div key={p.id} className="flex justify-between py-3 border-b border-light-border">
                <div><p className="font-medium">{p.name}</p><p className="text-xs text-light-muted">{p.is_active ? "Active" : "Pending approval"}</p></div>
                <p className="font-bold">R {p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
