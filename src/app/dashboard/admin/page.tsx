import AppShell from "@/components/layout/AppShell";

export default function AdminDashboardPage() {
  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage Newvelion and monitor platform activity.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Users", "0"],
            ["Active Products", "0"],
            ["Sales", "0"],
            ["Withdrawals", "0"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
