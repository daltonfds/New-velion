import DashboardLayout from "@/components/layout/DashboardLayout";
import { createServerClient } from "@/lib/supabase";
import { approveRequest, rejectRequest } from "./actions";

export default async function AdminRequestsPage() {
  const supabase = createServerClient();
  
  // Buscar pedidos pendentes
  const { data: requests, error } = await supabase
    .from("registration_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light-text">Pending Registration Requests</h1>
        <p className="text-light-muted text-sm">Review and approve new user applications.</p>
      </div>

      <div className="bg-white rounded-xl border border-light-border shadow-sm overflow-hidden">
        {!requests || requests.length === 0 ? (
          <div className="p-8 text-center text-light-muted text-sm">No pending requests.</div>
        ) : (
          <div className="divide-y divide-light-border">
            {requests.map((req: any) => (
              <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-light-text">{req.full_name}</p>
                  <p className="text-sm text-light-muted">{req.email} • {req.phone}</p>
                  <p className="text-xs text-light-muted uppercase tracking-wider">
                    Role: {req.requested_role}
                  </p>
                  {req.business_name && (
                    <p className="text-xs text-light-muted">Business: {req.business_name}</p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <form action={async (formData: FormData) => {
                    "use server";
                    const pwd = formData.get("tempPassword") as string;
                    await approveRequest(req.id, pwd);
                  }}>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="tempPassword" 
                        placeholder="Temporary password" 
                        className="px-3 py-2 border border-light-border rounded-lg text-sm"
                        required 
                      />
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-success text-white text-sm font-medium rounded-lg hover:bg-success/90"
                      >
                        Approve
                      </button>
                    </div>
                  </form>
                  
                  <form action={async () => {
                    "use server";
                    await rejectRequest(req.id);
                  }}>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-error text-white text-sm font-medium rounded-lg hover:bg-error/90"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
