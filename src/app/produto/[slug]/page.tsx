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
  ativo: boolean;
  categoria_id: string | null;
  avaliacao_media: number;
  total_avaliacoes: number;
  beneficios: string[];
  ingredientes: string | null;
  modo_uso: string | null;
  garantia_texto: string | null;
  faq: unknown;
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

type Related = {
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
  const affiliateLink = searchParams.get("ref") || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Related[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;

      setLoading(true);

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
            "ativo",
            "categoria_id",
            "avaliacao_media",
            "total_avaliacoes",
            "beneficios",
            "ingredientes",
            "modo_uso",
            "garantia_texto",
            "faq",
          ].join(","),
        )
        .eq("slug", slug)
        .eq("ativo", true)
        .maybeSingle();

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

      const currentProduct = data as unknown as Product;
      setProduct(currentProduct);

      const reviewsQuery = supabase
        .from("product_reviews")
        .select(
          "id,reviewer_name,rating,review_text,media_urls,verified_buyer,created_at",
        )
        .eq("product_id", currentProduct.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);

      const relatedQuery = currentProduct.categoria_id
        ? supabase
            .from("products")
            .select(
              "id,slug,nome,fotos,preco,preco_promocional,moeda,avaliacao_media,total_avaliacoes",
            )
            .eq("ativo", true)
            .eq("categoria_id", currentProduct.categoria_id)
            .neq("id", currentProduct.id)
            .order("destaque", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] as Related[] });

      const [{ data: reviewData }, { data: relatedData }] = await Promise.all([
        reviewsQuery,
        relatedQuery,
      ]);

      setReviews((reviewData || []) as Review[]);
      setRelated((relatedData || []) as Related[]);
      setLoading(false);
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-500">Loading product...</p>
      </main>
    );
  }

  if (!product || error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-950">
            Product unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-500">
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
        affiliateLink={affiliateLink}
      />

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
