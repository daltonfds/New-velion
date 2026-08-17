import VelionLogo from "@/components/ui/VelionLogo";
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3"><VelionLogo className="w-10 h-10" showText={false} /><span className="font-display text-xl font-semibold text-dark tracking-wide">Velion</span></div>
        <div className="flex gap-3 text-muted"><span>🔔</span><span>⚙️</span></div>
      </div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-dark">Admin Overview</h1><p className="text-muted text-sm">Platform metrics and management.</p></div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Total Platform Sales</p><p className="text-xl font-bold text-dark mt-1">R 0.00</p></div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Active Sellers</p><p className="text-xl font-bold text-primary mt-1">0</p></div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Pending Orders</p><p className="text-xl font-bold text-warning mt-1">0</p></div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Pending Withdrawals</p><p className="text-xl font-bold text-error mt-1">R 0.00</p></div>
      </div>
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm"><h3 className="font-semibold text-dark mb-4">Platform Activity</h3><div className="text-center py-8 text-muted text-sm">Waiting for first data sync.</div></div>
    </div>
  );
}
