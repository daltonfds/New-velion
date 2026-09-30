"use client";

import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import { useState } from "react";

const gold = "#C99A2E";
const navy = "#16294F";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#16294F]">
      {children}
    </span>
  );
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default function Home() {
  const [sale, setSale] = useState(1000);
  const [commission, setCommission] = useState(25);
  const [sales, setSales] = useState(4);

  const gross = sale * (commission / 100);
  const withdrawal = gross * 0.05 + 10;
  const receive = Math.max(gross - withdrawal, 0);
  const monthly = receive * sales;

  return (
    <main className="min-h-screen bg-white text-[#16294F]">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-5 lg:px-8">
          <Link href="/">
            <NewvelionBrand size="sm" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#how-it-works" className="transition hover:text-[#16294F]">How it works</a>
            <a href="#earnings" className="transition hover:text-[#16294F]">Earnings</a>
            <a href="#payments" className="transition hover:text-[#16294F]">Payments</a>
            <a href="#faq" className="transition hover:text-[#16294F]">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden px-4 py-2.5 text-sm font-semibold text-[#16294F] sm:block">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#16294F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F1F3D]"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-slate-200 bg-[#F8FAFC]">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 lg:py-28">

          <div>
            <div className="mb-7">
              <NewvelionBrand size="md" />
            </div>

            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#8A6A18]">
              Commerce infrastructure for Southern Africa
            </p>

            <h1 className="max-w-3xl text-[3.4rem] font-bold leading-[1.02] tracking-[-0.055em] text-[#16294F] sm:text-[4.5rem]">
              Sell products.
              <br />
              <span className="text-slate-500">We handle stock and delivery.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Newvelion is a dropshipping platform built for Mozambique and South Africa. Choose a product, share your unique link and earn a commission on every sale. You do not buy stock, pack orders or make deliveries.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#16294F] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#0F1F3D]"
              >
                Start selling for free
                <Arrow />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-[#16294F] hover:border-[#16294F]"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2"><Check />No monthly fees</span>
              <span className="flex items-center gap-2"><Check />No inventory required</span>
              <span className="flex items-center gap-2"><Check />Delivery handled by us</span>
            </div>
          </div>

          {/* BUSINESS METRICS PANEL */}
          <div className="border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm font-bold text-[#16294F]">Seller performance</p>
                <p className="mt-1 text-xs text-slate-400">Commissions · 30 days</p>
              </div>
              <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-500">Commissions in the last 30 days</p>
              <div className="mt-2 flex items-end justify-between">
                <strong className="text-4xl tracking-tight text-[#16294F]">R6,120</strong>
                <span className="text-sm font-bold text-emerald-600">+18.4%</span>
              </div>

              <div className="mt-8 flex h-32 items-end gap-3 border-b border-slate-200">
                {[35, 52, 67, 88].map((height, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
                    <div
                      className="w-full max-w-12 rounded-t bg-[#16294F]"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-slate-400">Week {i + 1}</span>
                  </div>
                ))}
              </div>

              <div className="mt-7 border border-slate-200 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  New sale through your link
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">Wireless Headphones</span>
                  <strong className="text-lg text-emerald-600">+R227.50</strong>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200">
                <div className="px-3 first:pl-0">
                  <strong className="text-xl">Up to 30%</strong>
                  <p className="mt-1 text-xs leading-5 text-slate-400">commission per sale</p>
                </div>
                <div className="px-3">
                  <strong className="text-xl">30 days</strong>
                  <p className="mt-1 text-xs leading-5 text-slate-400">attribution cookie</p>
                </div>
                <div className="px-3 last:pr-0">
                  <strong className="text-xl">2 markets</strong>
                  <p className="mt-1 text-xs leading-5 text-slate-400">Mozambique & South Africa</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A6A18]">How it works</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em]">The simpler way to sell online</h2>
            <p className="mt-5 text-lg leading-8 text-slate-500">
              From your phone to the customer, every stage has a clear owner. You make the sale; the platform handles the rest.
            </p>
          </div>

          <div className="mt-14 grid border-y border-slate-200 md:grid-cols-5">
            {[
              ["01", "Choose", "Browse the catalog, commission and final customer price."],
              ["02", "Share", "Copy your unique link and send it through WhatsApp or social media."],
              ["03", "Customer orders", "The customer completes the order through a ready checkout."],
              ["04", "We deliver", "Stock, packing and delivery are managed through Newvelion."],
              ["05", "You earn", "Your eligible commission is recorded in your wallet."],
            ].map(([number, title, text]) => (
              <div key={number} className="border-b border-slate-200 p-6 md:border-b-0 md:border-r last:md:border-r-0">
                <span className="text-xs font-bold text-[#C99A2E]">{number}</span>
                <h3 className="mt-10 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-slate-400">
            The steps in gold are yours. The remaining steps belong to the platform.
          </p>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="border-b border-slate-200 bg-[#F8FAFC]">
        <div className="mx-auto grid max-w-[1180px] gap-px border border-slate-200 bg-slate-200 px-0 lg:grid-cols-2">
          <div className="bg-white p-8 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Selling on your own</p>
            <h2 className="mt-3 text-3xl font-bold">More work before every sale</h2>
            <ul className="mt-8 space-y-5 text-sm text-slate-600">
              {[
                "Buy stock before making a sale",
                "Store, pack and ship every order",
                "Handle payments and returns yourself",
                "Risk being left with unsold inventory",
              ].map(x => <li key={x} className="flex gap-3"><span className="mt-0.5 text-slate-300">—</span>{x}</li>)}
            </ul>
          </div>

          <div className="bg-[#16294F] p-8 text-white lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D8B45B]">Selling with Newvelion</p>
            <h2 className="mt-3 text-3xl font-bold">You focus on the customer</h2>
            <ul className="mt-8 space-y-5 text-sm text-slate-200">
              {[
                "Zero investment in inventory",
                "Stock, packing and delivery managed by us",
                "Checkout and payment experience ready",
                "You earn when an eligible sale happens",
              ].map(x => <li key={x} className="flex gap-3"><Check />{x}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* EARNINGS */}
      <section id="earnings" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A6A18]">Earnings simulator</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em]">See what you could earn per sale</h2>
            <p className="mt-5 text-lg leading-8 text-slate-500">
              Adjust the values and see an illustrative amount reaching your wallet. No hidden fees are included in this example.
            </p>
          </div>

          <div className="mt-12 grid border border-slate-200 lg:grid-cols-[1fr_1fr]">
            <div className="border-b border-slate-200 p-7 lg:border-b-0 lg:border-r lg:p-10">
              <div className="space-y-8">
                <label className="block">
                  <span className="flex justify-between text-sm font-semibold">
                    <span>Sale value</span><strong>R{sale}</strong>
                  </span>
                  <input type="range" min="100" max="5000" step="100" value={sale} onChange={e => setSale(+e.target.value)} className="mt-4 w-full accent-[#16294F]" />
                </label>

                <label className="block">
                  <span className="flex justify-between text-sm font-semibold">
                    <span>Product commission</span><strong>{commission}%</strong>
                  </span>
                  <input type="range" min="5" max="30" step="1" value={commission} onChange={e => setCommission(+e.target.value)} className="mt-4 w-full accent-[#16294F]" />
                </label>

                <label className="block">
                  <span className="flex justify-between text-sm font-semibold">
                    <span>Sales per month</span><strong>{sales}</strong>
                  </span>
                  <input type="range" min="1" max="20" step="1" value={sales} onChange={e => setSales(+e.target.value)} className="mt-4 w-full accent-[#16294F]" />
                </label>
              </div>
            </div>

            <div className="bg-[#F8FAFC] p-7 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8A6A18]">Illustrative calculation</p>

              <div className="mt-8 divide-y divide-slate-200">
                <div className="flex justify-between py-4 text-sm">
                  <span className="text-slate-500">Gross commission</span>
                  <strong>R {gross.toFixed(2).replace(".", ",")}</strong>
                </div>
                <div className="flex justify-between py-4 text-sm">
                  <span className="text-slate-500">Withdrawal fee (5% + R10)</span>
                  <strong>−R {withdrawal.toFixed(2).replace(".", ",")}</strong>
                </div>
                <div className="flex justify-between py-5">
                  <span className="font-semibold">You receive per sale</span>
                  <strong className="text-xl text-emerald-600">R {receive.toFixed(2).replace(".", ",")}</strong>
                </div>
              </div>

              <div className="mt-6 border-l-4 border-[#C99A2E] bg-white p-5">
                <p className="text-xs uppercase tracking-wider text-slate-400">Estimated monthly net</p>
                <strong className="mt-1 block text-4xl tracking-tight">R {monthly.toFixed(2).replace(".", ",")}</strong>
              </div>

              <p className="mt-5 text-xs leading-5 text-slate-400">
                *The withdrawal fee is applied when funds are withdrawn. Values are illustrative and may not represent your actual withdrawal conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-b border-slate-200 bg-[#F8FAFC]">
        <div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A6A18]">Built for sellers</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em]">Everything you need to sell seriously</h2>
            <p className="mt-5 text-lg leading-8 text-slate-500">
              Business tools designed to work well on your phone, without unnecessary complexity.
            </p>
          </div>

          <div className="mt-12 grid border-l border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Commission-ready marketplace", "Every product shows its price, commission and delivery information before you share it."],
              ["One unique link per product", "Share your link with WhatsApp, Instagram or Facebook. Every sale stays connected to you."],
              ["Ready-to-use checkout", "A prepared product and payment experience means you focus on selling, not building checkout pages."],
              ["Delivery handled by us", "Stock, packing and transportation are managed through Newvelion."],
              ["Buyer protection", "A buyer-protection layer gives customers more confidence when purchasing through your link."],
              ["Fraud-resistant links", "Invalid clicks and self-purchases are automatically blocked."],
            ].map(([title, text]) => (
              <div key={title} className="border-b border-r border-slate-200 bg-white p-7">
                <Icon><Check /></Icon>
                <h3 className="mt-5 font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A6A18]">Seller dashboard</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em]">A clear dashboard, without surprises</h2>
            <p className="mt-5 text-lg leading-8 text-slate-500">
              See what you sold, what is being held and what is already available to withdraw.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <h3 className="font-bold">Transparent wallet</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">Available and retained balances stay separated with a detailed transaction history.</p>
              </div>
              <div>
                <h3 className="font-bold">Real-time performance</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">Track clicks, conversion, sales and commissions across your products.</p>
              </div>
              <div>
                <h3 className="font-bold">Immediate notifications</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">Know when a sale happens, a commission is released or a withdrawal arrives.</p>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-[#F8FAFC]">
            <div className="border-b border-slate-200 bg-white px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Seller wallet</p>
            </div>
            <div className="p-6">
              <div className="border-b border-slate-200 pb-6">
                <p className="text-sm text-slate-500">Available balance</p>
                <div className="mt-1 flex items-center gap-3">
                  <strong className="text-4xl">R4,275</strong>
                  <span className="text-xs font-bold text-emerald-600">Available</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-b border-slate-200 py-6 sm:grid-cols-3">
                <div><p className="text-xs text-slate-400">Sales (30d)</p><strong className="mt-1 block text-2xl">38</strong></div>
                <div><p className="text-xs text-slate-400">Conversion</p><strong className="mt-1 block text-2xl">6.2%</strong></div>
              </div>

              <div className="divide-y divide-slate-200">
                {[
                  ["Wireless Headphones", "+R180"],
                  ["Smart Watch", "+R240"],
                  ["Rechargeable LED Lamp", "+R95"],
                  ["M-Pesa Withdrawal", "−R1,500"],
                ].map(([name, value]) => (
                  <div key={name} className="flex justify-between py-4 text-sm">
                    <span>{name}</span>
                    <strong className={value.startsWith("+") ? "text-emerald-600" : "text-slate-500"}>{value}</strong>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs text-slate-400">Example data for illustration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PAYMENTS */}
      <section id="payments" className="border-b border-slate-200 bg-[#F8FAFC]">
        <div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8A6A18]">Payouts</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em]">Withdraw in your country, your way</h2>
            <p className="mt-5 text-lg leading-8 text-slate-500">
              Payment methods are adapted to your location, with processing depending on the selected method and verification requirements.
            </p>
          </div>

          <div className="mt-12 grid gap-px border border-slate-200 bg-slate-200 md:grid-cols-2">
            <div className="bg-white p-8 lg:p-10">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🇲🇿</span>
                <div>
                  <h3 className="text-xl font-bold">Mozambique</h3>
                  <p className="text-sm text-slate-400">Metical (MZN)</p>
                </div>
              </div>
              <div className="mt-8 space-y-6">
                <div><strong>Bank transfer</strong><p className="mt-1 text-sm text-slate-500">Through bank details, subject to processing.</p></div>
                <div><strong>M-Pesa</strong><p className="mt-1 text-sm text-slate-500">Directly to your mobile number where supported.</p></div>
                <div><strong>e-Mola</strong><p className="mt-1 text-sm text-slate-500">Directly to your mobile number where supported.</p></div>
              </div>
            </div>

            <div className="bg-white p-8 lg:p-10">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🇿🇦</span>
                <div>
                  <h3 className="text-xl font-bold">South Africa</h3>
                  <p className="text-sm text-slate-400">Rand (ZAR)</p>
                </div>
              </div>
              <div className="mt-8 space-y-6">
                <div><strong>Bank transfer</strong><p className="mt-1 text-sm text-slate-500">Major banks supported, subject to processing and verification.</p></div>
                <div><strong>Identity verification</strong><p className="mt-1 text-sm text-slate-500">The account holder must match the verified seller profile to protect your funds.</p></div>
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs text-slate-400">Processing time can vary by payment method.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[900px] px-5 py-20 lg:py-24">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#8A6A18]">FAQ</p>
          <h2 className="mt-3 text-center text-4xl font-bold tracking-[-0.04em]">Frequently asked questions</h2>

          <div className="mt-12 divide-y divide-slate-200 border-y border-slate-200">
            {[
              "Do I have to pay to start?",
              "Do I need stock or do the deliveries myself?",
              "When do I receive my commission?",
              "What fees are there?",
              "What happens if a customer requests a refund?",
              "Do I need a registered company?",
              "Can I sell to customers in another country?",
            ].map(q => (
              <details key={q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-6 text-base font-semibold">
                  {q}
                  <span className="text-2xl font-normal text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#16294F]">
        <div className="mx-auto max-w-[1180px] px-5 py-20 text-center lg:px-8 lg:py-24">
          <NewvelionBrand size="md" showTagline />
          <h2 className="mx-auto mt-10 max-w-3xl text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
            Your first commission is one link away.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-300">
            Free registration, no card required. Choose a product today and start sharing.
          </p>
          <Link
            href="/register"
            className="mt-9 inline-flex items-center gap-3 rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-[#16294F] hover:bg-slate-100"
          >
            Create your free account
            <Arrow />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-12 lg:px-8">
          <div className="grid gap-10 border-b border-slate-200 pb-10 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <NewvelionBrand size="sm" />
              <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
                Commerce infrastructure for Mozambique and South Africa. Sell without inventory and grow without managing fulfilment yourself.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16294F]">Platform</p>
              <div className="mt-5 space-y-3 text-sm text-slate-500">
                <a href="#how-it-works" className="block hover:text-[#16294F]">How it works</a>
                <a href="#earnings" className="block hover:text-[#16294F]">Earnings simulator</a>
                <a href="#payments" className="block hover:text-[#16294F]">Payments</a>
                <a href="#faq" className="block hover:text-[#16294F]">Questions</a>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16294F]">Contact</p>
              <div className="mt-5 space-y-3 text-sm text-slate-500">
                <a href="mailto:contact@newvelion.com" className="block hover:text-[#16294F]">contact@newvelion.com</a>
                <span className="block">Instagram @newvelion</span>
                <span className="block">+27 72 295 8915</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-7 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-400">© 2026 Newvelion</p>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
              <Link href="/terms" className="hover:text-[#16294F]">Terms</Link>
              <Link href="/privacy" className="hover:text-[#16294F]">Privacy</Link>
              <Link href="/cookies" className="hover:text-[#16294F]">Cookies</Link>
              <Link href="/refund-policy" className="hover:text-[#16294F]">Refunds</Link>
              <Link href="/seller-terms" className="hover:text-[#16294F]">Seller Terms</Link>
              <Link href="/acceptable-use" className="hover:text-[#16294F]">Acceptable Use</Link>
              <Link href="/support" className="hover:text-[#16294F]">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
