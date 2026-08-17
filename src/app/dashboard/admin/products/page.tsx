import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function AdminProductsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Product Approvals</h1>
        <p className="text-muted text-sm">Review and approve producer products.</p>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex gap-2">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Pending</span>
          <span className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full">Approved</span>
          <span className="px-3 py-1 bg-error/10 text-error text-xs font-medium rounded-full">Rejected</span>
        </div>
        
        <div className="p-6 text-center text-muted text-sm py-12">
          No products awaiting approval.
        </div>
      </div>
    </DashboardLayout>
  );
}
