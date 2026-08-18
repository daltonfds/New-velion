"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Box, Truck, Shield, Users, Menu, X, Mail, Phone, InstagramIcon } from "lucide-react";
import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleSupport = () => setSupportOpen(!supportOpen);

  return (
    <div className="min-h-screen bg-secondary text-light-text font-sans selection:bg-primary/30">
      
      {/* Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-light-border relative z-50">
        <div className="flex items-center gap-3">
          <VelionLogo className="w-8 h-8" />
          <span className="font-display text-xl font-semibold text-light-text">Velion</span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#how-it-works" className="text-light-muted hover:text-light-text transition-colors">How it works</a>
          <Link href="/login" className="text-light-muted hover:text-light-text transition-colors">Login</Link>
          
          <div className="relative">
            <button onClick={toggleSupport} className="text-light-muted hover:text-light-text transition-colors flex items-center gap-1">
              Support
            </button>
            <AnimatePresence>
              {supportOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-light-card border border-light-border rounded-xl shadow-lg p-4 space-y-3 text-sm z-50"
                >
                  <p className="font-medium text-light-text mb-1">Contact Support</p>
                  <a href="mailto:daltonfelizarda66@gmail.com" className="flex items-center gap-3 text-light-muted hover:text-primary transition-colors">
                    <Mail size={16} /> daltonfelizarda66@gmail.com
                  </a>
                  <a href="https://wa.me/27722958915" target="_blank" className="flex items-center gap-3 text-light-muted hover:text-primary transition-colors">
                    <Phone size={16} /> +27722958915
                  </a>
                  <a href="https://instagram.com/dalton_fds" target="_blank" className="flex items-center gap-3 text-light-muted hover:text-primary transition-colors">
                    <InstagramIcon size={16} /> @dalton_fds
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/register">
            <button className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-primary/90 transition-transform hover:scale-105 shadow-lg shadow-primary/20">
              Sign Up
            </button>
          </Link>
        </div>

        {/* Mobile Navigation Toggle */}
        <button onClick={toggleMobileMenu} className="md:hidden p-2 text-light-text hover:bg-light-border rounded-lg transition-colors">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation Menu (Slide down) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 w-full bg-light-card border-b border-light-border shadow-lg overflow-hidden md:hidden z-50"
            >
              <div className="flex flex-col p-6 space-y-4 text-sm">
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-light-muted hover:text-light-text transition-colors">How it works</a>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-light-muted hover:text-light-text transition-colors">Login</Link>
                
                <div className="border-t border-light-border pt-4">
                  <p className="font-medium text-light-text mb-3">Support</p>
                  <div className="space-y-2">
                    <a href="mailto:daltonfelizarda66@gmail.com" className="flex items-center gap-3 text-light-muted hover:text-primary transition-colors">
                      <Mail size={16} /> daltonfelizarda66@gmail.com
                    </a>
                    <a href="https://wa.me/27722958915" target="_blank" className="flex items-center gap-3 text-light-muted hover:text-primary transition-colors">
                      <Phone size={16} /> +27722958915
                    </a>
                    <a href="https://instagram.com/dalton_fds" target="_blank" className="flex items-center gap-3 text-light-muted hover:text-primary transition-colors">
                      <InstagramIcon size={16} /> @dalton_fds
                    </a>
                  </div>
                </div>

                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full bg-primary text-white py-3 rounded-full font-medium hover:bg-primary/90 transition-transform hover:scale-105 shadow-lg shadow-primary/20">
                    Sign Up
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-32">

        {/* 1. Hero Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-3xl mx-auto space-y-6">
          <div className="flex justify-center mb-4">
            <VelionLogo className="w-28 h-28" />
          </div>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase font-display">
            Performance Marketplace
          </p>
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight leading-tight text-light-text">
            The climb starts here.
          </h1>
          <p className="text-lg md:text-xl text-light-muted max-w-2xl mx-auto leading-relaxed">
            Connect producers with sellers. Velion gives you everything you need to scale your business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <button className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full font-medium hover:bg-primary/90 transition-transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-2">
                Start Selling <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/register?role=producer">
              <button className="w-full sm:w-auto bg-light-card border border-light-border text-light-text px-8 py-4 rounded-full font-medium hover:bg-secondary transition-colors flex items-center gap-2">
                Become a Producer
              </button>
            </Link>
          </div>
        </motion.section>

        {/* 2. The Problem */}
        <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-12 bg-light-card border border-light-border rounded-2xl p-8 md:p-12">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">The Producer</h3>
            <p className="text-light-muted leading-relaxed text-lg">Producers have great products, but struggle to find reliable sellers to distribute them.</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-light-muted"><CheckCircle size={16} className="text-primary" /> Limited market reach</li>
              <li className="flex items-center gap-2 text-sm text-light-muted"><CheckCircle size={16} className="text-primary" /> Complex logistics</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary">The Seller</h3>
            <p className="text-light-muted leading-relaxed text-lg">Sellers want to sell, but they don't know what to sell or where to find quality, reliable inventory.</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-light-muted"><CheckCircle size={16} className="text-primary" /> Inventory management risk</li>
              <li className="flex items-center gap-2 text-sm text-light-muted"><CheckCircle size={16} className="text-primary" /> Difficult supplier discovery</li>
            </ul>
          </div>
        </motion.section>

        {/* 3. How it Works (Anchor linked from menu) */}
        <motion.section id="how-it-works" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center space-y-12">
          <h2 className="text-3xl font-display font-bold text-light-text">How it works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="bg-light-card border border-light-border rounded-xl p-6 hover:border-primary/30 transition-colors"><h4 className="font-bold text-primary text-sm mb-1">01. Producers</h4><p className="text-light-muted text-sm">List products and set your wholesale price.</p></div>
            <div className="bg-light-card border border-light-border rounded-xl p-6 hover:border-primary/30 transition-colors"><h4 className="font-bold text-primary text-sm mb-1">02. Suppliers</h4><p className="text-light-muted text-sm">Provide inventory and logistics to the ecosystem.</p></div>
            <div className="bg-light-card border border-light-border rounded-xl p-6 hover:border-primary/30 transition-colors"><h4 className="font-bold text-primary text-sm mb-1">03. Sellers</h4><p className="text-light-muted text-sm">Choose products and sell them to customers.</p></div>
            <div className="bg-light-card border border-light-border rounded-xl p-6 hover:border-primary/30 transition-colors"><h4 className="font-bold text-primary text-sm mb-1">04. Velion</h4><p className="text-light-muted text-sm">Coordinates the ecosystem, from payment to tracking.</p></div>
          </div>
        </motion.section>

        {/* 4 & 5. For Producers & Sellers */}
        <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-12">
          <div className="bg-light-card border border-light-border rounded-2xl p-8 space-y-4">
            <h2 className="text-2xl font-display font-bold text-primary">For Producers</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3"><CheckCircle size={18} className="text-primary" /><span className="text-light-muted text-sm">Publish products instantly</span></li>
              <li className="flex items-center gap-3"><CheckCircle size={18} className="text-primary" /><span className="text-light-muted text-sm">Define your own prices and commissions</span></li>
              <li className="flex items-center gap-3"><CheckCircle size={18} className="text-primary" /><span className="text-light-muted text-sm">Find and connect with reliable sellers</span></li>
              <li className="flex items-center gap-3"><CheckCircle size={18} className="text-primary" /><span className="text-light-muted text-sm">Track all your orders and expand to new markets</span></li>
            </ul>
          </div>
          <div className="bg-light-card border border-light-border rounded-2xl p-8 space-y-4">
            <h2 className="text-2xl font-display font-bold text-primary">For Sellers</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3"><CheckCircle size={18} className="text-primary" /><span className="text-light-muted text-sm">Discover and choose profitable products</span></li>
              <li className="flex items-center gap-3"><CheckCircle size={18} className="text-primary" /><span className="text-light-muted text-sm">Generate your own margin without producing anything</span></li>
              <li className="flex items-center gap-3"><CheckCircle size={18} className="text-primary" /><span className="text-light-muted text-sm">Manage all your earnings in one dashboard</span></li>
              <li className="flex items-center gap-3"><CheckCircle size={18} className="text-primary" /><span className="text-light-muted text-sm">Track orders and keep your customers happy</span></li>
            </ul>
          </div>
        </motion.section>

        {/* 6. Marketplace Preview */}
        <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="space-y-12 text-center">
          <h2 className="text-3xl font-display font-bold text-light-text">Explore the Marketplace</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-light-card border border-light-border rounded-xl p-6 flex flex-col gap-2"><p className="text-xs text-primary font-bold uppercase">Category</p><h3 className="font-bold text-lg text-light-text">Health & Wellness</h3><p className="text-xs text-light-muted">240 products available</p></div>
            <div className="bg-light-card border border-light-border rounded-xl p-6 flex flex-col gap-2"><p className="text-xs text-primary font-bold uppercase">Best Seller</p><h3 className="font-bold text-lg text-light-text">Premium T-Shirt</h3><p className="text-xs text-light-muted">R 150.00</p></div>
            <div className="bg-light-card border border-light-border rounded-xl p-6 flex flex-col gap-2"><p className="text-xs text-primary font-bold uppercase">New Arrival</p><h3 className="font-bold text-lg text-light-text">Organic Skincare</h3><p className="text-xs text-light-muted">R 220.00</p></div>
          </div>
        </motion.section>

        {/* 7 & 8. Why Velion & Trust */}
        <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="bg-light-card border border-light-border rounded-2xl p-8 md:p-12 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-light-text">Why Velion</h2>
            <p className="text-light-muted leading-relaxed">One platform connecting producers, suppliers, sellers, and customers. Centralized operations for seamless international expansion.</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2"><Box size={20} className="text-primary" /><span className="text-sm font-medium text-light-text">Product Listing</span></div>
              <div className="flex items-center gap-2"><Truck size={20} className="text-primary" /><span className="text-sm font-medium text-light-text">Fast Logistics</span></div>
              <div className="flex items-center gap-2"><Shield size={20} className="text-primary" /><span className="text-sm font-medium text-light-text">Secure Payments</span></div>
              <div className="flex items-center gap-2"><Users size={20} className="text-primary" /><span className="text-sm font-medium text-light-text">Verified Users</span></div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-light-text">Trusted Ecosystem</h2>
            <ul className="space-y-2 text-sm text-light-muted">
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary" /> Real time tracking for every order</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary" /> Dedicated support system</li>
              <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary" /> Multi currency support</li>
            </ul>
          </div>
        </motion.section>

        {/* 9. Final CTA */}
        <motion.section initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center space-y-6 py-16 border-t border-light-border">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-light-text">Your next opportunity is already here.</h2>
          <p className="text-light-muted text-lg max-w-xl mx-auto">Join Velion today and start connecting producers with sellers.</p>
          <Link href="/register">
            <button className="bg-primary text-white px-10 py-4 rounded-full font-medium hover:bg-primary/90 transition-transform hover:scale-105 shadow-lg shadow-primary/30">
              Join Velion
            </button>
          </Link>
        </motion.section>

      </main>

      {/* 10. Footer */}
      <footer className="border-t border-light-border bg-light-card py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="space-y-3">
            <span className="font-display font-semibold text-base text-light-text">Velion</span>
            <p className="text-light-muted">About</p>
            <p className="text-light-muted">Producers</p>
            <p className="text-light-muted">Sellers</p>
            <p className="text-light-muted">Suppliers</p>
          </div>
          <div className="space-y-3">
            <span className="font-display font-semibold text-base text-light-text">Support</span>
            <p className="text-light-muted">Help Center</p>
            <p className="text-light-muted">Terms of Service</p>
            <p className="text-light-muted">Privacy Policy</p>
            <p className="text-light-muted">Contact</p>
          </div>
          <div className="space-y-3 col-span-2 md:col-span-2 md:text-right">
            <p className="text-light-muted text-xs leading-relaxed">Performance marketplace for health and wellness.</p>
            <p className="text-light-muted text-xs">&copy; 2026 Velion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
