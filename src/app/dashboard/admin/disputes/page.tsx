"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("disputes").select("*").order("created_at", { ascending: false });
      if (data) setDisputes(data);
    };
    load();
  }, []);

  const resolveDispute = async (id: string, resolution: string) => {
    await supabase.from("disputes").update({ status: "resolved", resolution }).eq("id", id);
    setDisputes(disputes.filter((d) => d.id !== id));
    alert("Dispute resolved!");
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Disputes</h1>
      <div className="bg-white p-6 rounded-xl border border-light-border">
        {disputes.length === 0 ? <p className="text-sm text-light-muted">No disputes.</p> : disputes.map((d: any) => (
          <div key={d.id} className="flex justify-between py-4 border-b border-light-border">
            <div>
              <p className="font-medium">{d.reason}</p>
              <p className="text-xs text-light-muted">{d.description}</p>
              <p className="text-xs text-light-muted mt-1">Status: {d.status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => resolveDispute(d.id, "Approved")} className="px-4 py-2 bg-success text-white rounded-full text-xs">Approve</button>
              <button onClick={() => resolveDispute(d.id, "Rejected")} className="px-4 py-2 bg-error text-white rounded-full text-xs">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
