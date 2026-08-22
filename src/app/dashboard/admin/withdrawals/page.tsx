import DashboardLayout from "@/components/layout/DashboardLayout";
import { createServerClient } from "@/lib/supabase";

export default async function AdminWithdrawalsPage() {
  const supabase = createServerClient();
  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("*, profiles(full_name, email)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">Withdrawals</h1>
        <p className="text-muted text-sm">Manage seller withdrawal requests.</p>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Pending</span>
        </div>
        
        {!withdrawals || withdrawals.length === 0 ? (
          <div className="p-6 text-center text-muted text-sm py-12">No pending withdrawal requests.</div>
        ) : (
          <div className="divide-y divide-border">
            {withdrawals.map((w: any) => (
              <div key={w.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-dark">{w.profiles?.full_name || "Unknown Seller"}</p>
                  <p className="text-sm text-muted">{w.profiles?.email}</p>
                  <p className="text-xs text-muted">Method: {w.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-dark">R {w.amount}</p>
                  <div className="flex gap-2 mt-1">
                    <form action={async () => {
                      "use server";
                      const supabase = createServerClient();
                      await supabase.from("withdrawals").update({ status: "approved" }).eq("id", w.id);
                    }}>
                      <button className="text-xs bg-success/10 text-success px-3 py-1 rounded-full hover:bg-success/20">Approve</button>
                    </form>
                    <form action={async () => {
                      "use server";
                      const supabase = createServerClient();
                      await supabase.from("withdrawals").update({ status: "rejected" }).eq("id", w.id);
                    }}>
                      <button className="text-xs bg-error/10 text-error px-3 py-1 rounded-full hover:bg-error/20">Reject</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
