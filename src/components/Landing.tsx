'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogIn, User, MessageCircle, ChevronRight, Mail, Phone, Package, Warehouse, Truck } from 'lucide-react'
import { useState } from 'react'
import VelionLogo from '@/components/ui/VelionLogo'

const SELLER_FEATURES = [
  'Product marketplace',
  'Inventory availability',
  'Warehousing',
  'Fulfillment',
  'Delivery & Tracking',
  'Cash on Delivery',
  'Financial settlements',
  'Returns & disputes',
]

const SUPPLIER_FEATURES = [
  'Product catalog',
  'Inventory management',
  'Batch & expiry tracking',
  'Warehousing & Fulfillment',
  'Sales settlements',
  'Supplier wallet',
  'Supplier Score',
  'Verified Supplier',
]

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [activeCard, setActiveCard] = useState<string | null>(null)

  const closeMenu = () => {
    setMenuOpen(false)
    setSupportOpen(false)
  }

  const scrollTo = (id: string) => {
    closeMenu()
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-white text-light-text font-sans">

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            />

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 z-50 flex h-full w-[300px] flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-light-border px-6 py-5">
                <VelionLogo size={30} withWordmark />
                <button
                  onClick={closeMenu}
                  className="rounded-xl p-2 text-light-text transition hover:bg-violet-50"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-light-muted">
                  ACCOUNT
                </p>

                <div className="space-y-1">
                  <Link href="/login" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-violet-50">
                    <LogIn size={18} className="text-blue-600" />
                    Sign In
                  </Link>

                  <Link href="/apply/seller" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-violet-50">
                    <User size={18} className="text-blue-600" />
                    Start Selling
                  </Link>

                  <Link href="/apply/producer" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-violet-50">
                    <Package size={18} className="text-blue-600" />
                    Become a Producer
                  </Link>

                  <Link href="/apply/supplier" onClick={closeMenu} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-violet-50">
                    <Warehouse size={18} className="text-blue-600" />
                    Become a Supplier
                  </Link>
                </div>

                <p className="mb-3 mt-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-light-muted">
                  NAVIGATION
                </p>

                <div className="space-y-1">
                  <button onClick={() => scrollTo('sellers')} className="flex w-full justify-between rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-violet-50">
                    For Sellers
                    <ChevronRight size={16} />
                  </button>

                  <button onClick={() => scrollTo('suppliers')} className="flex w-full justify-between rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-violet-50">
                    For Producers & Suppliers
                    <ChevronRight size={16} />
                  </button>

                  <button onClick={() => scrollTo('logistics')} className="flex w-full justify-between rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-violet-50">
                    Logistics
                    <ChevronRight size={16} />
                  </button>

                  <button onClick={() => scrollTo('about')} className="flex w-full justify-between rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-violet-50">
                    About Velion
                    <ChevronRight size={16} />
                  </button>
                </div>

                <p className="mb-3 mt-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-light-muted">
                  SUPPORT
                </p>

                <button
                  onClick={() => setSupportOpen(!supportOpen)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-violet-50"
                >
                  <span className="flex items-center gap-3">
                    <MessageCircle size={18} className="text-blue-600" />
                    Support
                  </span>
                  <ChevronRight size={16} />
                </button>

                <AnimatePresence>
                  {supportOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-4"
                    >
                      <a href="mailto:daltonfelizarda66@gmail.com" className="flex items-center gap-3 py-2 text-sm text-light-muted">
                        <Mail size={16} />
                        daltonfelizarda66@gmail.com
                      </a>
                      <a href="https://instagram.com/dalton_fds" target="_blank" rel="noreferrer" className="flex items-center gap-3 py-2 text-sm text-light-muted">
                        <MessageCircle size={16} />
                        @dalton_fds
                      </a>
                      <a href="https://wa.me/27722958915" target="_blank" rel="noreferrer" className="flex items-center gap-3 py-2 text-sm text-light-muted">
                        <MessageCircle size={16} />
                        WhatsApp
                      </a>
                      <a href="tel:+27722958915" className="flex items-center gap-3 py-2 text-sm text-light-muted">
                        <Phone size={16} />
                        +27 72 295 8915
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-light-border px-6 py-6">
                <p className="text-[11px] text-light-muted">
                  The climb starts here.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-light-border/70 bg-white/90 backdrop-blur-md">
        <div className="flex h-full items-center px-4 sm:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-light-text transition hover:bg-violet-50"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <div className="ml-2">
            <VelionLogo size={30} withWordmark />
          </div>

          <Link
            href="/login"
            className="ml-auto inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-20 pt-32 sm:px-10 sm:pb-28 sm:pt-40">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <VelionLogo size={74} withWordmark />

            <span className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">
              Commerce Infrastructure
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mx-auto mt-8 max-w-3xl text-balance text-4xl font-bold tracking-tight text-light-text sm:text-6xl"
          >
            The climb starts here.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-light-muted sm:text-lg"
          >
            Velion connects producers and suppliers with sellers, providing
            products, warehousing, logistics, payments and COD through one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/apply/seller"
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-7 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Start Selling
            </Link>

            <Link
              href="/apply/supplier"
              className="inline-flex h-12 items-center justify-center rounded-full border border-violet-200 bg-white px-7 text-sm font-semibold text-light-text transition hover:-translate-y-0.5 hover:bg-violet-50"
            >
              Become a Supplier
            </Link>
          </motion.div>
        </div>
      </section>

      <section id="sellers" className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            className={`rounded-2xl border border-violet-200 bg-white p-7 shadow-sm transition-all duration-300 sm:p-10 ${
              activeCard === 'seller'
                ? 'border-violet-400 shadow-lg shadow-violet-100'
                : ''
            }`}
            onClick={() =>
              setActiveCard(activeCard === 'seller' ? null : 'seller')
            }
          >
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                For Sellers
              </span>

              <h2 className="mt-3 text-3xl font-bold text-light-text">
                Sell without building the entire operation.
              </h2>

              <p className="mt-3 text-base text-light-muted">
                Velion handles the infrastructure.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SELLER_FEATURES.map((feature) => (
                <motion.div
                  key={feature}
                  whileHover={{ y: -3 }}
                  className="rounded-xl border border-violet-100 bg-violet-50/40 p-4"
                >
                  <div className="text-lg font-bold text-blue-600">✓</div>

                  <p className="mt-2 text-sm font-medium text-light-text">
                    {feature}
                  </p>
                </motion.div>
              ))}
            </div>

            <Link
              href="/apply/seller"
              onClick={(e) => e.stopPropagation()}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Start Selling
            </Link>
          </motion.div>
        </div>
      </section>

      <section id="suppliers" className="bg-violet-50/40 px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            className={`rounded-2xl border border-violet-200 bg-white p-7 shadow-sm transition-all duration-300 sm:p-10 ${
              activeCard === 'supplier'
                ? 'border-violet-400 shadow-lg shadow-violet-100'
                : ''
            }`}
            onClick={() =>
              setActiveCard(activeCard === 'supplier' ? null : 'supplier')
            }
          >
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                For Producers & Suppliers
              </span>

              <h2 className="mt-3 text-3xl font-bold text-light-text">
                Your products. More sellers. More reach.
              </h2>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SUPPLIER_FEATURES.map((feature) => (
                <motion.div
                  key={feature}
                  whileHover={{ y: -3 }}
                  className="rounded-xl border border-violet-100 bg-white p-4"
                >
                  <div className="text-lg font-bold text-blue-600">✓</div>

                  <p className="mt-2 text-sm font-medium text-light-text">
                    {feature}
                  </p>
                </motion.div>
              ))}
            </div>

            <Link
              href="/apply/supplier"
              onClick={(e) => e.stopPropagation()}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Become a Supplier
            </Link>
          </motion.div>
        </div>
      </section>

      <section id="logistics" className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-violet-200 bg-white p-7 text-center shadow-sm sm:p-10"
          >
            <Truck className="mx-auto text-blue-600" size={34} />

            <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
              Logistics
            </span>

            <h2 className="mt-3 text-3xl font-bold text-light-text">
              From warehouse to customer&apos;s door.
            </h2>

            <div className="mt-8 flex flex-col items-center justify-center gap-2 text-sm font-medium text-light-text sm:flex-row sm:gap-4">
              <span>Warehouse</span>
              <ChevronRight className="hidden text-violet-400 sm:block" size={18} />
              <span>Fulfillment</span>
              <ChevronRight className="hidden text-violet-400 sm:block" size={18} />
              <span>Carrier</span>
              <ChevronRight className="hidden text-violet-400 sm:block" size={18} />
              <span>Tracking</span>
              <ChevronRight className="hidden text-violet-400 sm:block" size={18} />
              <span>Customer</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="bg-violet-50/40 px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-violet-200 bg-white p-8 text-center shadow-sm sm:p-12"
          >
            <VelionLogo size={52} withWordmark />

            <span className="mt-6 block text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
              About Velion
            </span>

            <h2 className="mt-3 text-3xl font-bold text-light-text sm:text-4xl">
              The infrastructure behind your next business.
            </h2>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24 text-center sm:px-10">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-light-text sm:text-4xl">
            Your next opportunity is already here.
          </h2>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/apply/seller"
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-7 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Start Selling
            </Link>

            <Link
              href="/apply/supplier"
              className="inline-flex h-12 items-center justify-center rounded-full border border-violet-200 bg-white px-7 text-sm font-semibold text-light-text transition hover:-translate-y-0.5 hover:bg-violet-50"
            >
              Become a Supplier
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-light-border bg-white px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <VelionLogo size={24} withWordmark />
            <p className="text-xs text-light-muted">
              Commerce infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-xs text-light-muted">
            <a href="mailto:daltonfelizarda66@gmail.com" className="transition hover:text-blue-600">
              daltonfelizarda66@gmail.com
            </a>

            <a
              href="https://instagram.com/dalton_fds"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-blue-600"
            >
              Instagram: @dalton_fds
            </a>

            <a
              href="https://wa.me/27722958915"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-blue-600"
            >
              WhatsApp: +27 72 295 8915
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-light-muted/70">
          The climb starts here.
        </p>
      </footer>
    </div>
  )
}
