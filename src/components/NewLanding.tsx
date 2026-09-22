"use client";

import { useState } from "react";
import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";

const menuItems = [
  { label: "For Sellers", href: "#sellers" },
  { label: "For Producers & Suppliers", href: "#suppliers" },
  { label: "Logistics", href: "#logistics" },
  { label: "About Newvelion", href: "#about" },
];

export default function NewLanding() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white text-[#16294F]">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#16294F]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Newvelion home">
            <NewvelionBrand size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-[#16294F] transition hover:bg-[#F5F4EF] sm:inline-flex"
            >
              Sign In
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#16294F]/15 bg-white"
            >
              <span className="flex w-5 flex-col gap-1.5">
                <span className="h-0.5 w-full bg-[#16294F]" />
                <span className="h-0.5 w-full bg-[#16294F]" />
                <span className="h-0.5 w-3/4 bg-[#16294F]" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#16294F] text-white">
          <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-10">
            <div className="flex items-center justify-between">
              <NewvelionBrand size="sm" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20"
              >
                <span className="text-2xl font-light">×</span>
              </button>
            </div>

            <div className="mt-16 grid gap-12 md:grid-cols-2">
              <div>
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#C99A2E]">
                  Navigation
                </p>

                <nav className="flex flex-col">
                  {menuItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="border-b border-white/10 py-5 text-2xl font-semibold transition hover:text-[#C99A2E] sm:text-3xl"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div>
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#C99A2E]">
                  Account
                </p>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full border border-white/20 px-6 py-4 text-center font-semibold transition hover:bg-white hover:text-[#16294F]"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/apply/seller"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full bg-[#C99A2E] px-6 py-4 text-center font-semibold text-[#16294F]"
                  >
                    Start Selling
                  </Link>

                  <Link
                    href="/apply/producer"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full border border-white/20 px-6 py-4 text-center font-semibold transition hover:bg-white hover:text-[#16294F]"
                  >
                    Become a Producer
                  </Link>

                  <Link
                    href="/apply/supplier"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full border border-white/20 px-6 py-4 text-center font-semibold transition hover:bg-white hover:text-[#16294F]"
                  >
                    Become a Supplier
                  </Link>
                </div>

                <div className="mt-12 border-t border-white/10 pt-8">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#C99A2E]">
                    Support
                  </p>

                  <div className="space-y-3 text-sm text-white/70">
                    <a
                      href="mailto:daltonfelizarda66@gmail.com"
                      className="block hover:text-white"
                    >
                      Email Support
                    </a>
                    <a
                      href="https://instagram.com/dalton_fds"
                      target="_blank"
                      rel="noreferrer"
                      className="block hover:text-white"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://wa.me/27722958915"
                      target="_blank"
                      rel="noreferrer"
                      className="block hover:text-white"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden pt-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 pb-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#C99A2E]/30 bg-[#C99A2E]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6B1F]">
              Commerce infrastructure
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              The infrastructure behind modern commerce.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#16294F]/65 sm:text-xl">
              Newvelion connects sellers with producers and suppliers through
              one commerce infrastructure for products, orders, tracking,
              commissions and fulfillment.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/apply/seller"
                className="inline-flex items-center justify-center rounded-full bg-[#16294F] px-7 py-4 font-semibold text-white transition hover:bg-[#213b6b]"
              >
                Start Selling
              </Link>

              <Link
                href="/apply/producer"
                className="inline-flex items-center justify-center rounded-full border border-[#16294F]/20 px-7 py-4 font-semibold text-[#16294F] transition hover:bg-[#F5F4EF]"
              >
                Join as a Producer
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="border border-[#16294F]/10 bg-[#F7F7F4] p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-[#16294F]/10 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8570]">
                    Marketplace
                  </p>
                  <p className="mt-1 text-xl font-bold">Commerce network</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C99A2E] text-sm font-bold text-[#16294F]">
                  N
                </div>
              </div>

              <div className="grid gap-3 py-6 sm:grid-cols-2">
                {[
                  ["Products", "Discover & publish"],
                  ["Orders", "Track every sale"],
                  ["Commissions", "Manage earnings"],
                  ["Inventory", "Stay in control"],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="border border-[#16294F]/10 bg-white p-5"
                  >
                    <p className="font-bold">{title}</p>
                    <p className="mt-2 text-sm text-[#16294F]/55">{text}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#16294F]/10 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#16294F]/55">Commerce flow</span>
                  <span className="font-semibold text-[#8A6B1F]">
                    Connected
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden bg-[#16294F]/10">
                  <div className="h-full w-4/5 bg-[#C99A2E]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core platform */}
      <section id="about" className="border-y border-[#16294F]/10 bg-[#F7F7F4]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6B1F]">
              One infrastructure
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
              Everything connected around the transaction.
            </h2>
          </div>

          <div className="mt-14 grid gap-px border border-[#16294F]/10 bg-[#16294F]/10 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Marketplace",
                text: "Products, categories, offers and discovery in one place.",
              },
              {
                number: "02",
                title: "Affiliate flow",
                text: "Product links, referral codes and conversion tracking.",
              },
              {
                number: "03",
                title: "Operations",
                text: "Orders, inventory, COD, invoices and settlements.",
              },
              {
                number: "04",
                title: "Analytics",
                text: "Clicks, conversions, sales, commissions and performance.",
              },
            ].map((item) => (
              <div key={item.number} className="bg-white p-7 sm:p-8">
                <span className="text-sm font-bold text-[#C99A2E]">
                  {item.number}
                </span>
                <h3 className="mt-10 text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#16294F]/60">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sellers */}
      <section id="sellers">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6B1F]">
              For sellers
            </p>

            <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
              Turn products into a selling system.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#16294F]/60">
              Discover products, generate affiliate links, share product pages,
              track conversions and manage your sales from one platform.
            </p>

            <Link
              href="/apply/seller"
              className="mt-8 inline-flex rounded-full bg-[#16294F] px-7 py-4 font-semibold text-white"
            >
              Start Selling
            </Link>
          </div>

          <div className="border border-[#16294F]/10">
            {[
              "Marketplace discovery",
              "Affiliate links & referral codes",
              "Clicks & conversion tracking",
              "Orders & sales",
              "Commission management",
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center justify-between border-b border-[#16294F]/10 px-6 py-5 last:border-b-0"
              >
                <span className="font-semibold">{item}</span>
                <span className="text-sm text-[#C99A2E]">
                  0{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suppliers */}
      <section id="suppliers" className="bg-[#16294F] text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="order-2 lg:order-1">
            <div className="border border-white/15">
              {[
                "Create multiple products",
                "Set pricing and stock",
                "Connect with sellers",
                "Receive and manage orders",
                "Track commerce operations",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center justify-between border-b border-white/10 px-6 py-5 last:border-b-0"
                >
                  <span className="font-semibold">{item}</span>
                  <span className="text-sm text-[#C99A2E]">
                    0{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C99A2E]">
              For producers & suppliers
            </p>

            <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
              Put your products in front of sellers.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
              Build your catalog, define prices and stock, connect with
              sellers and manage the flow from product to order.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/apply/producer"
                className="inline-flex justify-center rounded-full bg-[#C99A2E] px-7 py-4 font-semibold text-[#16294F]"
              >
                Become a Producer
              </Link>

              <Link
                href="/apply/supplier"
                className="inline-flex justify-center rounded-full border border-white/20 px-7 py-4 font-semibold text-white"
              >
                Become a Supplier
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Logistics */}
      <section id="logistics">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A6B1F]">
                Logistics & operations
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
                Commerce does not stop at the checkout.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Inventory", "Stock visibility and product availability."],
                ["Orders", "Centralized order management."],
                ["COD", "Cash-on-delivery workflow support."],
                ["Invoices", "Transaction and invoice management."],
                ["Wallet", "Track balances and transactions."],
                ["Settlements", "Organize payment settlements."],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="border border-[#16294F]/10 p-6"
                >
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#16294F]/55">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[#16294F]/10 bg-[#F7F7F4]">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 lg:py-28">
          <NewvelionBrand size="md" className="justify-center" />

          <h2 className="mx-auto mt-10 max-w-3xl text-4xl font-bold tracking-[-0.05em] sm:text-6xl">
            Build your commerce flow with Newvelion.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#16294F]/60">
            Whether you sell products or supply them, Newvelion brings the
            infrastructure together.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/apply/seller"
              className="rounded-full bg-[#16294F] px-8 py-4 font-semibold text-white"
            >
              Start Selling
            </Link>
            <Link
              href="/apply/supplier"
              className="rounded-full border border-[#16294F]/20 bg-white px-8 py-4 font-semibold text-[#16294F]"
            >
              Join as a Supplier
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#16294F] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <NewvelionBrand size="sm" />
              <p className="mt-5 max-w-xs text-sm leading-6 text-white/50">
                Commerce infrastructure connecting sellers, producers and
                suppliers.
              </p>
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#C99A2E]">
                Platform
              </p>
              <div className="space-y-3 text-sm text-white/60">
                <a href="#sellers" className="block hover:text-white">
                  Sellers
                </a>
                <a href="#suppliers" className="block hover:text-white">
                  Producers & Suppliers
                </a>
                <a href="#logistics" className="block hover:text-white">
                  Logistics
                </a>
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#C99A2E]">
                Account
              </p>
              <div className="space-y-3 text-sm text-white/60">
                <Link href="/login" className="block hover:text-white">
                  Sign In
                </Link>
                <Link href="/apply/seller" className="block hover:text-white">
                  Start Selling
                </Link>
                <Link
                  href="/apply/producer"
                  className="block hover:text-white"
                >
                  Become a Producer
                </Link>
                <Link
                  href="/apply/supplier"
                  className="block hover:text-white"
                >
                  Become a Supplier
                </Link>
              </div>
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#C99A2E]">
                Support
              </p>
              <div className="space-y-3 text-sm text-white/60">
                <a
                  href="mailto:daltonfelizarda66@gmail.com"
                  className="block hover:text-white"
                >
                  Email
                </a>
                <a
                  href="https://instagram.com/dalton_fds"
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:text-white"
                >
                  Instagram
                </a>
                <a
                  href="https://wa.me/27722958915"
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:text-white"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/40">
            © {new Date().getFullYear()} Newvelion. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
