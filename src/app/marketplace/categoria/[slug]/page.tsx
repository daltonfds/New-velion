import Link from "next/link";
import { getPublicMarketplace } from "@/lib/public-marketplace/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getPublicMarketplace();
  const category = catalog.categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const products = catalog.products.filter((item) => item.category?.slug === slug);
  return <main className="min-h-screen bg-white text-slate-950">
    <header className="border-b border-slate-200"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"><Link href="/marketplace" className="font-extrabold text-[#16294F]">Newvelion Marketplace</Link><Link href="/fornecedores" className="text-sm font-semibold text-blue-700">Suppliers →</Link></div></header>
    <section className="bg-[#eef4fb]"><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Category</p><h1 className="mt-3 text-4xl font-extrabold text-[#16294F]">{category.name}</h1><p className="mt-3 text-slate-600">{products.length} products available.</p></div></section>
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((p) => <Link key={p.id} href={"/produto/" + encodeURIComponent(p.slug)} className="overflow-hidden rounded-2xl border border-slate-200 hover:border-blue-200"><div className="aspect-square bg-slate-50">{p.images[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : null}</div><div className="p-4"><h2 className="font-bold">{p.name}</h2><p className="mt-2 font-extrabold text-[#16294F]">R {p.price.toFixed(2)}</p></div></Link>)}</div></div>
  </main>;
}
