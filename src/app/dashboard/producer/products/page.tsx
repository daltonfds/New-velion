import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function ProducerProductsPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">My Products</h1>
          <p className="text-muted text-sm">Manage your product catalog.</p>
        </div>
        <Button>+ Add Product</Button>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-dark"
            />
          </div>
        </div>
        
        <div className="p-6 text-center text-muted text-sm py-12">
          You haven't added any products yet.
        </div>
      </div>
    </DashboardLayout>
  );
}
