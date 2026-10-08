"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = Record<string, any>;

const firstValue = (
  object: Product | null | undefined,
  keys: string[],
  fallback: any = "",
) => {
  for (const key of keys) {
    const value = object?.[key];
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }
  return fallback;
};

const toNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const formatMoney = (value: number, symbol: string) =>
  `${symbol} ${value.toFixed(2).replace(".", ",")}`;

const cleanText = (value: unknown) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

function getImages(product: Product | null) {
  const value = product?.fotos;
  const images: string[] = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      if (
        typeof item === "string" &&
        (item.startsWith("http://") || item.startsWith("https://"))
      ) {
        images.push(item);
      } else if (
        item &&
        typeof item === "object" &&
        typeof item.url === "string" &&
        (item.url.startsWith("http://") || item.url.startsWith("https://"))
      ) {
        images.push(item.url);
      }
    }
  }

  return [...new Set(images)].slice(0, 6);
}

function Icon({
  name,
  size = 20,
}: {
  name: "menu" | "search" | "cart" | "check" | "plus" | "minus" | "star" | "whatsapp";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "menu") {
    return (
      <svg {...common}>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    );
  }

  if (name === "cart") {
    return (
      <svg {...common}>
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (name === "minus") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "star") {
    return (
      <svg {...common} fill="currentColor" stroke="none">
        <path d="m12 2.8 2.85 5.78 6.38.93-4.61 4.49 1.09 6.35L12 17.35l-5.71 3 1.09-6.35-4.61-4.49 6.38-.93L12 2.8Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />
      <path d="M8.5 9.5c.3 2 2 3.7 4 4 .5.1 1-.1 1.3-.5l.5-.7-1.5-1.1-.7.7c-.8-.4-1.5-1-1.9-1.8l.7-.7-1.1-1.5-.7.5c-.4.3-.6.8-.5 1.1Z" />
    </svg>
  );
}

export default function SalesPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [bundle, setBundle] = useState(1);
  const [selectedOption, setSelectedOption] = useState("1 unit");
  const [subscription, setSubscription] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!productId) return;

    async function loadProduct() {
      const { data, error: queryError } = await supabase
        .from("products")
        .select("*")
        .eq("moeda", "ZAR")
        .eq("id", productId)
        .eq("ativo", true)
        .maybeSingle();

      if (queryError || !data) {
        setError(queryError?.message || "This offer is no longer available.");
        return;
      }

      setProduct(data);

      const { data: related } = await supabase
        .from("products")
        .select("*")
        .eq("ativo", true)
        .neq("id", productId)
        .limit(4);

      setRelatedProducts(related || []);

      if (typeof window !== "undefined") {
        const saved = Number(localStorage.getItem("newvelion-cart-count") || 0);
        setCartCount(Number.isFinite(saved) ? saved : 0);

        const ref = new URLSearchParams(window.location.search).get("ref");
        if (ref) localStorage.setItem("newvelion-affiliate-ref", ref);
      }
    }

    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const images = useMemo(() => getImages(product), [product]);

  const title = firstValue(product, ["nome", "title", "product_name"], "Product");
  const description = cleanText(
    firstValue(
      product,
      ["descricao", "description", "short_description"],
      "Discover more about this product and what it offers.",
    ),
  );

  const price = toNumber(
    firstValue(product, ["preco", "price", "sale_price", "valor"], 0),
  );

  const currencySymbol = firstValue(
    product,
    ["moeda", "currency_symbol", "currency"],
    "$",
  );

  const reviewCount = toNumber(
    firstValue(product, ["review_count", "reviews_count", "avaliacoes"], 0),
  );

  const rating = toNumber(
    firstValue(product, ["rating", "average_rating", "avaliacao_media"], 5),
    5,
  );

  const bundleDiscount =
    bundle === 6 ? 0.1 : bundle === 3 ? 0.05 : 0;

  const unitPrice = price * (1 - bundleDiscount);
  const subtotal = unitPrice * bundle * quantity;

  function addToCart() {
    const amount = bundle * quantity;
    const nextCount = cartCount + amount;

    setCartCount(nextCount);

    if (typeof window !== "undefined") {
      localStorage.setItem("newvelion-cart-count", String(nextCount));
      window.dispatchEvent(
        new CustomEvent("newvelion-cart-updated", {
          detail: { count: nextCount },
        }),
      );
    }

    setToast(`${amount} item${amount > 1 ? "s" : ""} added to cart`);
  }

  if (error) {
    return (
      <main className="sales-page error-page">
        <div className="error-box">
          <h1>Offer unavailable</h1>
          <p>{error}</p>
        </div>
        <style jsx>{`
          .sales-page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: #fff;
            color: #16181a;
          }
          .error-box {
            max-width: 520px;
            text-align: center;
          }
          .error-box h1 {
            font-size: 30px;
            margin: 0 0 10px;
          }
          .error-box p {
            color: #6a7076;
          }
        `}</style>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="sales-page loading-page">
        <div className="loader" />
        <p>Loading offer...</p>
        <style jsx>{`
          .sales-page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            align-content: center;
            gap: 14px;
            background: #fff;
            color: #16181a;
          }
          .loader {
            width: 34px;
            height: 34px;
            border: 3px solid #dfe3e6;
            border-top-color: #0b6fb8;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="sales-page">
      <style jsx global>{`
        :root {
          --brand: #0b6fb8;
          --accent: #0a8a4a;
          --cta: #111;
          --danger: #e5161c;
          --bg: #fff;
          --soft: #f4f5f6;
          --ink: #16181a;
          --muted: #6a7076;
          --line: #dfe3e6;
          --star: #f5a100;
          --radius: 14px;
        }

        * {
          box-sizing: border-box;
        }

        .sales-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--ink);
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        .announcement {
          background: var(--ink);
          color: white;
          text-align: center;
          padding: 9px 16px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .header {
          height: 68px;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 0 5%;
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.97);
          z-index: 20;
        }

        .icon-button {
          border: 0;
          background: transparent;
          cursor: pointer;
          color: var(--ink);
          display: grid;
          place-items: center;
          padding: 8px;
          border-radius: 8px;
        }

        .icon-button:hover {
          background: var(--soft);
        }

        .brand {
          font-weight: 900;
          font-size: 22px;
          color: #0A0440;
          white-space: nowrap;
          letter-spacing: -0.04em;
        }

        .brand span {
          color: #FFB800;
        }

        .search {
          margin-left: auto;
          width: min(360px, 35vw);
          height: 40px;
          border: 1px solid var(--line);
          border-radius: 9px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          color: var(--muted);
          gap: 8px;
        }

        .search input {
          border: 0;
          outline: 0;
          width: 100%;
          font: inherit;
          color: var(--ink);
        }

        .cart-button {
          position: relative;
        }

        .cart-count {
          position: absolute;
          right: 0;
          top: 0;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: var(--danger);
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          display: grid;
          place-items: center;
        }

        .container {
          width: min(1180px, 92%);
          margin: 0 auto;
        }

        .hero {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
          gap: 58px;
          padding: 48px 0 70px;
        }

        .gallery {
          min-width: 0;
        }

        .gallery-main {
          aspect-ratio: 1 / 1;
          background: var(--soft);
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--line);
        }

        .gallery-main img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .gallery-placeholder {
          height: 100%;
          display: grid;
          place-items: center;
          color: var(--muted);
          font-weight: 700;
        }

        .thumbs {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          overflow-x: auto;
        }

        .thumb {
          flex: 0 0 72px;
          height: 72px;
          padding: 0;
          background: white;
          border: 1px solid var(--line);
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
        }

        .thumb.active {
          border: 2px solid var(--brand);
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          padding-top: 8px;
        }

        .eyebrow {
          color: var(--brand);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 11px;
          font-weight: 800;
        }

        .title {
          font-size: clamp(30px, 4vw, 48px);
          line-height: 1.02;
          letter-spacing: -0.045em;
          margin: 10px 0 14px;
        }

        .description {
          color: var(--muted);
          line-height: 1.65;
          font-size: 16px;
          margin: 0 0 18px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          font-size: 13px;
        }

        .stars {
          color: var(--star);
          display: flex;
          gap: 2px;
        }

        .price {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }

        .benefits {
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          padding: 18px 0;
          display: grid;
          gap: 11px;
          margin-bottom: 22px;
        }

        .benefit {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 650;
        }

        .benefit-icon {
          color: var(--accent);
          display: grid;
          place-items: center;
        }

        .label {
          display: block;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 9px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .options {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .option {
          border: 1px solid var(--line);
          background: white;
          padding: 10px 15px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 700;
        }

        .option.active {
          border-color: var(--brand);
          color: var(--brand);
          background: #f3f9fd;
        }

        .bundles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 9px;
          margin-bottom: 18px;
        }

        .bundle {
          border: 1px solid var(--line);
          border-radius: 10px;
          background: #fff;
          padding: 13px 8px;
          text-align: center;
          cursor: pointer;
        }

        .bundle.active {
          border: 2px solid var(--brand);
          padding: 12px 7px;
        }

        .bundle strong {
          display: block;
          font-size: 18px;
        }

        .bundle small {
          color: var(--muted);
          display: block;
          margin-top: 3px;
        }

        .discount {
          color: var(--accent);
          font-size: 11px;
          font-weight: 800;
          margin-top: 4px;
        }

        .subscription {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 13px;
          background: var(--soft);
          border-radius: 10px;
          margin-bottom: 18px;
          font-size: 13px;
        }

        .subscription input {
          margin-top: 2px;
        }

        .purchase-row {
          display: grid;
          grid-template-columns: 118px 1fr;
          gap: 10px;
        }

        .quantity {
          border: 1px solid var(--line);
          display: grid;
          grid-template-columns: 36px 1fr 36px;
          align-items: center;
          border-radius: 9px;
          overflow: hidden;
        }

        .quantity button {
          border: 0;
          background: white;
          cursor: pointer;
          height: 48px;
          display: grid;
          place-items: center;
        }

        .quantity span {
          text-align: center;
          font-weight: 800;
        }

        .cta {
          border: 0;
          border-radius: 9px;
          background: var(--cta);
          color: white;
          font-weight: 850;
          font-size: 14px;
          cursor: pointer;
          min-height: 48px;
          padding: 0 20px;
        }

        .cta:hover {
          background: #292929;
        }

        .payment {
          text-align: center;
          color: var(--muted);
          font-size: 12px;
          margin-top: 12px;
        }

        .section {
          padding: 72px 0;
          border-top: 1px solid var(--line);
        }

        .section.soft {
          background: var(--soft);
        }

        .section-title {
          text-align: center;
          font-size: clamp(27px, 4vw, 38px);
          letter-spacing: -0.035em;
          margin: 0 0 12px;
        }

        .section-subtitle {
          text-align: center;
          color: var(--muted);
          max-width: 680px;
          margin: 0 auto 34px;
          line-height: 1.6;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .feature-card {
          background: white;
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 26px;
        }

        .feature-card h3 {
          margin: 14px 0 8px;
          font-size: 18px;
        }

        .feature-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
          font-size: 14px;
        }

        .compare {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          max-width: 850px;
          margin: 0 auto;
        }

        .compare-card {
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 24px;
          text-align: center;
          background: white;
        }

        .compare-card.highlight {
          border: 2px solid var(--brand);
        }

        .compare-card strong {
          display: block;
          font-size: 22px;
          margin-bottom: 8px;
        }

        .compare-card p {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
        }

        .trust {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .trust-item {
          border: 1px solid var(--line);
          background: white;
          padding: 20px 14px;
          border-radius: 12px;
          text-align: center;
        }

        .trust-item strong {
          display: block;
          font-size: 14px;
          margin-top: 8px;
        }

        .trust-item span {
          color: var(--muted);
          font-size: 12px;
        }

        .support {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: stretch;
        }

        .support-card {
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 30px;
          background: white;
        }

        .support-card.whatsapp {
          border-color: #b7dfca;
        }

        .support-card h3 {
          margin: 0 0 9px;
          font-size: 22px;
        }

        .support-card p {
          color: var(--muted);
          line-height: 1.6;
          margin: 0 0 18px;
        }

        .support-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          background: var(--accent);
          color: white;
          border-radius: 9px;
          padding: 12px 16px;
          font-weight: 800;
          font-size: 13px;
        }

        .reviews {
          columns: 3 280px;
          column-gap: 16px;
        }

        .review {
          break-inside: avoid;
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 18px;
          margin: 0 0 16px;
          background: white;
        }

        .review-head {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .review-name {
          font-weight: 800;
          font-size: 13px;
        }

        .review p {
          margin: 0;
          color: var(--muted);
          line-height: 1.55;
          font-size: 13px;
        }

        .empty-reviews {
          border: 1px dashed var(--line);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          color: var(--muted);
        }

        .related {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .related-card {
          border: 1px solid var(--line);
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }

        .related-image {
          aspect-ratio: 1;
          background: var(--soft);
        }

        .related-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .related-body {
          padding: 15px;
        }

        .related-body h3 {
          margin: 0 0 8px;
          font-size: 14px;
          line-height: 1.35;
        }

        .related-price {
          font-weight: 850;
        }

        .email-section {
          background: var(--ink);
          color: white;
          padding: 56px 0;
        }

        .email-box {
          max-width: 620px;
          margin: 0 auto;
          text-align: center;
        }

        .email-box h2 {
          margin: 0 0 10px;
          font-size: 30px;
        }

        .email-box p {
          color: #c9cdd0;
          line-height: 1.5;
        }

        .email-form {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }

        .email-form input {
          min-width: 0;
          flex: 1;
          border: 0;
          border-radius: 8px;
          padding: 13px 14px;
          outline: 0;
        }

        .email-form button {
          border: 0;
          border-radius: 8px;
          padding: 0 18px;
          background: white;
          color: var(--ink);
          font-weight: 850;
          cursor: pointer;
        }

        .footer {
          border-top: 1px solid var(--line);
          padding: 32px 0;
          background: white;
        }

        .footer-inner {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
        }

        .footer p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        .footer-links {
          display: flex;
          gap: 18px;
          font-size: 12px;
          color: var(--muted);
        }

        .floating-whatsapp {
          position: fixed;
          right: 20px;
          bottom: 20px;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: var(--accent);
          color: white;
          z-index: 30;
          text-decoration: none;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.16);
        }

        .toast {
          position: fixed;
          left: 50%;
          bottom: 24px;
          transform: translateX(-50%);
          background: var(--ink);
          color: white;
          border-radius: 9px;
          padding: 12px 17px;
          font-size: 13px;
          font-weight: 700;
          z-index: 50;
        }

        @media (max-width: 850px) {
          .search {
            display: none;
          }

          .hero {
            grid-template-columns: 1fr;
            gap: 30px;
            padding-top: 25px;
          }

          .product-info {
            padding-top: 0;
          }

          .feature-grid,
          .compare {
            grid-template-columns: 1fr;
          }

          .trust {
            grid-template-columns: repeat(2, 1fr);
          }

          .related {
            grid-template-columns: repeat(2, 1fr);
          }

          .support {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .header {
            padding: 0 4%;
          }

          .brand {
            font-size: 19px;
          }

          .container {
            width: 92%;
          }

          .purchase-row {
            grid-template-columns: 1fr;
          }

          .quantity {
            width: 100%;
          }

          .bundles {
            grid-template-columns: 1fr;
          }

          .email-form {
            flex-direction: column;
          }

          .email-form button {
            height: 44px;
          }

          .footer-inner {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="announcement">
        Secure checkout • Fast support • Shop with confidence
      </div>

      <header className="header">
        <button className="icon-button" aria-label="Open menu">
          <Icon name="menu" />
        </button>

        <div className="brand">
          New<span>velion</span>
        </div>

        <div className="search">
          <Icon name="search" size={17} />
          <input placeholder="Search products" aria-label="Search products" />
        </div>

        <button className="icon-button cart-button" aria-label="Shopping cart">
          <Icon name="cart" />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </header>

      <div className="container">
        <section className="hero">
          <div className="gallery">
            <div className="gallery-main">
              {images[0] ? (
                <img src={images[0]} alt={title} />
              ) : (
                <div className="gallery-placeholder">Product image</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="thumbs">
                {images.map((image, index) => (
                  <button className={`thumb ${index === 0 ? "active" : ""}`} key={image}>
                    <img src={image} alt={`${title} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="eyebrow">Featured product</div>

            <h1 className="title">{title}</h1>

            <p className="description">{description}</p>

            <div className="rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon key={star} name="star" size={16} />
                ))}
              </div>
              <span>
                {rating.toFixed(1)} {reviewCount > 0 ? `(${reviewCount} reviews)` : ""}
              </span>
            </div>

            <div className="price">
              {formatMoney(price, currencySymbol)}
            </div>

            <div className="benefits">
              <div className="benefit">
                <span className="benefit-icon">
                  <Icon name="check" size={18} />
                </span>
                Secure and convenient shopping experience
              </div>
              <div className="benefit">
                <span className="benefit-icon">
                  <Icon name="check" size={18} />
                </span>
                Product information clearly displayed
              </div>
              <div className="benefit">
                <span className="benefit-icon">
                  <Icon name="check" size={18} />
                </span>
                Customer support available
              </div>
            </div>

            <span className="label">Choose your option</span>

            <div className="options">
              {["1 unit", "2 units"].map((option) => (
                <button
                  key={option}
                  className={`option ${selectedOption === option ? "active" : ""}`}
                  onClick={() => setSelectedOption(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <span className="label">Bundle</span>

            <div className="bundles">
              {[1, 3, 6].map((amount) => {
                const discount =
                  amount === 6 ? 10 : amount === 3 ? 5 : 0;

                return (
                  <button
                    key={amount}
                    className={`bundle ${bundle === amount ? "active" : ""}`}
                    onClick={() => setBundle(amount)}
                  >
                    <strong>{amount} unit{amount > 1 ? "s" : ""}</strong>
                    <small>{formatMoney(price * amount, currencySymbol)}</small>
                    {discount > 0 && (
                      <div className="discount">Save {discount}%</div>
                    )}
                  </button>
                );
              })}
            </div>

            <label className="subscription">
              <input
                type="checkbox"
                checked={subscription}
                onChange={(event) => setSubscription(event.target.checked)}
              />
              <span>
                <strong>Subscribe & save</strong>
                <br />
                Receive future orders automatically when available.
              </span>
            </label>

            <div className="purchase-row">
              <div className="quantity">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  <Icon name="minus" size={17} />
                </button>

                <span>{quantity}</span>

                <button
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((value) => value + 1)}
                >
                  <Icon name="plus" size={17} />
                </button>
              </div>

              <button className="cta" onClick={addToCart}>
                ADD TO CART • {formatMoney(subtotal, currencySymbol)}
              </button>
            </div>

            <div className="payment">
              Secure payment options available at checkout
            </div>
          </div>
        </section>
      </div>

      <section className="section soft">
        <div className="container">
          <h2 className="section-title">Why choose this product?</h2>
          <p className="section-subtitle">
            Everything you need to make an informed purchase decision, presented
            clearly and simply.
          </p>

          <div className="feature-grid">
            <article className="feature-card">
              <Icon name="check" size={24} />
              <h3>Clear product information</h3>
              <p>
                Product details, pricing and available options are presented in
                one place.
              </p>
            </article>

            <article className="feature-card">
              <Icon name="check" size={24} />
              <h3>Simple shopping experience</h3>
              <p>
                Choose your option, adjust the quantity and continue to checkout.
              </p>
            </article>

            <article className="feature-card">
              <Icon name="check" size={24} />
              <h3>NewVelion marketplace</h3>
              <p>
                Discover products from suppliers and brands available through
                the NewVelion marketplace.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Compare your options</h2>
          <p className="section-subtitle">
            Select the quantity that best matches your needs.
          </p>

          <div className="compare">
            <div className="compare-card">
              <strong>1 Unit</strong>
              <p>Try the product with a single unit.</p>
            </div>

            <div className="compare-card highlight">
              <strong>3 Units</strong>
              <p>Save 5% compared with the standard unit price.</p>
            </div>

            <div className="compare-card">
              <strong>6 Units</strong>
              <p>Save 10% compared with the standard unit price.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <h2 className="section-title">Shop with confidence</h2>

          <div className="trust">
            <div className="trust-item">
              <Icon name="check" size={22} />
              <strong>Secure checkout</strong>
              <span>Protected payment flow</span>
            </div>

            <div className="trust-item">
              <Icon name="check" size={22} />
              <strong>Clear pricing</strong>
              <span>No hidden product pricing</span>
            </div>

            <div className="trust-item">
              <Icon name="check" size={22} />
              <strong>Customer support</strong>
              <span>Help when you need it</span>
            </div>

            <div className="trust-item">
              <Icon name="check" size={22} />
              <strong>NewVelion</strong>
              <span>Marketplace infrastructure</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="support">
            <div className="support-card whatsapp">
              <h3>Need help before ordering?</h3>
              <p>
                Contact support if you have questions about this product,
                available options or your order.
              </p>

              <a className="support-button" href="https://wa.me/" target="_blank" rel="noreferrer">
                <Icon name="whatsapp" size={18} />
                Contact support
              </a>
            </div>

            <div className="support-card">
              <h3>Product details</h3>
              <p>{description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <h2 className="section-title">Customer reviews</h2>
          <p className="section-subtitle">
            Reviews published for this product.
          </p>

          {reviewCount > 0 ? (
            <div className="reviews">
              {[1, 2, 3].map((item) => (
                <article className="review" key={item}>
                  <div className="review-head">
                    <span className="review-name">Verified customer</span>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon key={star} name="star" size={13} />
                      ))}
                    </div>
                  </div>
                  <p>
                    Customer review content will appear here when reviews are
                    available for this product.
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-reviews">
              No reviews have been published for this product yet.
            </div>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Related products</h2>
            <p className="section-subtitle">
              Explore more products available on NewVelion.
            </p>

            <div className="related">
              {relatedProducts.map((related) => {
                const relatedImages = getImages(related);
                const relatedTitle = firstValue(
                  related,
                  ["nome", "title", "product_name"],
                  "Product",
                );
                const relatedPrice = toNumber(
                  firstValue(
                    related,
                    ["preco", "price", "sale_price", "valor"],
                    0,
                  ),
                );

                return (
                  <article className="related-card" key={related.id}>
                    <div className="related-image">
                      {relatedImages[0] && (
                        <img src={relatedImages[0]} alt={relatedTitle} />
                      )}
                    </div>

                    <div className="related-body">
                      <h3>{relatedTitle}</h3>
                      <div className="related-price">
                        {formatMoney(relatedPrice, currencySymbol)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="email-section">
        <div className="container">
          <div className="email-box">
            <h2>Stay updated</h2>
            <p>
              Get product updates, new offers and marketplace news from
              NewVelion.
            </p>

            <form
              className="email-form"
              onSubmit={(event) => {
                event.preventDefault();
                setToast("Thanks! You are on the list.");
              }}
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                aria-label="Your email address"
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <div className="brand">New<span>velion</span></div>
            <p>Commerce infrastructure.</p>
          </div>

          <div className="footer-links">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </footer>

      <a
        className="floating-whatsapp"
        href="https://wa.me/"
        target="_blank"
        rel="noreferrer"
        aria-label="Contact support on WhatsApp"
      >
        <Icon name="whatsapp" size={25} />
      </a>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
