import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function LandingPage() {
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
            <Button className="w-full justify-center">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="w-full justify-center">Create Account</Button>
          </Link>
        </div>
        <p className="mt-8 text-xs text-muted">&copy; 2026 Velion. All rights reserved.</p>
      </div>
    </div>
  );
}
