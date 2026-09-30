"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import NewvelionBrand from "@/components/ui/NewvelionBrand";

function Icon({
  name,
  size = 22,
}: {
  name:
    | "arrow"
    | "check"
    | "box"
    | "link"
    | "cart"
    | "truck"
    | "wallet"
    | "shield"
    | "chart"
    | "bell"
    | "menu"
    | "x"
    | "globe"
    | "clock";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<string, React.ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    box: (
      <>
        <path d="m21 8-9 5-9-5 9-5 9 5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
        <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 7 20l1.15-1.15" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v10H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 6h16v13H4z" />
        <path d="M4 6a2 2 0 0 1 2-2h12" />
        <path d="M16 12h4" />
        <circle cx="16" cy="12" r=".5" fill="currentColor" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-4 3 2 5-6" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    x: (
      <>
        <path d="m6 6 12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c3 3 3 15 0 18" />
        <path d="M12 3c-3 3-3 15 0 18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

const features = [
  {
    icon: "box" as const,
    title: "Commission-ready marketplace",
    text: "Every product shows its price, commission and delivery information before you share it.",
  },
  {
    icon: "link" as const,
    title: "One unique link per product",
    text: "Share your link with WhatsApp, Instagram or Facebook. Every sale stays connected to you.",
  },
  {
    icon: "cart" as const,
    title: "Ready-to-use checkout",
    text: "A prepared product and payment experience means you focus on selling, not building checkout pages.",
  },
  {
    icon: "truck" as const,
    title: "Delivery handled by us",
    text: "Stock, packing and transportation are managed through Newvelion.",
  },
  {
    icon: "shield" as const,
    title: "Buyer protection",
    text: "A buyer-protection layer gives customers more confidence when purchasing through your link.",
  },
  {
    icon: "link" as const,
    title: "Fraud-resistant links",
    text: "Invalid clicks and self-purchases are automatically blocked.",
  },
];

const faqs = [
  {
    q: "Do I have to pay to start?",
    a: "No. Creating a seller account is free. You can browse the marketplace and choose products without purchasing inventory first.",
  },
  {
    q: "Do I need stock or do the deliveries myself?",
    a: "No. The Newvelion model is designed so sellers do not need to purchase, store, pack or deliver stock themselves.",
  },
  {
    q: "When do I receive my commission?",
    a: "Your commission is recorded after an eligible sale is confirmed. Any applicable holding period is shown in your wallet and transaction history.",
  },
  {
    q: "What fees are there?",
    a: "Fees can apply when withdrawing funds. The earnings calculator on this page uses an illustrative 5% + R10 withdrawal example.",
  },
  {
    q: "What happens if a customer requests a refund?",
    a: "Refunds are handled according to the applicable order and buyer-protection rules. A refunded or cancelled sale does not remain an eligible commission.",
  },
  {
    q: "Do I need a registered company?",
    a: "You can start as an individual seller where permitted. Verification requirements may apply before certain withdrawals or account activities.",
  },
  {
    q: "Can I sell to customers in another country?",
    a: "Availability depends on the product, delivery destination and Newvelion market. Product information should be checked before promoting it internationally.",
  },
];

const comparison = [
  "Buy stock before making a sale",
  "Store, pack and ship every order",
  "Handle payments and returns yourself",
  "Risk being left with unsold inventory",
];

export default function HomePage() {
  const [saleValue, setSaleValue] = useState(1000);
  const [commission, setCommission] = useState(25);
  const [salesPerMonth, setSalesPerMonth] = useState(4);
  const [mobileMenu, setMobileMenu] = useState(false);

  const earnings = useMemo(() => {
    const gross = saleValue * (commission / 100);
    const withdrawalFee = gross * 0.05 + 10;
    const net = Math.max(0, gross - withdrawalFee);

    return {
      gross,
      withdrawalFee,
      net,
      monthly: net * salesPerMonth,
    };
  }, [saleValue, commission, salesPerMonth]);

  const money = (value: number) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <main className="min-h-screen bg-white text-[#16294F]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Newvelion home">
            <NewvelionBrand size="sm" showTagline={false} />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-[#16294F]">
              How it works
            </a>
            <a href="#earnings" className="text-sm font-medium text-slate-600 hover:text-[#16294F]">
              Earnings
            </a>
            <a href="#payouts" className="text-sm font-medium text-slate-600 hover:text-[#16294F]">
              Payments
            </a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-[#16294F]">
              FAQ
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#16294F] hover:bg-slate-50"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#16294F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#203a6d]"
            >
              Create account
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="rounded-lg border border-slate-200 p-2 md:hidden"
            aria-label="Open menu"
          >
            <Icon name={mobileMenu ? "x" : "menu"} />
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#how-it-works" onClick={() => setMobileMenu(false)} className="font-medium">
                How it works
              </a>
              <a href="#earnings" onClick={() => setMobileMenu(false)} className="font-medium">
                Earnings
              </a>
              <a href="#payouts" onClick={() => setMobileMenu(false)} className="font-medium">
                Payments
              </a>
              <a href="#faq" onClick={() => setMobileMenu(false)} className="font-medium">
                FAQ
              </a>
              <div className="flex gap-3 border-t border-slate-200 pt-4">
                <Link href="/login" className="flex-1 rounded-lg border border-slate-200 py-3 text-center text-sm font-semibold">
                  Log in
                </Link>
                <Link href="/register" className="flex-1 rounded-lg bg-[#16294F] py-3 text-center text-sm font-semibold text-white">
                  Create account
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div>
            <NewvelionBrand size="md" className="mb-10" />

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C99A2E]/30 bg-[#C99A2E]/5 px-3 py-1.5 text-xs font-semibold text-[#8A6A18]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C99A2E]" />
              Commerce infrastructure for Southern Africa
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.03] tracking-[-0.045em] sm:text-6xl lg:text-[72px]">
              Sell products.
              <span className="block text-[#C99A2E]">We handle stock and delivery.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Newvelion is a dropshipping platform built for Mozambique and South Africa.
              Choose a product, share your unique link and earn a commission on every sale.
              You do not buy stock, pack orders or make deliveries.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#16294F] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#203a6d]"
              >
                Start selling for free
                <Icon name="arrow" size={18} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3.5 text-sm font-bold text-[#16294F] hover:bg-slate-50"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Icon name="check" size={16} />
                No monthly fees
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="check" size={16} />
                No inventory required
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="check" size={16} />
                Delivery handled by us
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="border border-slate-200 bg-slate-50 p-4 sm:p-6">
              <div className="border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Seller performance
                    </p>
                    <p className="mt-1 text-lg font-bold">Commissions · 30 days</p>
                  </div>
                  <span className="rounded-md bg-[#C99A2E]/10 px-2.5 py-1 text-xs font-bold text-[#8A6A18]">
                    Live
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Commissions in the last 30 days</p>
                      <p className="mt-1 text-4xl font-bold tracking-tight">R6,120</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">+18.4%</span>
                  </div>

                  <div className="mt-8 flex h-40 items-end gap-3 border-b border-slate-200">
                    {[34, 49, 42, 65, 58, 76, 68, 91, 78, 100, 84, 96].map((height, i) => (
                      <div key={i} className="flex h-full flex-1 items-end">
                        <div
                          className="w-full rounded-t-sm bg-[#C99A2E]"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                  </div>

                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      New sale through your link
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-semibold">Wireless Headphones</span>
                      <span className="text-xl font-bold text-emerald-600">+R227.50</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="border border-slate-200 bg-white p-4">
                  <p className="text-2xl font-bold">Up to 30%</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">commission per sale</p>
                </div>
                <div className="border border-slate-200 bg-white p-4">
                  <p className="text-2xl font-bold">30 days</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">attribution cookie</p>
                </div>
                <div className="border border-slate-200 bg-white p-4">
                  <p className="text-2xl font-bold">2 markets</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Mozambique & South Africa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C99A2E]">
              How it works
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              The simpler way to sell online
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              From your phone to the customer, every stage has a clear owner.
              You make the sale; the platform handles the rest.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-5">
            {[
              ["01", "Choose", "Browse the catalog, commission and final customer price.", "box"],
              ["02", "Share", "Copy your unique link and send it through WhatsApp or social media.", "link"],
              ["03", "Customer orders", "The customer completes the order through a ready checkout.", "cart"],
              ["04", "We deliver", "Stock, packing and delivery are managed through Newvelion.", "truck"],
              ["05", "You earn", "Your eligible commission is recorded in your wallet.", "wallet"],
            ].map(([number, title, text, icon]) => (
              <div key={number} className="bg-white p-7">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#C99A2E]">{number}</span>
                  <span className="text-[#16294F]">
                    <Icon name={icon as any} size={21} />
                  </span>
                </div>
                <h3 className="mt-10 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm font-semibold text-slate-500">
            The steps in gold are yours. The remaining steps belong to the platform.
          </p>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            <div className="border border-slate-200 bg-white p-7 sm:p-9">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Selling on your own
              </p>
              <h3 className="mt-3 text-2xl font-bold">More work before every sale</h3>
              <ul className="mt-7 space-y-4">
                {comparison.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <span className="mt-1 text-slate-400">
                      <Icon name="x" size={16} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-2 border-[#C99A2E] bg-white p-7 sm:p-9">
              <p className="text-sm font-bold uppercase tracking-wider text-[#8A6A18]">
                Selling with Newvelion
              </p>
              <h3 className="mt-3 text-2xl font-bold">You focus on the customer</h3>
              <ul className="mt-7 space-y-4">
                {[
                  "Zero investment in inventory",
                  "Stock, packing and delivery managed by us",
                  "Checkout and payment experience ready",
                  "You earn when an eligible sale happens",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <span className="mt-1 text-[#C99A2E]">
                      <Icon name="check" size={16} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="earnings" className="border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C99A2E]">
              Earnings simulator
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              See what you could earn per sale
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Adjust the values and see an illustrative amount reaching your wallet.
              No hidden fees are included in this example.
            </p>
          </div>

          <div className="mt-14 grid overflow-hidden border border-slate-200 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-8 bg-slate-50 p-7 sm:p-10">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold">Sale value</label>
                  <span className="font-bold">R{saleValue}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={saleValue}
                  onChange={(e) => setSaleValue(Number(e.target.value))}
                  className="mt-4 w-full accent-[#C99A2E]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold">Product commission</label>
                  <span className="font-bold">{commission}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="mt-4 w-full accent-[#C99A2E]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold">Sales per month</label>
                  <span className="font-bold">{salesPerMonth}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={salesPerMonth}
                  onChange={(e) => setSalesPerMonth(Number(e.target.value))}
                  className="mt-4 w-full accent-[#C99A2E]"
                />
              </div>
            </div>

            <div className="bg-[#16294F] p-7 text-white sm:p-10">
              <p className="text-sm font-semibold text-slate-300">Illustrative calculation</p>

              <div className="mt-8 space-y-5">
                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-300">Gross commission</span>
                  <strong>{money(earnings.gross)}</strong>
                </div>

                <div className="flex justify-between border-b border-white/10 pb-4">
                  <span className="text-slate-300">Withdrawal fee (5% + R10)</span>
                  <strong className="text-[#C99A2E]">−{money(earnings.withdrawalFee)}</strong>
                </div>

                <div className="flex justify-between border-b border-white/10 pb-5">
                  <span className="font-semibold">You receive per sale</span>
                  <strong className="text-2xl text-[#C99A2E]">{money(earnings.net)}</strong>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-slate-300">Estimated monthly net</p>
                  <p className="mt-2 text-4xl font-bold">{money(earnings.monthly)}</p>
                </div>
              </div>

              <p className="mt-8 text-xs leading-5 text-slate-400">
                *The withdrawal fee is applied when funds are withdrawn. Values are illustrative
                and may not represent your actual withdrawal conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C99A2E]">
              Built for sellers
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Everything you need to sell seriously
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Business tools designed to work well on your phone, without unnecessary complexity.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border border-slate-200 bg-white p-7 transition hover:border-[#C99A2E]"
              >
                <div className="flex h-11 w-11 items-center justify-center border border-[#C99A2E]/30 bg-[#C99A2E]/5 text-[#8A6A18]">
                  <Icon name={feature.icon} size={21} />
                </div>
                <h3 className="mt-6 text-lg font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:py-28">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C99A2E]">
              Seller dashboard
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              A clear dashboard, without surprises
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              See what you sold, what is being held and what is already available to withdraw.
            </p>

            <div className="mt-8 space-y-4">
              {[
                ["wallet", "Transparent wallet", "Available and retained balances stay separated with a detailed transaction history."],
                ["chart", "Real-time performance", "Track clicks, conversion, sales and commissions across your products."],
                ["bell", "Immediate notifications", "Know when a sale happens, a commission is released or a withdrawal arrives."],
              ].map(([icon, title, text]) => (
                <div key={title} className="flex gap-4">
                  <div className="mt-1 text-[#C99A2E]">
                    <Icon name={icon as any} size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 bg-slate-50 p-4 sm:p-6">
            <div className="border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Seller wallet
                  </p>
                  <p className="mt-1 text-xl font-bold">Available balance</p>
                </div>
                <Icon name="wallet" size={24} />
              </div>

              <div className="grid grid-cols-3 border-b border-slate-200">
                <div className="p-5">
                  <p className="text-xs text-slate-400">Available</p>
                  <p className="mt-1 text-xl font-bold">R4,275</p>
                </div>
                <div className="border-l border-slate-200 p-5">
                  <p className="text-xs text-slate-400">Sales (30d)</p>
                  <p className="mt-1 text-xl font-bold">38</p>
                </div>
                <div className="border-l border-slate-200 p-5">
                  <p className="text-xs text-slate-400">Conversion</p>
                  <p className="mt-1 text-xl font-bold">6.2%</p>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {[
                  ["Wireless Headphones", "+R180"],
                  ["Smart Watch", "+R240"],
                  ["Rechargeable LED Lamp", "+R95"],
                  ["M-Pesa Withdrawal", "−R1,500"],
                ].map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 border border-slate-200 bg-slate-50" />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <span className={`text-sm font-bold ${value.startsWith("+") ? "text-emerald-600" : "text-slate-600"}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-400">
                Example data for illustration.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="payouts" className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C99A2E]">
              Payouts
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Withdraw in your country, your way
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Payment methods are adapted to your location, with processing depending on the
              selected method and verification requirements.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <div className="border border-slate-200 bg-white p-7 sm:p-9">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl">🇲🇿</span>
                  <h3 className="mt-4 text-2xl font-bold">Mozambique</h3>
                  <p className="mt-1 text-sm font-semibold text-[#8A6A18]">Metical (MZN)</p>
                </div>
                <Icon name="globe" size={26} />
              </div>

              <div className="mt-8 divide-y divide-slate-200">
                {[
                  ["Bank transfer", "Through bank details, subject to processing."],
                  ["M-Pesa", "Directly to your mobile number where supported."],
                  ["e-Mola", "Directly to your mobile number where supported."],
                ].map(([title, text]) => (
                  <div key={title} className="py-5 first:pt-0 last:pb-0">
                    <h4 className="font-bold">{title}</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-7 sm:p-9">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl">🇿🇦</span>
                  <h3 className="mt-4 text-2xl font-bold">South Africa</h3>
                  <p className="mt-1 text-sm font-semibold text-[#8A6A18]">Rand (ZAR)</p>
                </div>
                <Icon name="shield" size={26} />
              </div>

              <div className="mt-8 divide-y divide-slate-200">
                <div className="py-5 first:pt-0">
                  <h4 className="font-bold">Bank transfer</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Major banks supported, subject to processing and verification.
                  </p>
                </div>
                <div className="py-5">
                  <h4 className="font-bold">Identity verification</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    The account holder must match the verified seller profile to protect your funds.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-5 text-sm text-slate-500">
                  <Icon name="clock" size={18} />
                  Processing time can vary by payment method.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C99A2E]">
              FAQ
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-12 divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left font-bold">
                  <span>{faq.q}</span>
                  <span className="text-[#C99A2E] transition-transform group-open:rotate-45">
                    <Icon name="x" size={20} />
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#16294F]">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 lg:py-24">
          <NewvelionBrand size="md" className="justify-center [&_span]:!text-white" />
          <h2 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Your first commission is one link away.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Free registration, no card required. Choose a product today and start sharing.
          </p>
          <Link
            href="/register"
            className="mt-9 inline-flex items-center gap-2 rounded-lg bg-[#C99A2E] px-7 py-3.5 text-sm font-bold text-white hover:bg-[#b58a25]"
          >
            Create your free account
            <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <NewvelionBrand size="sm" />
              <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
                Commerce infrastructure for Mozambique and South Africa.
                Sell without inventory and grow without managing fulfilment yourself.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold">Platform</h3>
              <div className="mt-5 space-y-3 text-sm text-slate-500">
                <a href="#how-it-works" className="block hover:text-[#16294F]">How it works</a>
                <a href="#earnings" className="block hover:text-[#16294F]">Earnings simulator</a>
                <a href="#payouts" className="block hover:text-[#16294F]">Payments</a>
                <a href="#faq" className="block hover:text-[#16294F]">Questions</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold">Contact</h3>
              <div className="mt-5 space-y-3 text-sm text-slate-500">
                <a href="mailto:contact@newvelion.com" className="block hover:text-[#16294F]">
                  contact@newvelion.com
                </a>
                <a href="#" className="block hover:text-[#16294F]">
                  Instagram @newvelion
                </a>
                <a href="tel:+27722958915" className="block hover:text-[#16294F]">
                  +27 72 295 8915
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Newvelion</span>
            <div className="flex gap-5">
              <Link href="/terms" className="hover:text-[#16294F]">Terms</Link>
              <Link href="/privacy" className="hover:text-[#16294F]">Privacy</Link>
              <Link href="/support" className="hover:text-[#16294F]">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
