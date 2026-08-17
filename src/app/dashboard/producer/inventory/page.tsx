import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ProducerInventoryPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Inventory</h1>
        <p className="text-muted text-sm">Manage your stock levels and batches.</p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div><p className="text-xs text-muted">Available</p><p className="text-xl font-bold text-dark">0 units</p></div>
          <div><p className="text-xs text-muted">Reserved</p><p className="text-xl font-bold text-warning">0 units</p></div>
          <div><p className="text-xs text-muted">In Transit</p><p className="text-xl font-bold text-primary">0 units</p></div>
          <div><p className="text-xs text-muted">Low Stock Alerts</p><p className="text-xl font-bold text-error">0</p></div>
        </div>
        <div className="text-center py-8 text-muted text-sm">Sync your inventory using the API or manually add stock.</div>
      </div>
    </DashboardLayout>
  );
}
