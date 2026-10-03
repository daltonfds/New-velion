import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/marketplace" className="inline-flex items-center gap-3">
              <span className="flex items-end gap-1" aria-hidden="true">
                <span className="h-3 w-2 rounded-sm bg-[#C99A2E]" />
                <span className="h-4 w-2 rounded-sm bg-[#C99A2E]" />
                <span className="h-5 w-2 rounded-sm bg-[#C99A2E]" />
              </span>

              <span className="text-xl font-black tracking-tight text-[#16294F]">
                Newvelion
              </span>
            </Link>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Commerce infrastructure connecting products, suppliers and
              sellers through one marketplace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-sm sm:grid-cols-3">
            <div>
              <h3 className="font-bold text-slate-950">Marketplace</h3>

              <div className="mt-4 space-y-3">
                <Link
                  href="/marketplace"
                  className="block text-slate-500 hover:text-[#16294F]"
                >
                  Browse products
                </Link>

                <Link
                  href="/marketplace"
                  className="block text-slate-500 hover:text-[#16294F]"
                >
                  Featured products
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-950">Business</h3>

              <div className="mt-4 space-y-3">
                <Link
                  href="/register"
                  className="block text-slate-500 hover:text-[#16294F]"
                >
                  Become a seller
                </Link>

                <Link
                  href="/apply/producer"
                  className="block text-slate-500 hover:text-[#16294F]"
                >
                  Become a supplier
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-950">Account</h3>

              <div className="mt-4 space-y-3">
                <Link
                  href="/login"
                  className="block text-slate-500 hover:text-[#16294F]"
                >
                  Sign in
                </Link>

                <Link
                  href="/register"
                  className="block text-slate-500 hover:text-[#16294F]"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Newvelion. All rights reserved.
          </span>

          <span>Commerce infrastructure</span>
        </div>
      </div>
    </footer>
  );
}
