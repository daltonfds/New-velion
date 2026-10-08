import Image from "next/image";
import Link from "next/link";
import { getPublicMarketplace } from "@/lib/public-marketplace/server";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const { suppliers } = await getPublicMarketplace();
  return <main className="min-h-screen bg-white text-slate-950">
    <header className="border-b border-slate-200"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"><Link href="/" className="font-extrabold text-[#0A0440]">Newvelion</Link><Link href="/support" className="text-sm font-semibold text-[#10069F]">Support →</Link></div></header>
    <section className="bg-[#E8EDFF]"><div className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Supply network</p><h1 className="mt-3 text-4xl font-extrabold text-[#0A0440]">Our suppliers</h1><p className="mt-4 max-w-2xl text-slate-600">Explore verified businesses supplying products through Newvelion.</p></div></section>
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">{suppliers.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{suppliers.map((s) => <Link key={s.id} href={"/fornecedor/" + encodeURIComponent(s.slug)} className="rounded-2xl border border-slate-200 p-6 hover:border-blue-200"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-[#E8EDFF] text-xl font-extrabold text-[#0A0440]">{s.logoUrl ? <Image src={s.logoUrl} alt="" width={56} height={56} unoptimized className="h-full w-full object-cover" /> : s.name.slice(0,1)}</div><div><h2 className="font-bold text-slate-900">{s.name}</h2><p className="text-sm text-slate-500">{s.countryName}</p></div></div><div className="mt-6 flex justify-between border-t border-slate-100 pt-4 text-sm"><span className="font-semibold text-blue-700">{s.verified ? "Verified" : "Supplier"}</span><span className="text-slate-500">{s.productCount} products →</span></div></Link>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 p-14 text-center text-slate-500">No public suppliers are available yet.</div>}</div>
  </main>;
}
