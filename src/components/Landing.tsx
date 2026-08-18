'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { VelionLogo } from '@/components/ui/VelionLogo'
import { AscentParticles } from '@/components/ui/AscentParticles'
import { WelcomeFigure } from '@/components/ui/WelcomeFigure'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Choose a product',
    body: 'Browse the catalog and choose what fits your audience.',
  },
  {
    n: '02',
    title: 'Log the order',
    body: 'Fill in the customer\'s details and attach proof of payment — it goes straight to approval.',
  },
  {
    n: '03',
    title: 'Get paid automatically',
    body: 'Profit is calculated instantly and made available to withdraw.',
  },
]

const CORRIDOR = [
  { flag: '🇲🇿', name: 'Mozambique', detail: 'Mpesa, Emola or bank transfer' },
  { flag: '🇿🇦', name: 'South Africa', detail: 'Bank deposit or EFT' },
  { flag: '🇦🇴', name: 'Angola', detail: 'Bank transfer' },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-ascent">
      {/* ---------- Header ---------- */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-4 sm:px-10">
        <VelionLogo size={32} />
        <div className="flex items-center gap-3">
          <a href="#how" className="hidden text-sm text-mist transition-colors hover:text-pearl sm:block">
            How it works
          </a>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        <AscentParticles className="pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mb-2 flex flex-col items-center"
          >
            <VelionLogo size={72} withWordmark={false} />
            <span className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-gold/80">
              Performance Affiliate Platform
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-balance mt-4 max-w-2xl text-4xl font-semibold text-pearl sm:text-6xl"
          >
            The climb starts here.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-balance mt-5 max-w-lg text-base text-mist sm:text-lg"
          >
            Sell health and wellness products across Mozambique, South Africa and Angola.
            Commission calculated automatically, fast payouts, no fine print.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link
              href="/register"
              className="inline-flex h-14 items-center justify-center rounded-full bg-gold px-8 text-base font-medium text-midnight shadow-[0_0_0_1px_rgba(212,175,55,0.4)] transition-all hover:bg-gold-400 hover:shadow-[0_0_24px_rgba(212,175,55,0.45)]"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 px-8 text-base font-medium text-pearl transition-colors hover:border-gold/60 hover:text-gold"
            >
              Sign in
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="relative mt-10"
          >
            <WelcomeFigure />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] text-mist">
              Welcome to Velion
            </span>
          </motion.div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="relative px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold/80">Process</span>
          <h2 className="text-balance mt-3 max-w-xl text-3xl font-semibold text-pearl sm:text-4xl">
            Three steps to your commission.
          </h2>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <span className="font-mono text-sm text-gold">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-pearl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Corridor / coverage ---------- */}
      <section className="relative px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold/80">Coverage</span>
          <h2 className="text-balance mt-3 max-w-xl text-3xl font-semibold text-pearl sm:text-4xl">
            Built for the Mozambique — South Africa corridor.
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {CORRIDOR.map((c) => (
              <div key={c.name} className="glass rounded-2xl p-6">
                <span className="text-3xl">{c.flag}</span>
                <h3 className="mt-3 font-semibold text-pearl">{c.name}</h3>
                <p className="mt-1 text-sm text-mist">{c.detail}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 font-mono text-sm text-gold/90">Withdrawals processed within 60 minutes</p>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="relative overflow-hidden px-6 py-28 text-center sm:px-10">
        <div className="pointer-events-none absolute inset-0 bg-gold-glow" />
        <div className="relative z-10 mx-auto max-w-xl">
          <h2 className="text-balance text-3xl font-semibold text-pearl sm:text-4xl">
            Ready to start climbing?
          </h2>
          <p className="mt-3 text-mist">Create your account in under a minute.</p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/register"
              className="inline-flex h-14 items-center justify-center rounded-full bg-gold px-8 text-base font-medium text-midnight shadow-[0_0_0_1px_rgba(212,175,55,0.4)] transition-all hover:bg-gold-400 hover:shadow-[0_0_24px_rgba(212,175,55,0.45)]"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-white/10 px-6 py-10 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <VelionLogo size={24} />
            <p className="text-xs text-mist">Performance affiliate marketing for health and wellness.</p>
          </div>

          <div className="flex flex-col items-center gap-1 text-xs text-mist sm:items-end">
            <span className="font-medium text-pearl">Contact</span>
            <a href="mailto:daltonfelizarda66@gmail.com" className="hover:text-gold">
              daltonfelizarda66@gmail.com
            </a>
            <a href="https://wa.me/27722958915" target="_blank" rel="noreferrer" className="hover:text-gold">
              WhatsApp +27 72 295 8915
            </a>
            <a href="https://instagram.com/dalton_fds" target="_blank" rel="noreferrer" className="hover:text-gold">
              @dalton_fds
            </a>
          </div>
        </div>
        <p className="mt-8 text-center font-mono text-[11px] text-mist/70">
          © {new Date().getFullYear()} Velion. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
