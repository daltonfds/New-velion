"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

export default function AdminDisputesPage() {
  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Disputes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer and seller disputes across the
            platform.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm text-slate-500">
              Open Disputes
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              0
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Under Review
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              0
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-500">
              Resolved
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              0
            </p>
          </Card>
        </div>

        <Card>
          <div className="flex min-h-[280px] items-center justify-center text-center">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                —
              </div>

              <h2 className="mt-4 font-semibold text-slate-900">
                No disputes available
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                The dispute management interface is ready,
                but dispute records are not currently connected
                to the platform backend.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
