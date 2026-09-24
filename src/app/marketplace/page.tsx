"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter,
  Grid3X3,
  Heart,
  List,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  MapPin,
} from "lucide-react";
import {
  getMarketplaceCategories,
  getMarketplaceProducts,
  selectAffiliateProduct,
  type MarketplaceProduct,
} from "@/lib/newvelion-api";
import { supabase } from "@/lib/supabase";

type SortOption = "popular" | "commission" | "newest" | "price";

function money(value: number | null | undefined, currency = "ZAR") {
  if (value == null) return "—";

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function getProductName(product: MarketplaceProduct) {
  return product.name_en || product.name_pt || "Untitled product";
}

function getProductDescription(product: MarketplaceProduct) {
  return (
    product.short_description_en ||
    product.short_description_pt ||
    product.description_en ||
    product.description_pt ||
    "No description available."
  );
}

function commissionAmount(product: MarketplaceProduct) {
  const price = Number(product.offer_price ?? product.price ?? 0);
  const commission = Number(product.commission_percentage ?? 0);

  return price * (commission / 100);
}

export default function MarketplacePage() {
  const router = useRouter();
  const [affiliateLoading, setAffiliateLoading] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  async function handleAffiliate(product: MarketplaceProduct) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    setAffiliateLoading(product.id);

    try {
      await selectAffiliateProduct({
        productId: product.id,
        token: session.access_token,
      });

      setSelectedProducts((current) =>
        current.includes(product.id)
          ? current
          : [...current, product.id],
      );

      router.push(`/marketplace/products/${product.slug}`);
    } catch (error) {
      console.error("Affiliate product selection failed:", error);
      alert("Unable to select this product for affiliate promotion.");
    } finally {
      setAffiliateLoading(null);
    }
  }

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "All Categories",
  ]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState<SortOption>("popular");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [offersOnly, setOffersOnly] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMarketplace() {
      setLoading(true);
      setError("");

      try {
        const [productResponse, categoryResponse] = await Promise.all([
          getMarketplaceProducts({
            q: search.trim() || undefined,
            category:
              category !== "All Categories" ? category : undefined,
            featured: featuredOnly || undefined,
            offer: offersOnly || undefined,
            sort,
            limit: 100,
          }),
          getMarketplaceCategories(),
        ]);

        if (cancelled) return;

        setProducts(productResponse.data || []);

        const categoryData = Array.isArray(categoryResponse)
          ? categoryResponse
          : categoryResponse.data || [];

        setCategories([
          "All Categories",
          ...categoryData
            .map((item) => {
              if (typeof item === "string") return item;

              if (item && typeof item === "object") {
                const category = item as {
                  name_en?: string;
                  name_pt?: string;
                  name?: string;
                };

                return (
                  category.name_en ||
                  category.name_pt ||
                  category.name
                );
              }

              return undefined;
            })
            .filter(Boolean),
        ]);
      } catch (err) {
        if (cancelled) return;

        console.error(err);
        setError(
          "Unable to load marketplace products. Please check your connection and try again.",
        );
        setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMarketplace();

    return () => {
      cancelled = true;
    };
  }, [search, category, sort, featuredOnly, offersOnly]);

  const visibleProducts = useMemo(() => products, [products]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1500px] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[30px] bg-[#3B2FE0] shadow-[0_20px_60px_rgba(59,47,224,0.18)]">
          <div className="relative px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                <TrendingUp size={14} />
                SELLER MARKETPLACE
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Find products.
                <br />
                Start selling.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                Discover active products from NewVelion suppliers, choose
                offers with the right commission, and promote them through
                your affiliate links.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOffersOnly(false);
                    setFeaturedOnly(true);
                    window.scrollTo({ top: 500, behavior: "smooth" });
                  }}
                  className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#3B2FE0] transition hover:bg-white/90"
                >
                  Explore featured
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFeaturedOnly(false);
                    setOffersOnly(true);
                    window.scrollTo({ top: 500, behavior: "smooth" });
                  }}
                  className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  View offers
                </button>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-36 right-20 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl" />
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B2FE0]">
                Browse
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#1A1A2E]">
                Categories
              </h2>
            </div>

            <div className="hidden text-sm text-[#9CA3AF] sm:block">
              {loading ? "Loading..." : `${visibleProducts.length} products`}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
            {categories.map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#3B2FE0] text-white shadow-sm"
                      : "border border-[#e7e7ef] bg-white text-[#6B7280] hover:border-[#cfcdf7] hover:text-[#3B2FE0]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-[#ececf3] bg-[#F8F8FB] p-3 sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar produtos..."
                className="h-12 w-full rounded-xl border border-[#e7e7ef] bg-white pl-11 pr-4 text-sm text-[#1A1A2E] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#3B2FE0]"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1 sm:min-w-[190px]">
                <Filter
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-[#e7e7ef] bg-white pl-10 pr-10 text-sm font-medium text-[#4B5563] outline-none focus:border-[#3B2FE0]"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />
              </div>

              <div className="relative min-w-0 flex-1 sm:min-w-[190px]">
                <ArrowUpDown
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-[#e7e7ef] bg-white pl-10 pr-10 text-sm font-medium text-[#4B5563] outline-none focus:border-[#3B2FE0]"
                >
                  <option value="popular">Most Popular</option>
                  <option value="commission">Highest Commission</option>
                  <option value="newest">Newest</option>
                  <option value="price">Lowest Price</option>
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFeaturedOnly((value) => !value)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  featuredOnly
                    ? "bg-[#3B2FE0] text-white"
                    : "border border-[#e7e7ef] bg-white text-[#6B7280] hover:text-[#3B2FE0]"
                }`}
              >
                Featured
              </button>

              <button
                type="button"
                onClick={() => setOffersOnly((value) => !value)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  offersOnly
                    ? "bg-[#3B2FE0] text-white"
                    : "border border-[#e7e7ef] bg-white text-[#6B7280] hover:text-[#3B2FE0]"
                }`}
              >
                Offers
              </button>

              <div className="hidden items-center rounded-xl border border-[#e7e7ef] bg-white p-1 sm:flex">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={`rounded-lg p-2.5 ${
                    view === "grid"
                      ? "bg-[#F1EFFF] text-[#3B2FE0]"
                      : "text-[#9CA3AF] hover:text-[#3B2FE0]"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3X3 size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`rounded-lg p-2.5 ${
                    view === "list"
                      ? "bg-[#F1EFFF] text-[#3B2FE0]"
                      : "text-[#9CA3AF] hover:text-[#3B2FE0]"
                  }`}
                  aria-label="List view"
                >
                  <List size={17} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-5 mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3B2FE0]">
              Live marketplace
            </p>

            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1A1A2E]">
              Products to promote
            </h2>

            {!loading && (
              <p className="mt-1 text-sm text-[#9CA3AF]">
                {visibleProducts.length} active products available
              </p>
            )}
          </div>

          <div className="text-sm font-medium text-[#9CA3AF] sm:hidden">
            {loading ? "Loading..." : `${visibleProducts.length}`}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[22px] border border-[#ececf3] bg-white"
              >
                <div className="aspect-[16/10] animate-pulse bg-[#F1F1F6]" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#F1F1F6]" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-[#F1F1F6]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[#F1F1F6]" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-[#F1F1F6]" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#dcdce8] bg-[#FAFAFC] px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1EFFF] text-[#3B2FE0]">
              <Search size={24} />
            </div>

            <h2 className="text-lg font-bold text-[#1A1A2E]">
              No products found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-[#9CA3AF]">
              Try another search, category, or filter.
            </p>
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                : "space-y-4"
            }
          >
            {visibleProducts.map((product) => {
              const price = Number(
                product.offer_price ?? product.price ?? 0,
              );

              const originalPrice =
                product.original_price != null
                  ? Number(product.original_price)
                  : null;

              const commission = Number(
                product.commission_percentage ?? 0,
              );

              const earnings = commissionAmount(product);
              const selected = selectedProducts.includes(product.id);

              const cardContent = (
                <>
                  <div
                    className={
                      view === "grid"
                        ? "relative aspect-[16/10] overflow-hidden bg-[#F1F1F6]"
                        : "relative h-44 w-full shrink-0 overflow-hidden bg-[#F1F1F6] sm:w-56"
                    }
                  >
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={getProductName(product)}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F1EFFF] to-[#F7F7FA]">
                        <TrendingUp
                          className="text-[#C9C5FF]"
                          size={44}
                        />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      {product.featured && (
                        <span className="rounded-full bg-[#3B2FE0] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                          Featured
                        </span>
                      )}

                      {product.offer && (
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#3B2FE0] shadow-sm">
                          Special offer
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      aria-label="Save product"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#6B7280] shadow-sm backdrop-blur transition hover:text-[#3B2FE0]"
                    >
                      <Heart size={17} />
                    </button>
                  </div>

                  <div
                    className={
                      view === "grid"
                        ? "p-5"
                        : "flex min-w-0 flex-1 flex-col justify-center p-5"
                    }
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-[#3B2FE0]">
                        {product.categories?.name_en ||
                          product.categories?.name_pt ||
                          "Marketplace"}
                      </span>

                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#9CA3AF]">
                        <Star
                          size={13}
                          fill="currentColor"
                          className="text-[#F59E0B]"
                        />
                        {product.total_sales || 0} sales
                      </span>
                    </div>

                    <h2 className="line-clamp-2 text-lg font-extrabold leading-6 text-[#1A1A2E]">
                      {getProductName(product)}
                    </h2>

                    {product.supplier && (
                      <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#eeeef5] bg-[#FAFAFC] px-3 py-2.5">
                        {product.supplier.avatar_url ? (
                          <img
                            src={product.supplier.avatar_url}
                            alt={product.supplier.company_name || product.supplier.name || "Supplier"}
                            className="h-9 w-9 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1EFFF] text-sm font-extrabold text-[#3B2FE0]">
                            {(product.supplier.company_name ||
                              product.supplier.name ||
                              "S")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs font-bold text-[#1A1A2E]">
                              {product.supplier.company_name ||
                                product.supplier.name ||
                                "Supplier"}
                            </p>

                            {product.supplier.verification_status &&
                              product.supplier.verification_status !== "unverified" && (
                                <ShieldCheck
                                  size={14}
                                  className="shrink-0 text-[#3B2FE0]"
                                />
                              )}
                          </div>

                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                            <MapPin size={11} />
                            <span className="truncate">
                              {product.supplier.country ||
                                product.supplier.country_code ||
                                "Country not specified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#9CA3AF]">
                      {getProductDescription(product)}
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-medium text-[#9CA3AF]">
                          Product price
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-lg font-extrabold text-[#1A1A2E]">
                            {money(price, product.currency || "ZAR")}
                          </span>

                          {originalPrice && originalPrice > price && (
                            <span className="text-xs text-[#9CA3AF] line-through">
                              {money(
                                originalPrice,
                                product.currency || "ZAR",
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] font-medium text-[#9CA3AF]">
                          Commission
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-[#3B2FE0]">
                          {commission.toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#f0f0f5] pt-4 text-xs">
                      <span className="flex items-center gap-1.5 text-[#9CA3AF]">
                        <Users size={14} />
                        {product.total_clicks || 0} clicks
                      </span>

                      <span className="font-bold text-emerald-600">
                        Earn {money(earnings, product.currency || "ZAR")}
                      </span>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <a
                        href={
                          product.product_page_url ||
                          `/marketplace/products/${product.slug}`
                        }
                        className="flex-1 rounded-xl border border-[#dedee8] px-4 py-3 text-center text-sm font-bold text-[#4B5563] transition hover:border-[#3B2FE0] hover:text-[#3B2FE0]"
                      >
                        View details
                      </a>

                      <button
                        type="button"
                        onClick={() => handleAffiliate(product)}
                        disabled={affiliateLoading === product.id}
                        className="flex-1 rounded-xl bg-[#3B2FE0] px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#3025C0] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {affiliateLoading === product.id
                          ? "Selecting..."
                          : selected
                            ? "Selected"
                            : "Promote"}
                      </button>
                    </div>

                    {selected && (
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <Check size={14} />
                        Added to your affiliate products
                      </div>
                    )}
                  </div>
                </>
              );

              return (
                <article
                  key={product.id}
                  className={`group overflow-hidden rounded-[22px] border border-[#ececf3] bg-white shadow-[0_4px_20px_rgba(26,26,46,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(26,26,46,0.10)] ${
                    view === "list" ? "flex flex-col sm:flex-row" : ""
                  }`}
                >
                  {cardContent}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
