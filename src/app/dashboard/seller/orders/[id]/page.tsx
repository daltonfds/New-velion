import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function OrderDetailPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark">Order #VL-1001</h1>
        <Button variant="outline">Back to Orders</Button>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div><p className="text-xs text-muted font-medium">Customer</p><p className="text-dark font-medium">Maria Silva</p><p className="text-sm text-muted">maria@example.com</p></div>
          <div><p className="text-xs text-muted font-medium">Status</p><span className="px-3 py-1 bg-warning/10 text-warning text-xs font-medium rounded-full">Pending COD</span></div>
          <div><p className="text-xs text-muted font-medium">Total</p><p className="text-xl font-bold text-dark">R 250.00</p></div>
          <div><p className="text-xs text-muted font-medium">Delivery Address</p><p className="text-sm text-dark">123 Main St, Maputo, Mozambique</p></div>
        </div>
        <div className="border-t border-border pt-4"><p className="text-xs text-muted">Tracking ID: <span className="text-dark font-medium">TRK-9876-5432</span></p></div>
      </div>
    </DashboardLayout>
  );
}
