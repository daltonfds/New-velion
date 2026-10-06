"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AnnouncementBar from "@/components/produto/AnnouncementBar";
import Header from "@/components/produto/Header";
import ProductInfo from "@/components/produto/ProductInfo";
import WhyChooseSection from "@/components/produto/WhyChooseSection";
import ProductDetails from "@/components/produto/ProductDetails";
import StoreFeatures from "@/components/produto/StoreFeatures";
import ReviewsSection from "@/components/produto/ReviewsSection";
import RelatedProducts from "@/components/produto/RelatedProducts";
import Newsletter from "@/components/produto/Newsletter";
import Footer from "@/components/produto/Footer";

type Product = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco: number;
  preco_promocional: number | null;
  moeda: string;
  fotos: string[];
  checkout_url: string | null;
  categoria_id: string | null;
  avaliacao_media: number;
  total_avaliacoes: number;
  beneficios: string[];
  ingredientes: string | null;
  modo_uso: string | null;
  garantia_texto: string | null;
};

type Review = {
  id: string;
  reviewer_name: string | null;
  rating: number;
  review_text: string;
  media_urls: string[];
  verified_buyer: boolean;
  created_at: string;
};

export default function ProdutoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = String(params.slug || "");
  const affiliateRef = searchParams.get("ref") || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const query = affiliateRef ? "?ref=" + encodeURIComponent(affiliateRef) : "";
        const response = await fetch("/api/public/products/" + encodeURIComponent(slug) + query, { cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Product unavailable.");
        if (!cancelled) setData(body);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Product unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (slug) void load();
    return () => { cancelled = true; };
  }, [slug, affiliateRef]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-white"><div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#16294F]" /><p className="mt-4 text-sm text-slate-500">Loading product...</p></div></main>;
  if (error || !data?.product) return <main className="flex min-h-screen items-center justify-center bg-white px-6"><div className="max-w-md text-center"><h1 className="text-2xl font-extrabold text-[#16294F]">Product unavailable</h1><p className="mt-2 text-sm text-slate-500">{error || "This product could not be found."}</p></div></main>;

  const raw = data.product;
  const product: Product = {
    id: raw.id,
    nome: raw.name,
    slug: raw.slug,
    descricao: raw.description,
    preco: raw.price,
    preco_promocional: raw.compareAtPrice,
    moeda: raw.currency,
    fotos: raw.images,
    checkout_url: "/secure",
    categoria_id: raw.category?.id || null,
    avaliacao_media: raw.rating,
    total_avaliacoes: raw.reviewCount,
    beneficios: raw.benefits || [],
    ingredientes: raw.ingredients,
    modo_uso: raw.usage,
    garantia_texto: raw.guarantee,
  };

  return <main className="min-h-screen bg-white text-slate-950">
    <AnnouncementBar />
    <Header />
    <ProductInfo product={product} affiliateLink={affiliateRef} priceOverride={data.affiliatePrice ?? null} />
    <section className="border-b border-slate-100 bg-slate-50"><div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-3"><div className="border-b border-slate-200 px-6 py-7 text-center sm:border-b-0 sm:border-r"><p className="text-lg font-extrabold text-[#16294F]">Fast delivery</p><p className="mt-1 text-sm text-slate-500">South African delivery options</p></div><div className="border-b border-slate-200 px-6 py-7 text-center sm:border-b-0 sm:border-r"><p className="text-lg font-extrabold text-[#16294F]">Product guarantee</p><p className="mt-1 text-sm text-slate-500">{product.garantia_texto || "Guarantee details are shown below"}</p></div><div className="px-6 py-7 text-center"><p className="text-lg font-extrabold text-[#16294F]">Customer support</p><p className="mt-1 text-sm text-slate-500">Help throughout your purchase</p></div></div></section>
    <WhyChooseSection product={product} />
    <ProductDetails product={product} />
    <StoreFeatures />
    <ReviewsSection reviews={data.reviews || []} />
    <RelatedProducts products={(data.related || []).map((p: any) => ({ id:p.id, slug:p.slug, nome:p.name, fotos:p.images, preco:p.price, preco_promocional:p.compareAtPrice, moeda:p.currency, avaliacao_media:p.rating, total_avaliacoes:p.reviewCount }))} />
    <Newsletter />
    <Footer />
  </main>;
}
