import DashboardLayout from "@/components/layout/DashboardLayout";
import { createServerClient } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import { revalidatePath } from "next/cache";

async function updateKycStatus(userId: string, status: string) {
  "use server";
  const supabase = createServerClient();
  await supabase.from("profiles").update({ role: status === "approved" ? "verified_supplier" : "rejected" }).eq("id", userId);
  revalidatePath("/dashboard/admin/kyc");
}

export default async function AdminKYCPage() {
  const supabase = createServerClient();
  const { data: pending } = await supabase
    .from("profiles")
    .select("id, full_name, email, country, supplier_details")
    .eq("supplier_details.verification_status", "pending");

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark">KYC / Document Verification</h1>
        <p className="text-muted text-sm">Review seller and producer documents.</p>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {!pending || pending.length === 0 ? (
          <div className="p-6 text-center text-muted text-sm py-12">No pending verifications.</div>
        ) : (
          <div className="divide-y divide-border">
            {pending.map((user: any) => (
              <div key={user.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-dark">{user.full_name}</p>
                  <p className="text-sm text-muted">{user.email}</p>
                  <p className="text-xs text-muted">Country: {user.country}</p>
                  {user.supplier_details?.documents_url?.length > 0 && (
                    <div className="mt-1 flex gap-2">
                      {user.supplier_details.documents_url.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" className="text-xs text-primary underline">Doc {i+1}</a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <form action={async () => { "use server"; await updateKycStatus(user.id, "approved"); }}>
                    <Button type="submit" className="bg-success hover:bg-success/90 text-xs px-4 py-2">Approve</Button>
                  </form>
                  <form action={async () => { "use server"; await updateKycStatus(user.id, "rejected"); }}>
                    <Button type="submit" className="bg-error hover:bg-error/90 text-xs px-4 py-2">Reject</Button>
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
