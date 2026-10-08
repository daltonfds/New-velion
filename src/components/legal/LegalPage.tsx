import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";

interface LegalPageProps {
  title: string;
  description: string;
  updated?: string;
  children: React.ReactNode;
}

export default function LegalPage({
  title,
  description,
  updated = "30 September 2026",
  children,
}: LegalPageProps) {
  return (
    <main className="min-h-screen bg-white text-[#0A0440]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/">
            <NewvelionBrand size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold hover:bg-slate-50 sm:block"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#10069F]">
            Newvelion Legal
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            {description}
          </p>
          <p className="mt-5 text-sm text-slate-400">
            Last updated: {updated}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="max-w-none text-[15px] leading-7 text-slate-700 [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-[#0A0440] [&_h2:first-child]:mt-0 [&_p]:mb-5 [&_ul]:mb-6 [&_ul]:ml-6 [&_ul]:list-disc [&_li]:mb-2 [&_a]:font-semibold [&_a]:text-[#8A6A18] [&_a:hover]:underline">
          {children}
        </div>
      </article>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <NewvelionBrand size="sm" />

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/cookies">Cookies</Link>
              <Link href="/refund-policy">Refunds</Link>
              <Link href="/seller-terms">Seller Terms</Link>
              <Link href="/acceptable-use">Acceptable Use</Link>
              <Link href="/support">Support</Link>\n              <Link href="/security">Security</Link>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            © 2026 Newvelion. Commerce infrastructure for Mozambique and South Africa.
          </p>
        </div>
      </footer>
    </main>
  );
}
