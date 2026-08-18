import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-lg p-8 flex flex-col items-center text-center">
        
        <div className="mb-6">
          <VelionLogo className="w-28 h-28" />
        </div>

        <p className="text-xs font-semibold tracking-widest text-muted uppercase mb-4">
          Performance Affiliate Platform
        </p>

        <h1 className="text-3xl font-bold text-dark mb-4 font-display tracking-tight">
          The climb starts here.
        </h1>

        <p className="text-muted text-base leading-relaxed mb-8">
          Sell health and wellness products across Mozambique, South Africa and Angola. Commission calculated automatically, fast payouts, no fine print.
        </p>

        <div className="w-full flex flex-col gap-3">
          <Link href="/register">
            <button className="w-full py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all transform hover:scale-[1.02] shadow-sm">
              Create account
            </button>
          </Link>
          <Link href="/login">
            <button className="w-full py-3 bg-white text-dark border border-border rounded-full font-medium hover:bg-secondary transition-all transform hover:scale-[1.02]">
              Sign in
            </button>
          </Link>
        </div>
        
        <p className="mt-8 text-xs text-muted">
          &copy; 2026 Velion. All rights reserved.
        </p>
      </div>
    </div>
  );
}
