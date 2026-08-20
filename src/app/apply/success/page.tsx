import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function ApplicationSuccessPage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6"><VelionLogo className="w-28 h-28" /></div>
        <h2 className="text-xl font-semibold text-light-text mb-2">Application Submitted</h2>
        <p className="text-light-muted text-sm mb-4">
          Your request has been sent to the Velion admin team.
        </p>
        <p className="text-light-muted text-sm mb-6">
          You will receive a confirmation email once your account is approved.
        </p>
        <Link href="/">
          <button className="w-full py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
