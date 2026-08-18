import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6"><VelionLogo className="w-28 h-28" /></div>
        <h1 className="text-xl font-bold text-light-text">Check your email</h1>
        <p className="text-sm text-light-muted mt-2 mb-6">We sent a confirmation link to your email address. Please verify it before logging in.</p>
        <Link href="/login">
          <button className="w-full py-3 bg-primary text-white rounded-full font-medium">Go to Login</button>
        </Link>
      </div>
    </div>
  );
}
