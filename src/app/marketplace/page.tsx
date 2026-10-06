"use client";
import { formatCurrency } from "@/lib/currency";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { getActiveProducts } from "@/lib/services/products";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

interface Category {
  id: string;
  nome: string;
  slug: string;
  icone: string | null;
  ordem: number;
  created_at: string;
  parent_id: string | null;
}

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(value);
}

export default function MarketplacePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [subcategoryId, setSubcategoryId] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [affiliating, setAffiliating] = useState<string | null>(null);
  const [pricingProduct, setPricingProduct] = useState<Product | null>(null);
  const [salePrice, setSalePrice] = useState("");
  const [affiliateLinks, setAffiliateLinks] = useState<Record<string, string>>(
    {}
  );
  const [copiedProduct, setCopiedProduct] = useState<string | null>(null);
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedView = window.localStorage.getItem(
      "newvelion-seller-marketplace-view",
    );

    if (savedView === "grid" || savedView === "list") {
      setViewMode(savedView);
    }

    async function loadMarketplace() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (profile?.role === "admin") {
          router.replace("/dashboard/admin");
          return;
        }

        const [productData, categoryResult] = await Promise.all([
          getActiveProducts(),
          supabase
            .from("categories")
            .select("id, nome, slug, icone, ordem, created_at, parent_id")
            .order("ordem", { ascending: true })
            .order("nome", { ascending: true }),
        ]);

        if (categoryResult.error) {
          throw categoryResult.error;
        }

        setProducts(productData.filter((product) => product.moeda === "ZAR"));
        setCategories((categoryResult.data ?? []) as Category[]);

        const { data: affiliations, error: affiliationError } = await supabase
          .from("affiliations")
          .select("product_id, link_unico")
          .eq("vendedor_id", user.id)
          .eq("ativo", true);

        if (affiliationError) {
          throw affiliationError;
        }

        const existingLinks: Record<string, string> = {};

        for (const affiliation of affiliations ?? []) {
          const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL ||
            window.location.origin;

          existingLinks[affiliation.product_id] =
            `${baseUrl.replace(/\/$/, "")}/${affiliation.link_unico}`;
        }

        setAffiliateLinks(existingLinks);
      } catch (err) {
        console.error("Failed to load marketplace:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load marketplace."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadMarketplace();
  }, [router]);

  const parentCategories = categories
    .filter((category) => !category.parent_id)
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  const visibleSubcategories = categories
    .filter(
      (category) =>
        category.parent_id === categoryId &&
        category.parent_id !== null
    )
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));


