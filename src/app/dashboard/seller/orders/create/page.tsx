"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

export default function CreateOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true);
      if (data) setProducts(data);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from("orders").insert({
        product_id: selectedProduct,
        seller_id: session.user.id,
        customer_name: customerName,
        address,
        city,
        phone,
        quantity,
        total_price: Number(sellingPrice) * quantity,
        delivery_fee: deliveryFee,
        status: "pending",
      });
      alert("Order created!");
      router.push("/dashboard/seller/orders");
    } catch (err) {
      alert("Error creating order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Create Order</h1>
      <div className="bg-white p-6 rounded-xl border border-light-border max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="text-xs text-light-muted">Product</label>
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full p-3 border rounded-lg">
            <option value="">Select Product</option>
            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <label className="text-xs text-light-muted">Customer Name</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <label className="text-xs text-light-muted">Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <label className="text-xs text-light-muted">City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <label className="text-xs text-light-muted">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <label className="text-xs text-light-muted">Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full p-3 border rounded-lg" required />
          <label className="text-xs text-light-muted">Selling Price (R)</label>
          <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <label className="text-xs text-light-muted">Delivery Fee (R)</label>
          <input type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(Number(e.target.value))} className="w-full p-3 border rounded-lg" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-full">Create Order</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
