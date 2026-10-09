"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  ["/", "Home"],
  ["/for-suppliers", "Suppliers"],
  ["/for-sellers", "Sellers"],
  ["/how-it-works", "How it works"],
  ["/pricing", "Pricing"],
  ["/integrations", "Integrations"],
  ["/security", "Security"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="nv-header">
      <div className="nv-wrap nv-bar">
        <Link className="nv-logo" href="/" aria-label="Newvelion home">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <rect x="2" y="16" width="5" height="8" rx="1" fill="#0078E8" />
            <rect x="10" y="10" width="5" height="14" rx="1" fill="#006CE5" />
            <rect x="18" y="3" width="5" height="21" rx="1" fill="#FFB800" />
          </svg>
          Newvelion
        </Link>
        <nav aria-label="Primary">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="nv-btn nv-btn-sm" href="/get-started">Get started</Link>
      </div>
    </header>
  );
}
