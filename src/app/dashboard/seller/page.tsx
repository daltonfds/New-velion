import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function SellerDashboard() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Good morning, Seller</h1>
        <p className="text-muted text-sm">Here is your sales overview.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Total Sales</p>
          <p className="text-xl font-bold text-dark mt-1">R 0.00</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Net Profit</p>
          <p className="text-xl font-bold text-success mt-1">R 0.00</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Pending COD</p>
          <p className="text-xl font-bold text-warning mt-1">R 0.00</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <p className="text-xs text-muted font-medium">Available Balance</p>
          <p className="text-xl font-bold text-primary mt-1">R 0.00</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm mb-8">
        <h3 className="font-semibold text-dark mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-muted text-sm">Start selling to see your activity here.</div>
      </div>

      <div className="flex gap-4">
        <Button>Find Products</Button>
        <Button variant="outline">View Orders</Button>
      </div>
    </DashboardLayout>
  );
}
