"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

type RelatedProduct = {
  id: string;
  slug: string;
  nome: string;
  fotos: string[];
  preco: number;
  preco_promocional: number | null;
  moeda: string;
  avaliacao_media: number;
  total_avaliacoes: number;
};

export default function ProdutoPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = String(params.slug || "");
  const affiliateRef = searchParams.get("ref") || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [affiliatePrice, setAffiliatePrice] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!slug) {
        setError("Product not found.");
        setLoading(false);
        return;
      }

      const { data, error: productError } = await supabase
        .from("products")
        .select(
          [
            "id",
            "nome",
            "slug",
            "descricao",
            "preco",
            "preco_promocional",
            "moeda",
            "fotos",
            "checkout_url",
            "categoria_id",
            "avaliacao_media",
            "total_avaliacoes",
            "beneficios",
            "ingredientes",
            "modo_uso",
            "garantia_texto",
          ].join(","),
        )
        .eq("slug", slug)
        .eq("ativo", true)
        .eq("moeda", "ZAR")
        .maybeSingle();

      if (cancelled) return;

      if (productError) {
        setError(productError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("This product is no longer available.");
        setLoading(false);
        return;
      }

      const current = data as unknown as Product;
      setProduct(current);

      if (affiliateRef) {
        const { data: affiliateData } = await supabase.rpc(
          "resolve_affiliate_product_with_slug",
          {
            p_link_unico: affiliateRef
              .replace(/^https?:\/\/[^/]+\//, "")
              .replace(/^\//, ""),
          },
        );

        const resolved = Array.isArray(affiliateData)
          ? affiliateData[0]
          : affiliateData;

        if (
          resolved?.product_id === current.id &&
          Number.isFinite(Number(resolved.sale_price))
        ) {
          setAffiliatePrice(Number(resolved.sale_price));
        }
      }

      const reviewsPromise = supabase
        .from("product_reviews")
        .select(
          "id,reviewer_name,rating,review_text,media_urls,verified_buyer,created_at",
        )
        .eq("product_id", current.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(12);

      const relatedPromise = current.categoria_id
        ? supabase
            .from("products")
            .select(
              "id,slug,nome,fotos,preco,preco_promocional,moeda,avaliacao_media,total_avaliacoes",
            )
            .eq("ativo", true)
            .eq("moeda", "ZAR")
            .eq("categoria_id", current.categoria_id)
            .neq("id", current.id)
            .order("destaque", { ascending: false })
            .limit(6)
        : Promise.resolve({
            data: [] as RelatedProduct[],
            error: null,
          });

      const [{ data: reviewData }, { data: relatedData }] = await Promise.all([
        reviewsPromise,
        relatedPromise,
      ]);

      if (cancelled) return;

      setReviews((reviewData || []) as Review[]);
      setRelated((relatedData || []) as RelatedProduct[]);
      setLoading(false);
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug, affiliateRef]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#16294F]" />
          <p className="mt-4 text-sm text-slate-500">Loading product...</p>
        </div>
      </main>
    );
  }

  if (!product || error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl text-[#16294F]">
            !
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-950">
            Product unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "This product could not be found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <AnnouncementBar />
      <Header />

      <ProductInfo
        product={product}
        affiliateLink={affiliateRef}
        priceOverride={affiliatePrice}
      />

      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-3">
          <div className="border-b border-slate-200 px-6 py-7 text-center sm:border-b-0 sm:border-r">
            <p className="text-lg font-extrabold text-[#16294F]">Fast delivery</p>
            <p className="mt-1 text-sm text-slate-500">
              South African delivery options
            </p>
          </div>
          <div className="border-b border-slate-200 px-6 py-7 text-center sm:border-b-0 sm:border-r">
            <p className="text-lg font-extrabold text-[#16294F]">Product guarantee</p>
            <p className="mt-1 text-sm text-slate-500">
              {product.garantia_texto || "Guarantee details are shown below"}
            </p>
          </div>
          <div className="px-6 py-7 text-center">
            <p className="text-lg font-extrabold text-[#16294F]">Customer support</p>
            <p className="mt-1 text-sm text-slate-500">
              Help throughout your purchase
            </p>
          </div>
        </div>
      </section>

      <WhyChooseSection product={product} />
      <ProductDetails product={product} />
      <StoreFeatures />
      <ReviewsSection reviews={reviews} />
      <RelatedProducts products={related} />
      <Newsletter />
      <Footer />
    </main>
  );
}
