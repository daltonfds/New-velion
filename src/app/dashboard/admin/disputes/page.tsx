import DashboardLayout from "@/components/layout/DashboardLayout";
import { createServerClient } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import { revalidatePath } from "next/cache";

async function resolveDispute(id: string, resolution: string, response: string) {
  "use server";
  const supabase = createServerClient();
  await supabase.from("disputes").update({ status: "resolved", resolution, admin_response: response }).eq("id", id);
  revalidatePath("/dashboard/admin/disputes");
}

export default async function AdminDisputesPage() {
  const supabase = createServerClient();
  const { data: disputes } = await supabase
    .from("disputes")
    .select("*, orders(customer_name), profiles(full_name, email)")
    .eq("status", "pending");

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-dark mb-6">Disputes</h1>
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {!disputes || disputes.length === 0 ? (
          <div className="p-6 text-center text-muted text-sm py-12">No pending disputes.</div>
        ) : (
          <div className="divide-y divide-border">
            {disputes.map((d: any) => (
              <div key={d.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-dark">{d.profiles?.full_name || "Unknown"}</p>
                  <p className="text-sm text-muted">Order: {d.orders?.customer_name}</p>
                  <p className="text-xs text-muted">Reason: {d.reason}</p>
                  <p className="text-xs text-primary line-clamp-2">{d.description}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <form action={async (formData: FormData) => { 
                    "use server"; 
                    const resp = formData.get("response") as string;
                    await resolveDispute(d.id, "approved", resp);
                  }}>
                    <input name="response" placeholder="Approval note" className="border border-border rounded px-2 py-1 text-sm w-32" />
                    <Button type="submit" className="bg-success hover:bg-success/90 px-3 py-1 mt-1 w-full">Approve</Button>
                  </form>
                  <form action={async (formData: FormData) => {
                    "use server";
                    const resp = formData.get("response") as string;
                    await resolveDispute(d.id, "rejected", resp);
                  }}>
                    <input name="response" placeholder="Rejection note" className="border border-border rounded px-2 py-1 text-sm w-32" />
                    <Button type="submit" className="bg-error hover:bg-error/90 px-3 py-1 mt-1 w-full">Reject</Button>
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