const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.nome.toLowerCase().includes(normalizedSearch) ||
        product.descricao?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryId === "all" || product.categoria_id === categoryId;

      const matchesSubcategory =
        subcategoryId === "all" ||
        product.subcategoria_id === subcategoryId;

      const matchesFeatured = !featuredOnly || product.destaque;
      const matchesNew = !newOnly || product.novo;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
        matchesFeatured &&
        matchesNew
      );
    });
  }, [
    products,
    search,
    categoryId,
    subcategoryId,
    featuredOnly,
    newOnly,
  ]);

  async function handleAffiliate(productId: string) {
    try {
      setError(null);
      setAffiliating(productId);

      const { data, error } = await supabase.rpc("create_affiliation_with_price", {\n        p_product_id: productId,\n        p_sale_price: pricingProduct?.pricing_mode === "custom" ? Number(salePrice) : null,\n      });
      if (error) throw new Error(error.message);
      const result = { affiliate_link: data?.affiliate_link ?? data?.[0]?.affiliate_link };

      if (!result.affiliate_link) throw new Error("Affiliate link was not returned.");
      setAffiliateLinks((current) => ({
        ...current,
        [productId]: result.affiliate_link,
      }));
    } catch (err) {
      console.error("Failed to create affiliation:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create affiliate link."
      );
    } finally {
      setAffiliating(null);
      setPricingProduct(null);
      setSalePrice("");
    }
  }

  async function handleCopy(productId: string) {
    const link = affiliateLinks[productId];

    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopiedProduct(productId);

      window.setTimeout(() => {
        setCopiedProduct((current) =>
          current === productId ? null : current
        );
      }, 2000);
    } catch (err) {
      console.error("Failed to copy affiliate link:", err);
      setError("Could not copy the affiliate link.");
    }
  }

  async function handleShare(product: Product) {
    const link = affiliateLinks[product.id];

    if (!link) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.nome,
          text: `Check out ${product.nome}`,
          url: link,
        });
      } catch {
        // User cancelled the share dialog.
      }

      return;
    }

    await handleCopy(product.id);
  }

  function getCategoryName(product: Product) {
    return (
      categories.find((category) => category.id === product.categoria_id)
        ?.nome ?? "Uncategorized"
    );
  }

  return (
    <AppShell area="seller">
      <div className="space-y-7">
        <section className="overflow-hidden rounded-xl bg-[#3730d9] px-7 py-7 text-white lg:px-9 lg:py-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-100">
                Seller marketplace
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Find products to sell
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                Browse products published by suppliers and choose the offers
                you want to promote.
              </p>

              <div className="mt-6 flex items-center gap-3 text-sm font-semibold">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/30">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m4 7 8-4 8 4-8 4-8-4Z" />
                    <path d="M4 7v10l8 4 8-4V7" />
                    <path d="M12 11v10" />
                  </svg>
                </span>
                {loading
                  ? "Loading products..."
                  : `${filteredProducts.length} available products`}
              </div>
            </div>

            <div className="hidden min-w-[250px] border-l border-white/25 pl-8 lg:block">
              <svg
                width="58"
                height="58"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="text-white"
              >
                <path d="M8 28h48" />
                <path d="M12 28v24h40V28" />
                <path d="M8 28 16 12h32l8 16" />
                <path d="M20 28v7a6 6 0 0 0 12 0v-7" />
                <path d="M32 28v7a6 6 0 0 0 12 0v-7" />
                <path d="M20 52h24" />
                <circle cx="51" cy="48" r="8" fill="#3730d9" />
                <path d="M51 44v8M47 48h8" />
              </svg>

              <h2 className="mt-4 text-lg font-semibold">
                Marketplace
              </h2>
              <p className="mt-1 text-sm leading-5 text-indigo-100">
                Discover products available for promotion.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <Card>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          </Card>
        )}

        <Card className="border-slate-200 bg-white p-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
                <input
                  id="marketplace-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products, categories..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </div>
              <select
                id="marketplace-category"
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setSubcategoryId("all");
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 lg:w-56"
              >
                <option value="all">All categories</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nome}
                  </option>
                ))}
              </select>
              <select
                id="marketplace-subcategory"
                value={subcategoryId}
                onChange={(event) => setSubcategoryId(event.target.value)}
                disabled={categoryId === "all" || visibleSubcategories.length === 0}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 lg:w-64"
              >
                <option value="all">
                  {categoryId === "all"
                    ? "Select a category first"
                    : visibleSubcategories.length === 0
                      ? "No subcategories"
                      : "All subcategories"}
                </option>

                {visibleSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.nome}
                  </option>
                ))}
              </select>

            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 px-5 py-3">
            <button type="button" onClick={() => setFeaturedOnly((current) => !current)}
              className={`rounded-md border px-3.5 py-2 text-sm font-medium transition ${featuredOnly ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
              Featured
            </button>
            <button type="button" onClick={() => setNewOnly((current) => !current)}
              className={`rounded-md border px-3.5 py-2 text-sm font-medium transition ${newOnly ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
              New
            </button>
            {(search || categoryId !== "all" || featuredOnly || newOnly) && (
              <button type="button" onClick={() => { setSearch(""); setCategoryId("all"); setSubcategoryId("all"); setFeaturedOnly(false); setNewOnly(false); }}
                className="ml-auto px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs font-medium text-slate-500">
              {loading ? "Loading products..." : `${filteredProducts.length} products`}
            </p>

            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => {
                  setViewMode("grid");
                  window.localStorage.setItem(
                    "newvelion-seller-marketplace-view",
                    "grid",
                  );
                }}
                aria-label="Grid view"
                className={`flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium transition ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <rect x="4" y="4" width="6" height="6" rx="1" />
                  <rect x="14" y="4" width="6" height="6" rx="1" />
                  <rect x="4" y="14" width="6" height="6" rx="1" />
                  <rect x="14" y="14" width="6" height="6" rx="1" />
                </svg>
                Grid
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode("list");
                  window.localStorage.setItem(
                    "newvelion-seller-marketplace-view",
                    "list",
                  );
                }}
                aria-label="List view"
                className={`flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium transition ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M8 6h13" />
                  <path d="M8 12h13" />
                  <path d="M8 18h13" />
                  <path d="M3 6h.01" />
                  <path d="M3 12h.01" />
                  <path d="M3 18h.01" />
                </svg>
                List
              </button>
            </div>
          </div>

          <div className="hidden">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto_auto]">
            <div>
              <label
                htmlFor="marketplace-search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Search products
              </label>

              <input
                id="marketplace-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by product name..."
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="marketplace-category"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Category
              </label>

              <select
                id="marketplace-category"
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setSubcategoryId("all");
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">All categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nome}
                  </option>
                ))}
              </select>


            </div>

            <button
              type="button"
              onClick={() => setFeaturedOnly((current) => !current)}
              className={`self-end rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                featuredOnly
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Featured
            </button>

            <button
              type="button"
              onClick={() => setNewOnly((current) => !current)}
              className={`self-end rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                newOnly
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              New
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} product${
                    filteredProducts.length === 1 ? "" : "s"
                  } found`}
            </p>

            {(search || categoryId !== "all" || featuredOnly || newOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryId("all"); setSubcategoryId("all");
                  setFeaturedOnly(false);
                  setNewOnly(false);
                }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
        </Card>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Card key={item}>
                <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
                <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-gray-100" />
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card>
            <div className="py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl text-indigo-600">
                ▦
              </div>

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                No products available yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Products published by Newvelion will appear here when they
                become available for sellers.
              </p>
            </div>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <div className="py-16 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                No matching products
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Try changing your search or clearing the selected filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryId("all"); setSubcategoryId("all");
                  setFeaturedOnly(false);
                  setNewOnly(false);
                }}
                className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Clear filters
              </button>
            </div>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            {filteredProducts.map((product) => {
              const price =
                product.preco_promocional ?? product.preco;

              const commission =
                product.comissao_tipo === "percentual"
                  ? (price * product.comissao_valor) / 100
                  : product.comissao_valor;

              const affiliateLink = affiliateLinks[product.id];
              const isAffiliating = affiliating === product.id;

              return (
                <Card
                  key={product.id}
                  className={
                    viewMode === "grid"
                      ? "overflow-hidden border-slate-200 bg-white p-0 shadow-none transition hover:border-slate-300"
                      : "overflow-hidden border-slate-200 bg-white p-0 shadow-none transition hover:border-slate-300 md:flex"
                  }
                >
                  <div
                    className={
                      viewMode === "grid"
                        ? "relative h-56 overflow-hidden border-b border-slate-100 bg-slate-50"
                        : "relative h-56 overflow-hidden border-b border-slate-100 bg-slate-50 md:h-auto md:w-64 md:shrink-0 md:border-b-0 md:border-r"
                    }
                  >
                    {product.fotos?.length > 0 ? (
                      <>
                        <div
                          id={`product-images-${product.id}`}
                          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                          onScroll={(event) => {
                            const element = event.currentTarget;
                            const width = element.clientWidth;

                            if (!width) return;

                            const index = Math.round(
                              element.scrollLeft / width
                            );

                            setImageIndexes((current) => ({
                              ...current,
                              [product.id]: Math.min(
                                index,
                                product.fotos.length - 1
                              ),
                            }));
                          }}
                        >
                          {product.fotos.map((image, index) => (
                            <div
                              key={`${image}-${index}`}
                              className="h-full min-w-full snap-center"
                            >
                              <img
                                src={image}
                                alt={`${product.nome} image ${index + 1}`}
                                className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                              />
                            </div>
                          ))}
                        </div>

                        {product.fotos.length > 1 && (
                          <>
                            <button
                              type="button"
                              aria-label="Previous product image"
                              onClick={() => {
                                const currentIndex =
                                  imageIndexes[product.id] ?? 0;
                                const nextIndex =
                                  currentIndex === 0
                                    ? product.fotos.length - 1
                                    : currentIndex - 1;

                                const container = document.getElementById(
                                  `product-images-${product.id}`
                                );

                                container?.scrollTo({
                                  left: container.clientWidth * nextIndex,
                                  behavior: "smooth",
                                });

                                setImageIndexes((current) => ({
                                  ...current,
                                  [product.id]: nextIndex,
                                }));
                              }}
                              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-700 shadow-none transition hover:bg-slate-50"
                            >
                              ‹
                            </button>

                            <button
                              type="button"
                              aria-label="Next product image"
                              onClick={() => {
                                const currentIndex =
                                  imageIndexes[product.id] ?? 0;
                                const nextIndex =
                                  currentIndex === product.fotos.length - 1
                                    ? 0
                                    : currentIndex + 1;

                                const container = document.getElementById(
                                  `product-images-${product.id}`
                                );

                                container?.scrollTo({
                                  left: container.clientWidth * nextIndex,
                                  behavior: "smooth",
                                });

                                setImageIndexes((current) => ({
                                  ...current,
                                  [product.id]: nextIndex,
                                }));
                              }}
                              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-700 shadow-none transition hover:bg-slate-50"
                            >
                              ›
                            </button>

                            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5">
                              {product.fotos.map((_, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  aria-label={`Show image ${index + 1}`}
                                  onClick={() => {
                                    const container = document.getElementById(
                                      `product-images-${product.id}`
                                    );

                                    container?.scrollTo({
                                      left: container.clientWidth * index,
                                      behavior: "smooth",
                                    });

                                    setImageIndexes((current) => ({
                                      ...current,
                                      [product.id]: index,
                                    }));
                                  }}
                                  className={`h-1.5 rounded-full transition-all ${
                                    (imageIndexes[product.id] ?? 0) === index
                                      ? "w-5 bg-white"
                                      : "w-1.5 bg-white/60"
                                  }`}
                                />
                              ))}
                            </div>

                            <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
                              {(imageIndexes[product.id] ?? 0) + 1}/
                              {product.fotos.length}
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-sm text-gray-400">
                          No image
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    className={
                      viewMode === "grid"
                        ? "p-5"
                        : "flex-1 p-5"
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-600">
                          {getCategoryName(product)}
                        </p>

                        <h2 className="font-semibold text-gray-900">
                          {product.nome}
                        </h2>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        {product.destaque && (
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                            Featured
                          </span>
                        )}

                        {product.novo && (
                          <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    {product.descricao && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                        {product.descricao}
                      </p>
                    )}

                    <div className="mt-4">
                      <p className="text-lg font-semibold text-gray-900">
                        {money(price)}
                      </p>

                      {product.preco_promocional !== null && (
                        <p className="text-sm text-gray-400 line-through">
                          {money(product.preco)}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 rounded-lg bg-indigo-50 p-3">
                      <p className="text-xs text-indigo-600">
                        Your commission
                      </p>

                      <p className="mt-1 font-semibold text-indigo-700">
                        {money(commission)}
                      </p>
                    </div>

                    <a
                      href={`/produto/${encodeURIComponent(product.slug)}`}
                      className="mt-4 flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      View Product
                    </a>

                    {!affiliateLink ? (
                      <button
                        type="button"
                        disabled={isAffiliating}
                        onClick={() => {\n                          setPricingProduct(product);\n                          setSalePrice(product.pricing_mode === "custom"\n                            ? String(product.supplier_suggested_price ?? product.custom_pricing_floor_zar ?? product.supplier_min_selling_price ?? "")\n                            : String(price));\n                        }}
                        className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isAffiliating
                          ? "Creating affiliate link..."
                          : "Sell This Product"}
                      </button>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                          <p className="text-xs font-medium text-green-700">
                            Affiliate link ready
                          </p>

                          <p className="mt-1 break-all text-xs text-gray-700">
                            {affiliateLink}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(product.id)}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            {copiedProduct === product.id
                              ? "Copied!"
                              : "Copy link"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShare(product)}
                            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                          >
                            Share
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
