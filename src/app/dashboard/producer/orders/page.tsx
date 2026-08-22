import DashboardLayout from "@/components/layout/DashboardLayout";
import { createServerClient } from "@/lib/supabase";

export default async function ProducerOrdersPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Unauthorized</div>;

  const { data: orders } = await supabase
    .from("orders")
    .select("*, products(*)")
    .eq("products.supplier_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Supplier Orders</h1>
        <p className="text-muted text-sm">Track orders placed for your products.</p>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex gap-2">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">All</span>
          <span className="px-3 py-1 bg-warning/10 text-warning text-xs font-medium rounded-full">Pending</span>
          <span className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full">Fulfilled</span>
        </div>
        {!orders || orders.length === 0 ? (
          <div className="p-6 text-center text-muted text-sm py-12">No orders for your products yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order: any) => (
              <div key={order.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-dark">{order.customer_name}</p>
                  <p className="text-sm text-muted">{order.products?.name || "Unknown product"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-dark">R {order.total_price}</p>
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full text-muted">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
