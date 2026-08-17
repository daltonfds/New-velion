import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function ProducerDashboard() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Good morning, Producer</h1>
        <p className="text-muted text-sm">Manage your inventory and sales.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Total Products</p>
          <p className="text-xl font-bold text-dark mt-1">0</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Inventory Value</p>
          <p className="text-xl font-bold text-success mt-1">R 0.00</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Pending Orders</p>
          <p className="text-xl font-bold text-warning mt-1">0</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Total Earnings</p>
          <p className="text-xl font-bold text-primary mt-1">R 0.00</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark">Stock Alerts</h3>
            <Button variant="outline" className="text-xs px-4 py-2">View All</Button>
          </div>
          <div className="text-center py-8 text-muted text-sm">No low stock alerts.</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark">Recent Orders</h3>
            <Button variant="outline" className="text-xs px-4 py-2">View All</Button>
          </div>
          <div className="text-center py-8 text-muted text-sm">No recent orders.</div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button>Add New Product</Button>
        <Button variant="outline">View Inventory</Button>
      </div>
    </DashboardLayout>
  );
}
