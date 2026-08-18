import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-sm p-8 flex flex-col items-center text-center">
        <div className="mb-6">
          <VelionLogo className="w-32 h-32" />
        </div>
        <h1 className="text-2xl font-bold text-dark mb-2 font-display">The climb starts here.</h1>
        <p className="text-muted text-sm mb-2 max-w-xs">Marketplace, warehousing, and fulfillment for your business.</p>
        <p className="text-primary/80 text-xs mb-8 max-w-xs font-medium italic">"From producer to customer, we handle the rest."</p>
        
        <div className="w-full space-y-3 flex flex-col">
          <Link href="/login">
            <button className="w-full py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg shadow-primary/25">
              Sign In
            </button>
          </Link>
          <Link href="/register">
            <button className="w-full py-3 bg-white text-dark border border-border rounded-full font-medium hover:bg-secondary transition-all transform hover:scale-105">
              Create Account
            </button>
          </Link>
        </div>
        
        <p className="mt-8 text-xs text-muted">&copy; 2026 Velion. All rights reserved.</p>
      </div>
    </div>
  );
}
