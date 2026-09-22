"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  Grid3X3,
  List,
  Search,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getMarketplaceCategories,
  getMarketplaceProducts,
  type MarketplaceProduct,
} from "@/lib/newvelion-api";

type SortOption = "popular" | "commission" | "newest" | "price";

function money(value: number | null | undefined, currency = "USD") {
  if (value == null) return "—";

  return new Intl.NumberFormat("en-US", {
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
                return category.name_en || category.name_pt || category.name;
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

  const visibleProducts = useMemo(() => {
    return products;
  }, [products]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold text-blue-600">
                Newvelion Marketplace
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Find products to sell
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Discover products, check commission opportunities, and choose
                offers that fit your business.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`rounded-xl border p-2.5 ${
                  view === "grid"
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
                aria-label="Grid view"
              >
                <Grid3X3 size={18} />
              </button>

              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded-xl border p-2.5 ${
                  view === "list"
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div className="relative min-w-[220px]">
              <Filter
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative min-w-[190px]">
              <ArrowUpDown
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortOption)
                }
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none focus:border-blue-400 focus:bg-white"
              >
                <option value="popular">Most Popular</option>
                <option value="commission">Highest Commission</option>
                <option value="newest">Newest</option>
                <option value="price">Lowest Price</option>
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFeaturedOnly((value) => !value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                featuredOnly
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Featured
            </button>

            <button
              type="button"
              onClick={() => setOffersOnly((value) => !value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                offersOnly
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Offers
            </button>
          </div>
        </section>

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {loading
                ? "Loading products..."
                : `${visibleProducts.length} products available`}
            </p>
            {!loading && (
              <p className="mt-1 text-xs text-slate-500">
                Updated from the Newvelion marketplace
              </p>
            )}
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
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="aspect-[16/9] animate-pulse bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search size={24} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              No products found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
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

              const cardContent = (
                <>
                  <div
                    className={
                      view === "grid"
                        ? "relative aspect-[16/9] overflow-hidden bg-slate-100"
                        : "relative h-40 w-56 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                    }
                  >
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={getProductName(product)}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                        <TrendingUp className="text-blue-200" size={42} />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      {product.featured && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white">
                          Featured
                        </span>
                      )}
                      {product.offer && (
                        <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">
                          Offer
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className={
                      view === "grid"
                        ? "p-5"
                        : "flex min-w-0 flex-1 flex-col justify-center p-5"
                    }
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="truncate text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {product.categories?.name_en ||
                          product.categories?.name_pt ||
                          "Marketplace"}
                      </span>

                      <div className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
                        <Star size={13} fill="currentColor" />
                        {product.total_sales || 0} sales
                      </div>
                    </div>

                    <h2 className="line-clamp-2 text-lg font-bold text-slate-900">
                      {getProductName(product)}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {getProductDescription(product)}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-medium text-slate-400">
                          Product price
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900">
                            {money(price, product.currency || "USD")}
                          </span>
                          {originalPrice &&
                            originalPrice > price && (
                              <span className="text-xs text-slate-400 line-through">
                                {money(
                                  originalPrice,
                                  product.currency || "USD",
                                )}
                              </span>
                            )}
                        </div>
                      </div>

                      <div className="rounded-xl bg-blue-50 p-3">
                        <p className="text-[11px] font-medium text-blue-500">
                          Your commission
                        </p>
                        <p className="mt-1 text-base font-bold text-blue-700">
                          {commission.toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} />
                        {product.total_clicks || 0} clicks
                      </span>

                      <span className="font-semibold text-emerald-600">
                        Earn {money(earnings, product.currency || "USD")}
                      </span>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <a
                        href={
                          product.product_page_url ||
                          `/marketplace/products/${product.slug}`
                        }
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        View Product
                      </a>

                      <a
                        href={product.checkout_url || "#"}
                        target={product.checkout_url ? "_blank" : undefined}
                        rel={
                          product.checkout_url
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className={`flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white transition ${
                          product.checkout_url
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "cursor-not-allowed bg-slate-300"
                        }`}
                        aria-disabled={!product.checkout_url}
                      >
                        Affiliate
                      </a>
                    </div>
                  </div>
                </>
              );

              return (
                <article
                  key={product.id}
                  className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                    view === "list"
                      ? "flex flex-col sm:flex-row"
                      : ""
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
