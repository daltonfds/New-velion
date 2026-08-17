import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-secondary">
      <Header userType="admin" />
      <main className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark">Platform Overview</h1>
          <p className="text-muted text-sm">Manage the entire Velion ecosystem.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Platform Sales</p><p className="text-xl font-bold text-dark mt-1">R 0.00</p></div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Total Sellers</p><p className="text-xl font-bold text-primary mt-1">0</p></div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Pending Orders</p><p className="text-xl font-bold text-warning mt-1">0</p></div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Pending Withdrawals</p><p className="text-xl font-bold text-error mt-1">R 0.00</p></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm mb-8"><h3 className="font-semibold text-dark mb-4">System Activity</h3><div className="text-center py-8 text-muted text-sm">Waiting for first data sync.</div></div>

        <div className="flex flex-col md:flex-row gap-4">
          <Button className="flex-1 justify-center">View All Orders</Button>
          <Button variant="outline" className="flex-1 justify-center">Manage Users</Button>
        </div>
      </main>
    </div>
  );
}
