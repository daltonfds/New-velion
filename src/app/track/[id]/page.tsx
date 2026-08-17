import { createServerClient } from "@/lib/supabase/server";
import VelionLogo from "@/components/ui/VelionLogo";
import { notFound } from "next/navigation";

export default async function TrackingPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, products(*)")
    .eq("id", params.id)
    .single();

  if (error || !order) return notFound();

  const statusColors: Record<string, string> = {
    pending: "bg-warning/20 text-warning",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-primary/20 text-primary",
    delivered: "bg-success/20 text-success",
    cancelled: "bg-error/20 text-error",
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6"><VelionLogo className="w-16 h-16" /></div>
        <h1 className="text-xl font-bold text-dark mb-1">Order Tracking</h1>
        <p className="text-sm text-muted mb-6">ID: #{params.id.slice(0, 8)}</p>

        <div className="mb-6 space-y-2 text-left">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-xs text-muted">Customer</span>
            <span className="text-sm text-dark font-medium">{order.customer_name}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-xs text-muted">Product</span>
            <span className="text-sm text-dark">{order.products?.name || "Product"}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-xs text-muted">Quantity</span>
            <span className="text-sm text-dark">{order.quantity}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-xs text-muted">Total (COD)</span>
            <span className="text-sm font-bold text-dark">R {order.total_price}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-xs text-muted">Delivery Address</span>
            <span className="text-sm text-dark text-right">{order.address}, {order.city}</span>
          </div>
        </div>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
          <span className="w-2 h-2 rounded-full bg-current" />
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
        <p className="mt-6 text-xs text-muted">Last updated: {new Date(order.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
