import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./marketing.css";
import { SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";

const inter = Inter({ subsets: ["latin"], variable: "--nv-font", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Newvelion — Commerce infrastructure", template: "%s — Newvelion" },
  description:
    "Newvelion connects suppliers in South Africa and China with sellers and affiliates, and runs the orders, commissions and payouts between them.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`nv-site ${inter.variable}`}>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
