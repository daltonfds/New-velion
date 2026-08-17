import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
        <div className="mb-4"><VelionLogo className="w-24 h-24" /></div>
        <h1 className="text-2xl font-bold text-dark mb-2">Page Not Found</h1>
        <p className="text-muted text-sm mb-6">The page you are looking for doesn't exist.</p>
        <Link href="/"><button className="w-full py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90">Go Back Home</button></Link>
      </div>
    </div>
  );
}
