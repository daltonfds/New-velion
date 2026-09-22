import Sidebar from "@/components/platform/Sidebar";
import Header from "@/components/platform/Header";
import MobileNav from "@/components/platform/MobileNav";

const stats = [
  { label: "Total Sales", value: "$0.00", change: "0%" },
  { label: "Commissions", value: "$0.00", change: "0%" },
  { label: "Clicks", value: "0", change: "0%" },
  { label: "Conversions", value: "0", change: "0%" },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-8">
              <p className="mb-1 text-sm font-medium text-blue-600">
                Welcome back
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Track your products, sales and affiliate performance.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <span className="text-xs font-medium text-slate-400">
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Sales overview
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Your sales performance over time
                    </p>
                  </div>
                  <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
                    Last 30 days
                  </button>
                </div>

                <div className="mt-8 flex h-64 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
                  Sales analytics
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900">
                  Quick actions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your NewVelion account
                </p>

                <div className="mt-6 space-y-3">
                  <a
                    href="/marketplace"
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Browse Marketplace
                    <span>→</span>
                  </a>

                  <a
                    href="/products"
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    My Products
                    <span>→</span>
                  </a>

                  <a
                    href="/commissions"
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    View Commissions
                    <span>→</span>
                  </a>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
