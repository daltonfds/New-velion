"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CustomerNav from "@/components/customer/CustomerNav";
import { supabase } from "@/lib/supabase";

type DeliveryForm = { full_name: string; email: string; phone: string; province: string; city: string; postal_code: string; address: string; address_reference: string };
const initialForm: DeliveryForm = { full_name: "", email: "", phone: "", province: "", city: "", postal_code: "", address: "", address_reference: "" };

function CheckoutContent() {
  const params = useSearchParams();
  const productId = params.get("product") || "";
  const quantity = Math.max(1, Math.min(50, Number(params.get("qty") || 1)));
  const [product, setProduct] = useState<any>(null);
  const [form, setForm] = useState<DeliveryForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [{ data: { session } }, { data: productData }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from("products").select("id,nome,preco,preco_promocional,moeda,fotos,ativo,supplier_status").eq("id", productId).maybeSingle(),
      ]);
      if (cancelled) return;
      if (!productData || !productData.ativo || productData.supplier_status !== "approved") {
        setError("Product unavailable."); setLoading(false); return;
      }
      setProduct(productData);
      if (session) {
        setForm((current) => ({ ...current, email: session.user.email || "" }));
        const { data: address } = await supabase.from("customer_addresses").select("*").eq("user_id", session.user.id).eq("is_default", true).maybeSingle();
        if (cancelled) return;
        if (address) {
          setForm((current) => ({ ...current, full_name: address.full_name || "", phone: address.phone || "", province: address.province || "", city: address.city || "", postal_code: address.postal_code || "", address: address.address || "", address_reference: address.address_reference || "" }));
        } else {
          const { data: profile } = await supabase.from("profiles").select("full_name,phone_number,phone_e164").eq("id", session.user.id).maybeSingle();
          if (!cancelled && profile) setForm((current) => ({ ...current, full_name: profile.full_name || "", phone: profile.phone_e164 || profile.phone_number || "" }));
        }
      }
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [productId]);

  async function pay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setPaying(true);
    try {
      const response = await fetch("/api/customer/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: productId, quantity, ...form }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "Checkout failed."); setPaying(false); return; }
      window.location.href = result.checkout_url;
    } catch { setError("Unable to start checkout. Please try again."); setPaying(false); }
  }

  if (loading) return <main className="min-h-screen grid place-items-center">Loading checkout...</main>;
  const price = Number(product?.preco_promocional || product?.preco || 0);
  const total = price * quantity;
  const fields: { key: keyof DeliveryForm; label: string; type?: string; required?: boolean; autoComplete?: string }[] = [
    { key: "full_name", label: "Full name", required: true, autoComplete: "name" },
    { key: "email", label: "Email address", type: "email", required: true, autoComplete: "email" },
    { key: "phone", label: "Phone number", type: "tel", required: true, autoComplete: "tel" },
    { key: "province", label: "Province", required: true, autoComplete: "address-level1" },
    { key: "city", label: "City", required: true, autoComplete: "address-level2" },
    { key: "postal_code", label: "Postal code", autoComplete: "postal-code" },
    { key: "address", label: "Delivery address", required: true, autoComplete: "street-address" },
    { key: "address_reference", label: "Address reference (optional)" },
  ];
  return <main className="min-h-screen bg-[#f6f9fc]">
    <CustomerNav />
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl font-extrabold text-[#0e1f3d]">Secure checkout</h1>
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px]">
        <form onSubmit={pay} className="space-y-4 rounded-[12px] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-[#0e1f3d]">Delivery details</h2>
          <p className="text-sm text-slate-500">Guest checkout is available. We create or link your customer account only after an administrator approves the sale.</p>
          {fields.map((field) => <input key={field.key} name={field.key} type={field.type || "text"} autoComplete={field.autoComplete || "off"} required={field.required} placeholder={field.label} aria-label={field.label} value={form[field.key]} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} className="w-full rounded-[7px] border border-slate-200 px-4 py-3" />)}
          {error && <div role="alert" className="rounded-[7px] bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <button disabled={paying} className="w-full rounded-[7px] bg-[#0078e8] py-4 font-extrabold text-white disabled:opacity-60">{paying ? "Redirecting to payment..." : "Continue to secure payment"}</button>
        </form>
        <aside className="h-fit rounded-[12px] border border-slate-200 bg-white p-6">
          {product?.fotos?.[0] && <img src={product.fotos[0]} alt={product?.nome || "Product"} className="aspect-square w-full rounded-[7px] object-cover" />}
          <h2 className="mt-4 font-extrabold text-[#0e1f3d]">{product?.nome}</h2>
          <p className="mt-2 text-sm text-slate-500">Quantity: {quantity}</p>
          <div className="mt-5 flex justify-between border-t pt-4 font-extrabold"><span>Total</span><span>R {total.toFixed(2)}</span></div>
          <p className="mt-3 text-xs text-slate-400">Delivery is calculated from the supplier's South African shipping rules.</p>
        </aside>
      </div>
    </div>
  </main>;
}
export default function CheckoutPage() { return <Suspense fallback={<main className="min-h-screen grid place-items-center">Loading checkout...</main>}><CheckoutContent /></Suspense>; }
