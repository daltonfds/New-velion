"use client";

import { MapPin, ShieldCheck, Globe2, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Package,
  Percent,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { createPayjsrCheckout, getAffiliateProducts, getMarketplaceProduct, trackAffiliateClick, selectAffiliateProduct } from "@/lib/newvelion-api";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  supplier_id: string;
  category_id: string | null;
  name_en: string;
  name_pt: string;
  slug: string;
  short_description_en: string | null;
  short_description_pt: string | null;
  description_en: string | null;
  description_pt: string | null;
  image_url: string | null;
  price: number | null;
  currency: string | null;
  commission_percentage: number | null;
  stock: number | null;
  featured: boolean;
  offer: boolean;
  total_clicks: number;
  total_sales: number;
  total_conversions: number;
  total_commission: number;
  original_price: number | null;
  offer_price: number | null;
  product_page_url: string | null;
  categories?: {
    id: string;
    name_en: string;
    name_pt: string;
    slug: string;
  } | null;
  supplier?: {
    id: string | null;
    name: string | null;
    full_name: string | null;
    role: string | null;
    country: string | null;
    country_code: string | null;
    avatar_url: string | null;
    status: string | null;
    verification_status: string | null;
    company_type: string | null;
    company_id: string | null;
    company_name: string | null;
    legal_name: string | null;
    website: string | null;
    city: string | null;
    state_region: string | null;
    description: string | null;
    joined_at: string | null;
  } | null;
  product_materials?: Array<{
    id: string;
    title_en: string | null;
    title_pt: string | null;
    material_type: string;
    file_url: string;
  }>;
};

