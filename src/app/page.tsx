import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <NewvelionBrand size="sm" />
          <nav className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Log in
            </Link>
            <Link href="/register" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-7">
              <NewvelionBrand size="lg" showTagline={false} />
            </div>

            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Commerce infrastructure
            </p>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              The climbing starts here.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Newvelion connects products with sellers and gives affiliates the
              tools to promote, track sales, manage commissions, and grow.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700">
                Start selling
              </Link>
              <Link href="/marketplace" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Explore marketplace
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
              <span>Products ready to promote</span>
              <span>Affiliate links</span>
              <span>Sales & commissions</span>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Seller dashboard
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      Your growth, connected.
                    </p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600">
                    Live
                  </div>
                </div>

                <div className="grid gap-3 pt-5 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Products</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">24</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Sales</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">128</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Commission</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">20%</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      Affiliate performance
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">
                      Growing
                    </span>
                  </div>
                  <div className="mt-5 flex h-24 items-end gap-2">
                    {[28, 42, 36, 58, 51, 72, 88, 76, 96, 100].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-indigo-500"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              ["Discover", "Find products in the marketplace that you can promote."],
              ["Promote", "Create your affiliate link and share it with your audience."],
              ["Grow", "Track clicks, sales, commissions, and withdrawals in one place."],
            ].map(([title, description], index) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                  0{index + 1}
                </div>
                <h2 className="mt-6 text-xl font-bold text-slate-900">{title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
        <NewvelionBrand size="md" showTagline={false} className="justify-center" />
        <h2 className="mx-auto mt-7 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Build your next climb with Newvelion.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Join the marketplace and turn great products into new opportunities.
        </p>
        <Link href="/register" className="mt-8 inline-flex rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700">
          Create your account
        </Link>
      </section>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© {new Date().getFullYear()} Newvelion</span>
          <span>Commerce infrastructure</span>
        </div>
      </footer>
    </main>
  );
}
