import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSupplier } from "@/lib/public-marketplace/server";

export const dynamic = "force-dynamic";

export default async function SupplierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPublicSupplier(slug);
  if (!result) notFound();
  const { supplier, products, categories } = result;

  return <main className="min-h-screen bg-white text-slate-950">
    <header className="border-b border-slate-200"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"><Link href="/marketplace" className="font-extrabold text-[#16294F]">Newvelion Marketplace</Link><Link href="/fornecedores" className="text-sm font-semibold text-blue-700">All suppliers →</Link></div></header>
    <section className="border-b border-blue-100 bg-[#eef4fb]"><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-3xl font-extrabold text-[#16294F]">{supplier.logoUrl ? <Image src={supplier.logoUrl} alt="" width={96} height={96} unoptimized className="h-full w-full object-cover" /> : supplier.name.slice(0,1)}</div><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-extrabold text-[#16294F]">{supplier.name}</h1>{supplier.verified && <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700">Verified supplier</span>}</div><p className="mt-2 text-sm text-slate-600">{supplier.countryName}{supplier.city ? " · " + supplier.city : ""}{supplier.region ? " · " + supplier.region : ""}</p><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{supplier.description || "Supplier information published through the Newvelion marketplace."}</p></div></div></div></section>
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="flex flex-wrap gap-2">{categories.map((c: { id: string; name: string; slug: string }) => <Link key={c.id} href={"/marketplace?category=" + encodeURIComponent(c.slug)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700">{c.name}</Link>)}</div><div className="mt-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Supplier catalog</p><h2 className="mt-2 text-2xl font-extrabold text-[#16294F]">{products.length} products</h2></div><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((p) => <Link key={p.id} href={"/produto/" + encodeURIComponent(p.slug)} className="overflow-hidden rounded-2xl border border-slate-200 hover:border-blue-200"><div className="relative aspect-square bg-slate-50">{p.images[0] ? <Image src={p.images[0]} alt={p.name} fill unoptimized className="object-cover" sizes="25vw" /> : null}</div><div className="p-4"><h3 className="font-bold text-slate-900">{p.name}</h3><p className="mt-2 font-extrabold text-[#16294F]">R {p.price.toFixed(2)}</p></div></Link>)}</div></div>
  </main>;
}
