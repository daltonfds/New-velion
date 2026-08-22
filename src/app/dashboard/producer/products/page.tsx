"use client";

import { useEffect, useState } from "react";
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

  const addProduct = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("products").insert({
      supplier_id: session.user.id,
      name,
      description,
      price: Number(price),
      cost_price: Number(price),
      is_active: false
    });
    alert("Product added (pending admin approval)!");
    setName(""); setDescription(""); setPrice("");
  };

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-light-text mb-6">Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-light-border">
            <h3 className="font-semibold mb-4">Add New Product</h3>
            <p className="text-xs text-light-muted">Product Name</p><input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-lg mb-3" />
            <p className="text-xs text-light-muted">Description</p><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-lg mb-3 h-20" />
            <p className="text-xs text-light-muted">Price (R)</p><input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 border rounded-lg mb-3" />
            <button onClick={addProduct} className="w-full py-3 bg-primary text-white rounded-full">Add Product</button>
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
