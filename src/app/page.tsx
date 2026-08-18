import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-light-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-light-border shadow-lg p-8 flex flex-col items-center text-center">
        
        <div className="mb-6">
          <VelionLogo className="w-28 h-28" />
        </div>

        <h1 className="text-3xl font-bold text-light-text mb-2 font-display tracking-tight">
          The engine behind your online sales.
        </h1>
        
        <p className="text-light-textMuted text-base mb-4 max-w-sm">
          Marketplace. Warehousing. Fulfillment. Logistics. Settlements. 
          Velion gives you everything you need to scale your e-commerce business, 
          from producer to customer.
        </p>

        <div className="w-full max-w-xs space-y-2 mb-6 text-sm text-light-textMuted">
          <div className="flex items-center gap-2 justify-start border-b border-light-border pb-1">
            <span className="text-primary">✅</span> Integrated Fulfillment
          </div>
          <div className="flex items-center gap-2 justify-start border-b border-light-border pb-1">
            <span className="text-primary">💰</span> Automated Finance (5% + R10 settlement)
          </div>
          <div className="flex items-center gap-2 justify-start border-b border-light-border pb-1">
            <span className="text-primary">🔗</span> Supplier Network & Store Integrations
          </div>
        </div>

        <div className="w-full space-y-3 flex flex-col mt-2">
          <Link href="/register">
            <button className="w-full py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg shadow-primary/25">
              Get Started
            </button>
          </Link>
          <Link href="/login">
            <button className="w-full py-3 bg-white text-dark border border-light-border rounded-full font-medium hover:bg-light-bg transition-all transform hover:scale-105">
              Sign In
            </button>
          </Link>
        </div>
        
        <p className="mt-8 text-xs text-light-textMuted">
          &copy; 2026 Velion. All rights reserved.
        </p>
      </div>
    </div>
  );
}
