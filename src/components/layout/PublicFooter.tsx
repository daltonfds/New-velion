"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const legalRoutes = [
  "/terms", "/privacy", "/cookies", "/support", "/refund-policy",
  "/seller-terms", "/acceptable-use", "/security", "/security-reporting",
];

export default function PublicFooter() {
  const pathname = usePathname();
  const hiddenPrefixes = [
    "/dashboard", "/admin", "/login", "/register", "/verify-email",
    "/forgot-password", "/reset-password", "/auth",
  ];

  if (
    hiddenPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/")) ||
    legalRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  ) return null;

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-lg font-extrabold tracking-tight text-[#003B95]">Newvelion</Link>
            <p className="mt-3 max-w-xs text-sm leading-6">Commerce infrastructure connecting products, sellers and customers.</p>
            <p className="mt-3 text-xs text-slate-400">The climbing starts here.</p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#001B44]">Explore</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="hover:text-[#006CE5]" href="/marketplace">Marketplace</Link></li>
              <li><Link className="hover:text-[#006CE5]" href="/suppliers">Suppliers</Link></li>
              <li><Link className="hover:text-[#006CE5]" href="/register">Start selling</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#001B44]">Help & support</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="hover:text-[#006CE5]" href="/support">Contact support</Link></li>
              <li><Link className="hover:text-[#006CE5]" href="/refund-policy">Returns & refunds</Link></li>
              <li><Link className="hover:text-[#006CE5]" href="/security-reporting">Report a security issue</Link></li>
              <li><a className="hover:text-[#006CE5]" href="mailto:contact@newvelion.com">contact@newvelion.com</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#001B44]">Legal & privacy</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="hover:text-[#006CE5]" href="/terms">Terms of Service</Link></li>
              <li><Link className="hover:text-[#006CE5]" href="/privacy">Privacy Policy</Link></li>
              <li><Link className="hover:text-[#006CE5]" href="/cookies">Cookie Policy</Link></li>
              <li><Link className="hover:text-[#006CE5]" href="/seller-terms">Seller & affiliate terms</Link></li>
              <li><Link className="hover:text-[#006CE5]" href="/acceptable-use">Acceptable Use</Link></li>
              <li>
                <button type="button" onClick={() => window.dispatchEvent(new Event("newvelion:open-cookie-settings"))} className="text-left font-semibold text-[#003B95] underline underline-offset-2 hover:text-[#006CE5]">
                  Cookie settings
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-9 flex flex-col gap-3 border-t border-slate-100 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Newvelion · Commerce infrastructure</p>
          <p>Operating entity and registration details should be confirmed before commercial launch.</p>
        </div>
      </div>
    </footer>
  );
}
