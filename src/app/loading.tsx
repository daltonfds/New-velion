export default function Loading() {
  return (
    <main className="min-h-[50vh] bg-white px-5 py-12">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-7 w-56 rounded-lg bg-slate-100" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-100" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 rounded-xl border border-slate-100 bg-slate-50" />)}
        </div>
        <div className="mt-6 h-64 rounded-xl border border-slate-100 bg-slate-50" />
        <p className="mt-4 text-sm text-slate-500">Loading Newvelion…</p>
      </div>
    </main>
  );
}
