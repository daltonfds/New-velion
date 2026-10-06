"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

const formatPrice = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "BRL",
    }).format(value);
  } catch {
    return `${currency || "R$"} ${value.toFixed(2)}`;
  }
};

const stars = (rating: number) => {
  const rounded = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
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

  const [size, setSize] = useState("default");
  const [bundle, setBundle] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState("");

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
        const { data: affiliateData } = await supabase.rpc("resolve_affiliate_product_with_slug", { p_link_unico: affiliateRef.replace(/^https?:\/\/[^/]+\//, "").replace(/^\//, "") });
        const resolved = Array.isArray(affiliateData) ? affiliateData[0] : affiliateData;
        if (resolved?.product_id === current.id && Number.isFinite(Number(resolved.sale_price))) setAffiliatePrice(Number(resolved.sale_price));
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
  }, [slug]);

  const basePrice = useMemo(() => {
    if (!product) return 0;
    return affiliatePrice ?? product.preco_promocional ?? product.preco;
  }, [product]);

  // The checkout engine charges the seller-defined unit price for every unit.
  // Do not display client-only bundle discounts that are not persisted server-side.
  const unitPrice = basePrice;
  const totalPrice = unitPrice * bundle * quantity;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function checkoutUrl(qty: number) {
    if (!product?.checkout_url) return "#";

    const params = new URLSearchParams();
    params.set("product", product.slug);
    params.set("qty", String(qty));
    params.set("checkout_url", product.checkout_url);

    if (affiliateRef) {
      params.set("ref", affiliateRef);
    }

    return `/entrega?${params.toString()}`;
  }

  function addToCart() {
    setCartCount((current) => current + bundle * quantity);
    showToast("Added to cart");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading product...</p>
      </main>
    );
  }

  if (!product || error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product unavailable</h1>
          <p className="mt-2 text-gray-500">
            {error || "This product could not be found."}
          </p>
        </div>
      </main>
    );
  }

  const benefits =
    product.beneficios?.length > 0
      ? product.beneficios
      : [
          "Premium quality product",
          "Practical for everyday use",
          "Safe and convenient purchase",
        ];

  const photos =
    product.fotos?.filter(Boolean).length > 0
      ? product.fotos.filter(Boolean)
      : [];

  const guarantee =
    product.garantia_texto || "Satisfaction guarantee";

  return (
    <>
      <style jsx global>{`
        :root {
          --nv-brand: #0b6fb8;
          --nv-brand-ink: #fff;
          --nv-accent: #0a8a4a;
          --nv-cta: #111;
          --nv-danger: #e5161c;
          --nv-bg: #fff;
          --nv-soft: #f4f5f6;
          --nv-ink: #16181a;
          --nv-muted: #6a7076;
          --nv-line: #dfe3e6;
          --nv-star: #f5a100;
          --nv-radius: 14px;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: var(--nv-bg);
          color: var(--nv-ink);
          font-family: system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", Roboto, sans-serif;
        }

        .nv-wrap {
          max-width: 760px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .nv-section {
          padding: 36px 0;
        }

        .nv-h1,
        .nv-h2,
        .nv-h3 {
          line-height: 1.2;
          margin: 0 0 12px;
        }

        .nv-h1 {
          font-size: 1.65rem;
          font-weight: 800;
        }

        .nv-h2 {
          font-size: 1.4rem;
          text-align: center;
          font-weight: 800;
        }

        .nv-muted {
          color: var(--nv-muted);
        }

        .nv-stars {
          color: var(--nv-star);
          letter-spacing: 2px;
        }

        .nv-price {
          font-size: 1.7rem;
          font-weight: 800;
          margin: 6px 0 14px;
        }

        .nv-bar {
          background: var(--nv-brand);
          color: white;
          text-align: center;
          padding: 12px 16px;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .nv-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid var(--nv-line);
        }

        .nv-logo {
          font-weight: 800;
          letter-spacing: 0.02em;
          color: #16294f;
          font-size: 1.15rem;
        }

        .nv-icon {
          background: none;
          border: 0;
          color: var(--nv-ink);
          padding: 8px;
          font-size: 1.3rem;
          position: relative;
          cursor: pointer;
        }

        .nv-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--nv-brand);
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          display: grid;
          place-items: center;
        }

        .nv-gallery {
          background: var(--nv-soft);
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
        }

        .nv-slide {
          flex: 0 0 100%;
          scroll-snap-align: center;
          aspect-ratio: 1 / 1;
          display: grid;
          place-items: center;
        }

        .nv-slide img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .nv-placeholder {
          color: var(--nv-muted);
          border: 2px dashed var(--nv-line);
          padding: 40px 28px;
          border-radius: var(--nv-radius);
        }

        .nv-checks {
          list-style: none;
          padding: 0;
          margin: 0 0 20px;
        }

        .nv-checks li {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 5px 0;
        }

        .nv-checks li::before {
          content: "✓";
          flex: 0 0 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--nv-accent);
          color: white;
          display: grid;
          place-items: center;
          font-size: 0.8rem;
          font-weight: 700;
          margin-top: 2px;
        }

        .nv-pills {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .nv-pill {
          border: 1.5px solid var(--nv-brand);
          background: none;
          color: var(--nv-ink);
          border-radius: 999px;
          padding: 11px 20px;
          font: inherit;
          cursor: pointer;
        }

        .nv-pill.active {
          background: var(--nv-brand);
          color: white;
          font-weight: 700;
        }

        .nv-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--nv-muted);
          font-weight: 700;
          font-size: 0.85rem;
          margin: 6px 0 14px;
        }

        .nv-divider::before,
        .nv-divider::after {
          content: "";
          flex: 1;
          height: 2px;
          background: var(--nv-line);
        }

        .nv-bundles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }

        .nv-bundle {
          border: 2px solid var(--nv-line);
          background: var(--nv-soft);
          border-radius: var(--nv-radius);
          padding: 0 0 14px;
          text-align: center;
          cursor: pointer;
          font: inherit;
          color: var(--nv-ink);
          overflow: hidden;
        }

        .nv-bundle.active {
          border-color: var(--nv-brand);
          background: white;
        }

        .nv-tag {
          display: block;
          background: var(--nv-brand);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 7px 4px;
          min-height: 32px;
        }

        .nv-tag.empty {
          background: transparent;
        }

        .nv-dot {
          display: block;
          width: 22px;
          height: 22px;
          border: 2px solid var(--nv-line);
          border-radius: 50%;
          margin: 14px auto 8px;
          background: white;
        }

        .nv-bundle.active .nv-dot {
          border: 7px solid var(--nv-brand);
        }

        .nv-buy {
          display: flex;
          gap: 12px;
        }

        .nv-qty {
          display: flex;
          align-items: center;
          border: 1px solid var(--nv-line);
          border-radius: 10px;
          flex: 0 0 auto;
        }

        .nv-qty button {
          background: none;
          border: 0;
          color: var(--nv-ink);
          font-size: 1.2rem;
          width: 40px;
          height: 50px;
          cursor: pointer;
        }

        .nv-qty output {
          min-width: 28px;
          text-align: center;
        }

        .nv-btn {
          display: block;
          width: 100%;
          border: 0;
          border-radius: var(--nv-radius);
          padding: 15px 18px;
          font: 700 1rem inherit;
          cursor: pointer;
          text-align: center;
        }

        .nv-btn-cta {
          background: var(--nv-cta);
          color: white;
        }

        .nv-btn-brand {
          background: var(--nv-brand);
          color: white;
        }

        .nv-pay {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
          margin: 22px 0 16px;
        }

        .nv-pay span {
          border: 1px solid var(--nv-line);
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--nv-muted);
        }

        .nv-guarantee {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.05rem;
          text-align: center;
        }

        .nv-guarantee::before {
          content: "✓";
          background: var(--nv-accent);
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 0.9rem;
          flex: 0 0 26px;
        }

        .nv-soft {
          background: var(--nv-soft);
        }

        .nv-detail {
          border-top: 1px solid var(--nv-line);
          padding: 14px 0;
        }

        .nv-facts {
          display: grid;
          gap: 12px;
          margin-top: 8px;
        }

        .nv-fact {
          display: flex;
          gap: 16px;
          align-items: center;
          background: var(--nv-soft);
          border-radius: var(--nv-radius);
          padding: 14px 16px;
        }

        .nv-fact strong {
          flex: 0 0 78px;
          font-size: 1.25rem;
          color: var(--nv-brand);
        }

        .nv-trust {
          display: grid;
          gap: 22px;
          margin-top: 20px;
        }

        .nv-trust-item {
          text-align: center;
        }

        .nv-ico {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--nv-soft);
          display: grid;
          place-items: center;
          margin: 0 auto 8px;
          font-size: 1.6rem;
        }

        .nv-quote {
          background: var(--nv-soft);
          border-radius: var(--nv-radius);
          padding: 16px 18px;
          margin: 12px 0;
        }

        .nv-quote p {
          margin: 6px 0 0;
          font-style: italic;
        }

        .nv-rev-grid {
          columns: 2 150px;
          column-gap: 12px;
        }

        .nv-rev {
          break-inside: avoid;
          border: 1px solid var(--nv-line);
          border-radius: var(--nv-radius);
          padding: 14px;
          margin: 0 0 12px;
          background: white;
        }

        .nv-rev small {
          color: var(--nv-muted);
          display: block;
        }

        .nv-carousel {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 8px;
        }

        .nv-card {
          flex: 0 0 calc(50% - 7px);
          min-width: 150px;
          scroll-snap-align: start;
          text-align: center;
        }

        .nv-card-img {
          aspect-ratio: 1 / 1;
          background: white;
          border-radius: var(--nv-radius);
          display: grid;
          place-items: center;
          color: var(--nv-muted);
          overflow: hidden;
          margin-bottom: 8px;
        }

        .nv-card-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .nv-capture {
          background: var(--nv-brand);
          color: white;
          text-align: center;
          padding: 40px 0;
        }

        .nv-capture input {
          width: 100%;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid var(--nv-line);
          font: inherit;
          margin: 18px 0 16px;
          background: white;
          color: #16181a;
        }

        .nv-danger {
          background: var(--nv-danger);
          color: white;
          width: auto;
          display: inline-block;
          padding: 13px 34px;
        }

        .nv-footer {
          text-align: center;
          padding: 36px 0 100px;
        }

        .nv-social {
          display: flex;
          gap: 14px;
          justify-content: center;
          margin: 18px 0 26px;
        }

        .nv-social span {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: var(--nv-soft);
          display: grid;
          place-items: center;
          font-weight: 700;
        }

        .nv-wa {
          position: fixed;
          left: 16px;
          bottom: 16px;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #25d366;
          color: white;
          display: grid;
          place-items: center;
          font-size: 1.7rem;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
          z-index: 50;
        }

        .nv-toast {
          position: fixed;
          left: 50%;
          bottom: 90px;
          transform: translateX(-50%);
          background: var(--nv-ink);
          color: white;
          padding: 12px 18px;
          border-radius: 10px;
          font-weight: 600;
          z-index: 100;
        }

        @media (min-width: 640px) {
          .nv-card {
            flex-basis: calc(25% - 11px);
          }

          .nv-trust {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      <div className="nv-bar">
        Need help? Chat with us on WhatsApp · Secure checkout
      </div>

      <header className="nv-header">
        <button className="nv-icon" aria-label="Menu">
          ☰
        </button>

        <div className="nv-logo">NewVelion</div>

        <div>
          <button className="nv-icon" aria-label="Buscar">
            ⌕
          </button>

          <button className="nv-icon" aria-label="Cart">
            🛍
            <span className="nv-badge">{cartCount}</span>
          </button>
        </div>
      </header>

      <main>
        <div className="nv-gallery" aria-label="Product photos">
          {photos.length > 0 ? (
            photos.map((photo, index) => (
              <div className="nv-slide" key={`${photo}-${index}`}>
                <img
                  src={photo}
                  alt={`${product.nome} ${index + 1}`}
                />
              </div>
            ))
          ) : (
            <div className="nv-slide">
              <span className="nv-placeholder">
                Product photo
              </span>
            </div>
          )}
        </div>

        <section className="nv-section">
          <div className="nv-wrap">
            <h1 className="nv-h1">{product.nome}</h1>

            <p className="nv-muted" style={{ marginTop: 0 }}>
              <em>
                Quality, convenience, and confidence in every purchase.
              </em>
            </p>

            <div>
              <span className="nv-stars">
                {stars(product.avaliacao_media || 5)}
              </span>{" "}
              <span className="nv-muted">
                ({product.total_avaliacoes || reviews.length} reviews)
              </span>
            </div>

            <div className="nv-price">
              {formatPrice(unitPrice, product.moeda)}
            </div>

            <p style={{ margin: "0 0 6px" }}>Helps you</p>

            <ul className="nv-checks">
              {benefits.slice(0, 6).map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>

            <div className="nv-pills" role="group" aria-label="Size">
              <button
                className={`nv-pill ${
                  size === "default" ? "active" : ""
                }`}
                onClick={() => setSize("default")}
              >
                Standard option
              </button>

              <button
                className={`nv-pill ${
                  size === "large" ? "active" : ""
                }`}
                onClick={() => setSize("large")}
              >
                Larger package
              </button>
            </div>

            <div className="nv-divider">
              SELECT QUANTITY
            </div>

            <div className="nv-bundles" role="group">
              {[1, 3, 6].map((number) => (
                <button
                  key={number}
                  className={`nv-bundle ${
                    bundle === number ? "active" : ""
                  }`}
                  onClick={() => setBundle(number)}
                >
                  <span
                    className={`nv-tag ${
                      number === 1 ? "empty" : ""
                    }`}
                  >
                    {number === 1 ? "" : "Bundle"}
                  </span>

                  <span className="nv-dot" />

                  <b>
                    {number}{" "}
                    {number === 1 ? "unit" : "units"}
                  </b>
                </button>
              ))}
            </div>

            <div
              className="nv-muted"
              style={{
                textAlign: "center",
                marginBottom: 18,
                fontWeight: 600,
              }}
            >
              Total: {formatPrice(totalPrice, product.moeda)}
            </div>

            <div className="nv-buy">
              <div className="nv-qty">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) => Math.max(1, value - 1))
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <output>{quantity}</output>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) => value + 1)
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                className="nv-btn nv-btn-cta"
                onClick={addToCart}
              >
                🛒 ADD TO CART
              </button>
            </div>

            <div className="nv-pay">
              <span>VISA</span>
              <span>Mastercard</span>
              <span>Apple Pay</span>
              <span>Google Pay</span>
            </div>

            <div className="nv-guarantee">
              {guarantee}
            </div>

            {product.checkout_url && (
              <a
                href={checkoutUrl(bundle * quantity)}
                className="nv-btn nv-btn-brand"
                style={{ marginTop: 20 }}
              >
                BUY NOW
              </a>
            )}
          </div>
        </section>

        <section className="nv-section nv-soft">
          <div className="nv-wrap">
            <h2 className="nv-h2">
              Why {product.nome}?
            </h2>

            <div style={{ lineHeight: 1.7 }}>
              {product.descricao ? (
                product.descricao
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
              ) : (
                <p>
                  Discover all the details of this product,
                  designed to deliver quality and convenience.
                </p>
              )}
            </div>

            {product.modo_uso && (
              <div className="nv-detail">
                <b>How to use:</b> {product.modo_uso}
              </div>
            )}

            {product.ingredientes && (
              <div className="nv-detail">
                <b>Product details:</b>{" "}
                {product.ingredientes}
              </div>
            )}
          </div>
        </section>

        <section className="nv-section">
          <div className="nv-wrap">
            <h2 className="nv-h2">
              Quality in every detail
            </h2>

            <div className="nv-facts">
              <div className="nv-fact">
                <strong>✓</strong>
                <span>A product selected for the NewVelion marketplace.</span>
              </div>

              <div className="nv-fact">
                <strong>★</strong>
                <span>Customer reviews and experiences.</span>
              </div>

              <div className="nv-fact">
                <strong>✓</strong>
                <span>A simple and secure purchasing process.</span>
              </div>

              <div className="nv-fact">
                <strong>24/7</strong>
                <span>Support and information available online.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="nv-section nv-soft">
          <div className="nv-wrap">
            <h2 className="nv-h2">
              Why customers choose NewVelion
            </h2>

            <div className="nv-trust">
              <div className="nv-trust-item">
                <div className="nv-ico">🚚</div>
                <h3 className="nv-h3">Delivery</h3>
                <span className="nv-muted">
                  Track your order information.
                </span>
              </div>

              <div className="nv-trust-item">
                <div className="nv-ico">🔒</div>
                <h3 className="nv-h3">Secure payment</h3>
                <span className="nv-muted">
                  Checkout securely provided by the supplier.
                </span>
              </div>

              <div className="nv-trust-item">
                <div className="nv-ico">💬</div>
                <h3 className="nv-h3">Human support</h3>
                <span className="nv-muted">
                  Contact us whenever you need help.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="nv-section">
          <div className="nv-wrap">
            <h2 className="nv-h2">
              What our customers say
            </h2>

            {reviews.slice(0, 3).map((review) => (
              <div className="nv-quote" key={review.id}>
                <b>{review.reviewer_name || "Verified customer"}</b>

                <div className="nv-stars">
                  {stars(review.rating)}
                </div>

                <p>"{review.review_text}"</p>

                {review.verified_buyer && (
                  <small className="nv-muted">
                    ✓ Verified purchase
                  </small>
                )}
              </div>
            ))}

            {reviews.length === 0 && (
              <div className="nv-quote">
                <b>NewVelion customers</b>
                <div className="nv-stars">★★★★★</div>
                <p>
                  Customer reviews will appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="nv-section">
          <div className="nv-wrap">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <span className="nv-stars">
                  {stars(product.avaliacao_media || 5)}
                </span>{" "}
                <b>
                  {product.total_avaliacoes || reviews.length} reviews
                </b>
              </div>
            </div>

            <div className="nv-rev-grid">
              {reviews.map((review) => (
                <article className="nv-rev" key={review.id}>
                  <b>
                    {review.reviewer_name || "Customer"}{" "}
                    {review.verified_buyer ? "✔" : ""}
                  </b>

                  <small>
                    {new Date(review.created_at).toLocaleDateString(
                      "en-US",
                    )}
                  </small>

                  <div className="nv-stars">
                    {stars(review.rating)}
                  </div>

                  <p>{review.review_text}</p>

                  <small>
                    Verified purchase
                  </small>
                </article>
              ))}
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="nv-section nv-soft">
            <div className="nv-wrap">
              <h2 className="nv-h2">
                Customers who bought this item also bought:
              </h2>

              <div className="nv-carousel">
                {related.map((item) => {
                  const itemPrice =
                    item.preco_promocional ?? item.preco;

                  return (
                    <div className="nv-card" key={item.id}>
                      <div className="nv-card-img">
                        {item.fotos?.[0] ? (
                          <img
                            src={item.fotos[0]}
                            alt={item.nome}
                          />
                        ) : (
                          "Foto"
                        )}
                      </div>

                      <b>{item.nome}</b>

                      <div className="nv-stars">
                        {stars(item.avaliacao_media || 5)}
                      </div>

                      <div className="nv-muted">
                        ({item.total_avaliacoes || 0} reviews)
                      </div>

                      <div>
                        {formatPrice(itemPrice, item.moeda)}
                      </div>

                      <a
                        href={`/produto/${item.slug}${
                          affiliateRef
                            ? `?ref=${encodeURIComponent(
                                affiliateRef,
                              )}`
                            : ""
                        }`}
                        className="nv-btn nv-btn-brand"
                        style={{ marginTop: 8 }}
                      >
                        View product
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <section className="nv-capture">
        <div className="nv-wrap">
          <h2
            className="nv-h2"
            style={{ color: "white" }}
          >
            Want to learn more?
          </h2>

          <p>
            Get product updates, new offers and marketplace news from NewVelion.
          </p>

          <input
            type="email"
            placeholder="Your email address"
            aria-label="Email"
          />

          <button
            className="nv-btn nv-danger"
            onClick={() =>
              showToast("Thank you! We will be in touch soon.")
            }
          >
            Subscribe
          </button>
        </div>
      </section>

      <footer className="nv-footer">
        <div className="nv-wrap">
          <div className="nv-logo">NewVelion</div>

          <p>
            <a href="mailto:support@newvelion.com">
              support@newvelion.com
            </a>
          </p>

          <div className="nv-social" aria-label="Social media">
            <a href="https://www.instagram.com/newvelion" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
            <a href="https://www.tiktok.com/@newvelion" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4c.4 2.1 1.7 3.5 4 3.8v3a8.2 8.2 0 0 1-4-1.2v5.1a5.3 5.3 0 1 1-4.5-5.2v3a2.3 2.3 0 1 0 1.5 2.2V4H15Z" fill="currentColor"/></svg></a>
            <a href="https://wa.me/27722958915" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .4 5.2.4 11.6c0 2 .5 4 1.5 5.7L.3 23.9l6.8-1.7a11.7 11.7 0 0 0 5 1.1h.1c6.4 0 11.6-5.2 11.6-11.6 0-3.1-1.2-6-3.3-8.2Z" fill="currentColor"/></svg></a>
          </div>

          <h3>Quick links</h3>

          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <a href="/marketplace">All products</a>
            </li>
            <li>
              <a href="/marketplace">Marketplace</a>
            </li>
            <li>
              <a href="/dashboard">My account</a>
            </li>
          </ul>

          <h3>Learn more</h3>

          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <a href="/contact">Contact</a>
            </li>
            <li>
              <a href="/terms">Terms & Conditions</a>
            </li>
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
          </ul>

          <p
            className="nv-muted"
            style={{ fontSize: "0.85rem" }}
          >
            The information presented on this page is provided for informational
            purposes only. Please refer to the manufacturer's official
            information before purchasing.
          </p>

          <p
            className="nv-muted"
            style={{ fontSize: "0.85rem" }}
          >
            © {new Date().getFullYear()} NewVelion. All rights reserved.
          </p>
        </div>
      </footer>

      {product.checkout_url && (
        <a
          className="nv-wa"
          href={checkoutUrl(bundle * quantity)}
          aria-label="Buy product"
          style={{
            left: "auto",
            right: 16,
            background: "#0b6fb8",
            fontSize: "1.35rem",
          }}
        >
          🛒
        </a>
      )}

      {toast && <div className="nv-toast">{toast}</div>}
    </>
  );
}
