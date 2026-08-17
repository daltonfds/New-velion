import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function AdminUsersPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Users</h1>
          <p className="text-muted text-sm">Manage all platform accounts.</p>
        </div>
        <Button variant="outline">+ Invite User</Button>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-dark"
          />
        </div>
        
        <div className="p-6 text-center text-muted text-sm py-12">
          No users found.
        </div>
      </div>
    </DashboardLayout>
  );
}
