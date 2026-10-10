export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] px-5 py-8 lg:pl-[272px]">
      <div className="mx-auto max-w-[1500px] animate-pulse">
        <div className="h-7 w-64 rounded-lg bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 rounded-xl border border-slate-200 bg-white" />)}
        </div>
        <div className="mt-6 h-72 rounded-xl border border-slate-200 bg-white" />
        <p className="mt-4 text-sm text-slate-500">Loading your workspace…</p>
      </div>
    </main>
  );
}
