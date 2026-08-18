'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogIn, User, MessageCircle, ChevronRight, Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import VelionLogo from '@/components/ui/VelionLogo'
import { WelcomeFigure } from '@/components/ui/WelcomeFigure'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <div className="min-h-screen bg-secondary text-light-text font-sans selection:bg-primary/20">
      
      {/* ---------- Sidebar (Menu lateral esquerdo com suporte expansível) ---------- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/30 z-40"
            />
            <motion.div 
              initial={{ x: -320 }} 
              animate={{ x: 0 }} 
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 h-full w-[300px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-light-border">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-light-muted font-medium">VELION</p>
                  <p className="text-lg font-bold text-light-text">Menu</p>
                </div>
                <button onClick={toggleMenu} className="text-light-muted hover:text-light-text p-2 rounded-full hover:bg-secondary transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                
                {/* ACCOUNT SECTION */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-light-muted font-medium mb-3">ACCOUNT</p>
                  <div className="space-y-1">
                    <Link href="/login" onClick={toggleMenu} className="flex items-center justify-between py-3 px-3 -ml-3 hover:bg-secondary rounded-lg transition-colors text-light-text">
                      <div className="flex items-center gap-3">
                        <LogIn size={18} className="text-primary" />
                        <span className="text-sm font-medium">Login</span>
                      </div>
                      <ChevronRight size={16} className="text-light-muted" />
                    </Link>
                    <Link href="/register" onClick={toggleMenu} className="flex items-center justify-between py-3 px-3 -ml-3 hover:bg-secondary rounded-lg transition-colors text-light-text">
                      <div className="flex items-center gap-3">
                        <User size={18} className="text-primary" />
                        <span className="text-sm font-medium">Sign Up</span>
                      </div>
                      <ChevronRight size={16} className="text-light-muted" />
                    </Link>

                    {/* Support Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => setSupportOpen(!supportOpen)} 
                        className="w-full flex items-center justify-between py-3 px-3 -ml-3 hover:bg-secondary rounded-lg transition-colors text-light-text"
                      >
                        <div className="flex items-center gap-3">
                          <MessageCircle size={18} className="text-primary" />
                          <span className="text-sm font-medium">Support</span>
                        </div>
                        <motion.div animate={{ rotate: supportOpen ? 90 : 0 }}>
                          <ChevronRight size={16} className="text-light-muted" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {supportOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: "auto", opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4 border-l-2 border-light-border ml-1 mt-1 space-y-2"
                          >
                            <a href="mailto:daltonfelizarda66@gmail.com" className="flex items-center gap-3 py-2 px-3 text-sm text-light-muted hover:text-primary transition-colors rounded-lg">
                              <Mail size={16} /> Email
                            </a>
                            <a href="https://wa.me/27722958915" target="_blank" rel="noreferrer" className="flex items-center gap-3 py-2 px-3 text-sm text-light-muted hover:text-primary transition-colors rounded-lg">
                              <MessageCircle size={16} /> WhatsApp
                            </a>
                            <a href="tel:+27722958915" className="flex items-center gap-3 py-2 px-3 text-sm text-light-muted hover:text-primary transition-colors rounded-lg">
                              <Phone size={16} /> Call
                            </a>
                            <a href="https://instagram.com/dalton_fds" target="_blank" rel="noreferrer" className="flex items-center gap-3 py-2 px-3 text-sm text-light-muted hover:text-primary transition-colors rounded-lg">
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-current"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                              Instagram
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* NAVIGATION SECTION */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-light-muted font-medium mb-3">NAVIGATION</p>
                  <div className="space-y-1">
                    <a href="#how" onClick={toggleMenu} className="flex items-center justify-between py-3 px-3 -ml-3 hover:bg-secondary rounded-lg transition-colors text-light-text">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">How it works</span>
                      </div>
                      <ChevronRight size={16} className="text-light-muted" />
                    </a>
                  </div>
                </div>

              </div>

              <div className="px-6 py-6 border-t border-light-border">
                <p className="text-[11px] text-light-muted">The climb starts here.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---------- Header ---------- */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center px-6 py-4 sm:px-10 bg-secondary/80 backdrop-blur-sm border-b border-light-border/50">
        <div className="flex items-center gap-4 w-full">
          <button onClick={toggleMenu} className="text-light-muted hover:text-light-text transition-colors p-1">
            <Menu size={24} />
          </button>
          <VelionLogo size={28} />
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center pt-24 pb-12">
        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mb-4 flex flex-col items-center"
          >
            <VelionLogo size={72} withWordmark={false} />
            <span className="mt-3 text-[10px] uppercase tracking-[0.2em] text-primary/80 font-medium">
              Performance Affiliate Platform
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-balance mt-3 max-w-2xl text-3xl sm:text-5xl font-bold text-light-text tracking-tight"
          >
            The climb starts here.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-balance mt-4 max-w-lg text-sm sm:text-base text-light-muted leading-relaxed"
          >
            Sell health and wellness products across Mozambique, South Africa and Angola.
            Commission calculated automatically, fast payouts, no fine print.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row w-full max-w-sm"
          >
            <Link
              href="/register"
              className="w-full inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="w-full inline-flex h-12 items-center justify-center rounded-full border border-light-border px-6 text-sm font-medium text-light-text bg-white transition-all hover:bg-secondary hover:scale-105"
            >
              Sign in
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="relative mt-12 scale-90"
          >
            <WelcomeFigure />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-light-muted">
              Welcome to Velion
            </span>
          </motion.div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="relative px-6 py-20 sm:px-10 bg-white">
        <div className="mx-auto max-w-5xl">
          <span className="text-[10px] uppercase tracking-[0.15em] text-primary/80 font-medium">Process</span>
          <h2 className="text-balance mt-3 max-w-xl text-2xl sm:text-3xl font-bold text-light-text">
            Three steps to your commission.
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-light-card border border-light-border rounded-xl p-6 hover:shadow-sm transition-shadow"
              >
                <span className="text-sm font-mono text-primary">{step.n}</span>
                <h3 className="mt-2 text-base font-semibold text-light-text">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-light-muted">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Corridor ---------- */}
      <section className="relative px-6 py-20 sm:px-10 bg-secondary">
        <div className="mx-auto max-w-5xl">
          <span className="text-[10px] uppercase tracking-[0.15em] text-primary/80 font-medium">Coverage</span>
          <h2 className="text-balance mt-3 max-w-xl text-2xl sm:text-3xl font-bold text-light-text">
            Built for the Mozambique — South Africa corridor.
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {CORRIDOR.map((c) => (
              <div key={c.name} className="bg-light-card border border-light-border rounded-xl p-6">
                <span className="text-3xl">{c.flag}</span>
                <h3 className="mt-2 font-medium text-light-text">{c.name}</h3>
                <p className="mt-1 text-sm text-light-muted">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="relative overflow-hidden px-6 py-20 text-center sm:px-10 bg-white">
        <div className="relative z-10 mx-auto max-w-xl">
          <h2 className="text-balance text-2xl sm:text-3xl font-bold text-light-text">
            Ready to start climbing?
          </h2>
          <p className="mt-3 text-sm text-light-muted">Create your account in under a minute.</p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-light-border px-6 py-8 sm:px-10 bg-secondary">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <VelionLogo size={20} />
            <p className="text-[11px] text-light-muted">Performance marketplace for health and wellness.</p>
          </div>

          <div className="flex flex-col items-center gap-1 text-[11px] text-light-muted sm:items-end">
            <span className="font-medium text-light-text">Contact</span>
            <a href="mailto:daltonfelizarda66@gmail.com" className="hover:text-primary transition-colors">
              daltonfelizarda66@gmail.com
            </a>
            <a href="https://wa.me/27722958915" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              WhatsApp +27 72 295 8915
            </a>
            <a href="https://instagram.com/dalton_fds" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              @dalton_fds
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-[10px] text-light-muted/60">
          © {new Date().getFullYear()} Velion. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
