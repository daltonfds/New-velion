import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-light-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8 text-center">
        <div className="flex justify-center mb-4"><VelionLogo className="w-24 h-24" /></div>
        <h1 className="text-xl font-bold text-light-text mb-2">Page Not Found</h1>
        <p className="text-sm text-light-muted mb-6">The page you are looking for doesn't exist.</p>
        <Link href="/"><button className="w-full py-3 bg-primary text-white rounded-full">Go Back Home</button></Link>
      </div>
    </div>
  );
}
