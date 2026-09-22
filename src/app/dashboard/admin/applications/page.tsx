"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { supabase } from "@/lib/supabase";

type Application = {
  id: string;
  full_name: string;
  company_name: string;
  company_type: string;
  email: string;
  phone_e164: string | null;
  products_description: string;
  status: string;
  created_at: string;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);

    const { data, error: queryError } = await supabase
      .from("producer_supplier_applications")
      .select(
        "id,full_name,company_name,company_type,email,phone_e164,products_description,status,created_at",
      )
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setApplications((data || []) as Application[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function action(
    id: string,
    kind: "contacted" | "approve" | "reject",
  ) {
    setError("");

    const functionName =
      kind === "contacted"
        ? "mark_producer_supplier_application_contacted"
        : kind === "approve"
          ? "approve_producer_supplier_application"
          : "reject_producer_supplier_application";

    const { error: rpcError } = await supabase.rpc(functionName, {
      application_id: id,
      review_notes: `Updated from Newvelion admin dashboard.`,
    });

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    await load();
  }

  return (
    <DashboardShell area="admin">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#8A8570]">
            Partner pipeline
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#16294F]">
            Producer & supplier applications
          </h1>

          <p className="mt-2 text-slate-500">
            Review applications, contact prospects and approve account
            creation.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="p-8 text-slate-500">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-slate-500">
              No applications yet.
            </div>
          ) : (
            <div className="divide-y">
              {applications.map((application) => (
                <div key={application.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-[#16294F]">
                          {application.company_name}
                        </h2>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                          {application.company_type}
                        </span>

                        <span className="rounded-full bg-[#16294F]/5 px-2.5 py-1 text-xs font-semibold">
                          {application.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {application.full_name} · {application.email} ·{" "}
                        {application.phone_e164 || "No phone"}
                      </p>

                      <p className="mt-2 max-w-3xl text-sm text-slate-500">
                        {application.products_description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {application.status === "pending" && (
                        <button
                          onClick={() =>
                            action(application.id, "contacted")
                          }
                          className="rounded-lg border px-3 py-2 text-sm font-semibold"
                        >
                          Mark contacted
                        </button>
                      )}

                      {["pending", "contacted"].includes(
                        application.status,
                      ) && (
                        <>
                          <button
                            onClick={() =>
                              action(application.id, "approve")
                            }
                            className="rounded-lg bg-[#16294F] px-3 py-2 text-sm font-semibold text-white"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              action(application.id, "reject")
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
