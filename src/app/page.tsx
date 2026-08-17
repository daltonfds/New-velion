"use client";

import { useEffect, useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-sm p-8 flex flex-col items-center text-center">
        <div className="mb-6">
          <VelionLogo className="w-32 h-32" />
        </div>
        <h1 className="text-2xl font-bold text-dark mb-2 font-display">The climb starts here.</h1>
        <p className="text-muted text-sm mb-8 max-w-xs">Marketplace, warehousing, and fulfillment for your business.</p>
        <div className="w-full space-y-3">
          <Link href="/login">
            <button className="w-full py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">Sign In</button>
          </Link>
          <Link href="/register">
            <button className="w-full py-3 bg-white text-dark border border-border rounded-full font-medium hover:bg-secondary transition-colors">Create Account</button>
          </Link>
        </div>
        <p className="mt-8 text-xs text-muted">&copy; 2026 Velion. All rights reserved.</p>
      </div>
    </div>
  );
}
