import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-secondary">
      <Header userType="seller" />
      <main className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark">Good morning, Seller</h1>
          <p className="text-muted text-sm">Here is your sales overview.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Total Sales</p><p className="text-xl font-bold text-dark mt-1">R 0.00</p></div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Net Profit</p><p className="text-xl font-bold text-success mt-1">R 0.00</p></div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Pending COD</p><p className="text-xl font-bold text-warning mt-1">R 0.00</p></div>
          <div className="bg-white p-4 rounded-xl border border-border shadow-sm"><p className="text-xs text-muted font-medium">Available Balance</p><p className="text-xl font-bold text-primary mt-1">R 0.00</p></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm"><h3 className="font-semibold text-dark mb-4">Recent Orders</h3><div className="text-center py-8 text-muted text-sm">No orders yet. Start selling!</div></div>
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm"><h3 className="font-semibold text-dark mb-4">Inventory Alerts</h3><div className="text-center py-8 text-muted text-sm">Sync your inventory to get started.</div></div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Button className="flex-1 justify-center">Find Products to Sell</Button>
          <Button variant="outline" className="flex-1 justify-center">View Order History</Button>
        </div>
      </main>
    </div>
  );
}
