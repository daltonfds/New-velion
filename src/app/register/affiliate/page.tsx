import Link from "next/link";
import NewvelionBrand from "@/components/ui/NewvelionBrand";

export default function PlatformAffiliateInvitePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F8FC] px-5 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-[#DCE3EE] bg-white p-7 text-center shadow-sm sm:p-9">
        <div className="mb-7 flex justify-center border-b border-slate-100 pb-6"><NewvelionBrand size="md" /></div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0078E8]">Newvelion Partner Program</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#001B44]">Affiliate access is by invitation</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">Platform affiliate accounts cannot be created publicly. Ask an existing Newvelion affiliate, seller, or administrator to invite you.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login" className="rounded-lg bg-[#003B95] px-5 py-3 font-semibold text-white hover:bg-[#002B70]">Sign in</Link>
          <Link href="/" className="rounded-lg border border-slate-200 px-5 py-3 font-semibold text-[#003B95] hover:bg-slate-50">Back to Newvelion</Link>
        </div>
      </section>
    </main>
  );
}