function money(value: number | null | undefined, currency = "ZAR") {
  if (value == null) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [affiliateOpen, setAffiliateOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const [isAffiliated, setIsAffiliated] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { slug } = await params;
        const response = await getMarketplaceProduct(slug);

        if (!cancelled) {
          setProduct(response?.data ?? null);

          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session && response?.data?.id) {
            try {
              const affiliateProducts = await getAffiliateProducts();
              const existing = affiliateProducts.find(
                (item: any) =>
                  item.product_id === response.data.id ||
                  item.product?.id === response.data.id
              );

              if (existing) {
                const code =
                  existing.referral_code ||
                  existing.affiliate_code ||
                  "";

                setIsAffiliated(true);
                setReferralCode(code);

                if (code) {
                  window.localStorage.setItem(
                    "newvelion_referral_code",
                    code
                  );
                }
              }
            } catch {
              // Seller affiliation lookup must never block the product page.
            }
          }
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError("Product not found.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [params]);

  const [referralCode, setReferralCode] = useState("");
  const affiliateCode = referralCode || "";

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");

    if (ref) {
      window.localStorage.setItem("newvelion_referral_code", ref);
      setReferralCode(ref);

      let visitorId = window.localStorage.getItem("newvelion_visitor_id");
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        window.localStorage.setItem("newvelion_visitor_id", visitorId);
      }

      let sessionId = window.sessionStorage.getItem("newvelion_session_id");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        window.sessionStorage.setItem("newvelion_session_id", sessionId);
      }

      trackAffiliateClick({
        referralCode: ref,
        destination: "product",
        visitorId,
        sessionId,
      }).catch((error) => {
        console.error("Affiliate click tracking failed:", error);
      });

      return;
    }

    const savedRef =
      window.localStorage.getItem("newvelion_referral_code") || "";

    if (savedRef) {
      setReferralCode(savedRef);
    }
  }, []);


  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
  
        {product.supplier && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Supplier / Producer
              </h2>
              {product.supplier.verification_status &&
                product.supplier.verification_status !== "unverified" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <ShieldCheck className="h-4 w-4" />
                    Verified
                  </span>
                )}
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
                {product.supplier.avatar_url ? (
                  <img
                    src={product.supplier.avatar_url}
                    alt={product.supplier.company_name || product.supplier.name || "Supplier"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-7 w-7 text-gray-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-gray-900">
                  {product.supplier.company_name || product.supplier.name || "Supplier"}
                </h3>

                {product.supplier.company_name &&
                  product.supplier.name &&
                  product.supplier.name !== product.supplier.company_name && (
                    <p className="mt-1 text-sm text-gray-500">
                      {product.supplier.name}
                    </p>
                  )}

                {(product.supplier.country || product.supplier.country_code) && (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    {product.supplier.country || product.supplier.country_code}
                    {product.supplier.city
                      ? ` · ${product.supplier.city}`
                      : ""}
                    {product.supplier.state_region
                      ? `, ${product.supplier.state_region}`
                      : ""}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.supplier.company_type && (
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Business type</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
                    {product.supplier.company_type}
                  </p>
                </div>
              )}

              {product.supplier.website && (
                <a
                  href={product.supplier.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                >
                  <Globe2 className="h-4 w-4" />
                  Company website
                </a>
              )}
            </div>

            {product.supplier.description && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm leading-6 text-gray-600">
                  {product.supplier.description}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="aspect-[4/3] animate-pulse rounded-3xl bg-slate-200" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-20 animate-pulse rounded bg-slate-200" />
              <div className="h-32 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <Package className="mx-auto text-slate-300" size={48} />
          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Product not found
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This product may no longer be available.
          </p>
          <Link
            href="/marketplace"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const price = Number(product.offer_price ?? product.price ?? 0);
  const originalPrice =
    product.original_price != null
      ? Number(product.original_price)
      : null;

  const commission = Number(product.commission_percentage ?? 0);
  const commissionAmount = price * (commission / 100);

  const conversionRate =
    product.total_clicks > 0
      ? (product.total_conversions / product.total_clicks) * 100
      : 0;

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "";

  const productLink = referralCode
    ? `${baseUrl}/marketplace/products/${product.slug}?ref=${encodeURIComponent(referralCode)}`
    : `${baseUrl}/marketplace/products/${product.slug}`;

  const checkoutLink = "";

  const materialsLink = referralCode
    ? `${baseUrl}/marketplace/products/${product.slug}?ref=${encodeURIComponent(referralCode)}#materials`
    : `${baseUrl}/marketplace/products/${product.slug}#materials`;

  async function handleAffiliateClick() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const result = await selectAffiliateProduct({
        productId: product.id,
        token: session.access_token,
      });

      const affiliateData = result?.data || result;
      const referralCode =
        affiliateData?.referral_code ||
        result?.referral_code ||
        "";

      setIsAffiliated(true);

      if (referralCode) {
        setReferralCode(referralCode);
        window.localStorage.setItem(
          "newvelion_referral_code",
          referralCode,
        );
      }

      setAffiliateOpen(true);
    } catch (error) {
      console.error("Affiliate product selection failed:", error);
      setAffiliateOpen(true);
    }
  }

  async function copyLink(type: string, value: string) {
    if (!value) return;

    await navigator.clipboard.writeText(value);
    setCopied(type);

    window.setTimeout(() => {
      setCopied("");
    }, 1800);
  }

  async function handleCheckoutClick() {
    if (!affiliateCode) {
      setAffiliateOpen(true);
      return;
    }

    setCheckoutLoading(true);

    try {
      const visitorId =
        window.localStorage.getItem("newvelion_visitor_id") || undefined;

      const sessionId =
        window.sessionStorage.getItem("newvelion_session_id") || undefined;

      await trackAffiliateClick({
        referralCode: affiliateCode,
        destination: "checkout",
        visitorId,
        sessionId,
      });

      const result = await createPayjsrCheckout({
        referralCode: affiliateCode,
      });

      const url =
        result?.checkout_url ||
        result?.data?.checkout_url ||
        "";

      if (!url) {
        throw new Error("PayJSR did not return a checkout URL.");
      }

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("PayJSR checkout failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create checkout."
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Marketplace
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-[4/3] bg-slate-100">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name_en || product.name_pt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package size={64} className="text-slate-300" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Product description
              </p>

              <h2 className="mt-3 text-xl font-bold text-slate-900">
                About this product
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {product.description_en ||
                  product.description_pt ||
                  product.short_description_en ||
                  product.short_description_pt ||
                  "No description available."}
              </p>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {product.featured && (
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                    Featured
                  </span>
                )}

                {product.offer && (
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    Offer
                  </span>
                )}

                {product.categories && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {product.categories.name_en ||
                      product.categories.name_pt}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                {product.name_en || product.name_pt}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {product.short_description_en ||
                  product.short_description_pt ||
                  "Discover this product in the Newvelion Marketplace."}
              </p>

              <div className="mt-6 flex items-end gap-3">
                <span className="text-3xl font-bold text-slate-900">
                  {money(price, product.currency || "ZAR")}
                </span>

                {originalPrice && originalPrice > price && (
                  <span className="mb-1 text-sm text-slate-400 line-through">
                    {money(originalPrice, product.currency || "ZAR")}
                  </span>
                )}
              </div>

              <div className="mt-6 rounded-2xl bg-blue-50 p-5">
                <div className="flex items-center gap-2 text-blue-600">
                  <Percent size={18} />
                  <span className="text-sm font-bold">
                    Affiliate commission
                  </span>
                </div>

                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">
                      {commission.toFixed(0)}%
                    </p>
                    <p className="mt-1 text-xs text-blue-600">
                      per sale
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      {money(
                        commissionAmount,
                        product.currency || "ZAR",
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      estimated earnings
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <Users size={18} className="text-slate-400" />
                  <p className="mt-3 text-xl font-bold text-slate-900">
                    {product.total_clicks}
                  </p>
                  <p className="text-xs text-slate-500">Clicks</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <TrendingUp size={18} className="text-slate-400" />
                  <p className="mt-3 text-xl font-bold text-slate-900">
                    {conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500">Conversion</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">Total sales</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {product.total_sales}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">Stock</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {product.stock == null ? "Available" : product.stock}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleAffiliateClick}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <ShoppingCart size={18} />
                  {isAffiliated
                    ? "Affiliated on This Product"
                    : "Affiliate This Product"}
                </button>

                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  disabled={checkoutLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                >
                  {checkoutLoading ? "Creating secure checkout..." : "Checkout"}
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>

            {product.product_materials &&
              product.product_materials.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">
                    Promotional materials
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Available materials for affiliates.
                  </p>

                  <div className="mt-4 space-y-2">
                    {product.product_materials.map((material) => (
                      <button
                        key={material.id}
                        type="button"
                        onClick={async () => {
                          if (Boolean(affiliateCode)) {
                            const visitorId =
                              window.localStorage.getItem(
                                "newvelion_visitor_id",
                              ) || undefined;

                            const sessionId =
                              window.sessionStorage.getItem(
                                "newvelion_session_id",
                              ) || undefined;

                            try {
                              await trackAffiliateClick({
                                referralCode: affiliateCode,
                                destination: "materials",
                                materialId: material.id,
                                visitorId,
                                sessionId,
                              });
                            } catch (error) {
                              console.error(
                                "Material click tracking failed:",
                                error,
                              );
                            }
                          }

                          window.open(
                            material.file_url,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {material.title_en ||
                              material.title_pt ||
                              "Promotional material"}
                          </p>
                          <p className="mt-0.5 text-xs capitalize text-slate-400">
                            {material.material_type}
                          </p>
                        </div>

                        <ExternalLink
                          size={16}
                          className="text-slate-400"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </aside>
        </div>
      </div>

      {affiliateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Your Affiliate Links
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Use these links to promote this product and track your sales.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAffiliateOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-400 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {[
                ["Product page", productLink, "product"],
                ["Promotional materials", materialsLink, "materials"],
              ].map(([label, value, type]) => (
                <div key={type} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {label}
                  </p>

                  <div className="mt-2 flex gap-2">
                    <input
                      readOnly
                      value={value}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => copyLink(type, value)}
                      disabled={!value}
                      className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {copied === type ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!affiliateCode && (
              <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
                Your affiliate referral code is not configured yet. Once your
                affiliate account is connected, these links will use your real
                referral code automatically.
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
