import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Platform Overview</h1>
        <p className="text-muted text-sm">Manage the entire Velion ecosystem.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Total Sellers</p>
          <p className="text-xl font-bold text-dark mt-1">0</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Total Producers</p>
          <p className="text-xl font-bold text-dark mt-1">0</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Pending Products</p>
          <p className="text-xl font-bold text-warning mt-1">0</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Pending Withdrawals</p>
          <p className="text-xl font-bold text-error mt-1">R 0.00</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-dark mb-4">Recent Users</h3>
          <div className="text-center py-8 text-muted text-sm">No users registered yet.</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-semibold text-dark mb-4">Pending Approvals</h3>
          <div className="text-center py-8 text-muted text-sm">No pending approvals.</div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button>View All Users</Button>
        <Button variant="outline">Manage Platform Settings</Button>
      </div>
    </DashboardLayout>
  );
}
