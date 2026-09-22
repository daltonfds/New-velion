"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Percent,
  BarChart3,
  Layers3,
  Tag,
  Bookmark,
  BookmarkCheck,
  Grid3X3,
  List,
  Sparkles,
  ShoppingBag,
  X,
  Globe2,
} from "lucide-react";
import {
  getMarketplaceCategories,
  getMarketplaceProducts,
  MarketplaceProduct,
} from "@/lib/newvelion-api";

type Category = {
  id: string;
  name_en: string;
  name_pt: string;
  slug: string;
};

type Language = "en" | "pt";

const translations = {
  en: {
    marketplace: "Marketplace",
    discover: "Discover products to promote.",
    description:
      "Find products, compare commissions, explore offers and get the promotional resources you need to sell.",
    search: "Search products, niches or keywords...",
    categories: "Categories",
    all: "All Products",
    featured: "Featured",
    offers: "Offers",
    explore: "Explore products",
    available: "products available",
    sort: "Sort by",
    popular: "Popular",
    commission: "Commission",
    newest: "Newest",
    price: "Price",
    highest: "Highest",
    lowest: "Lowest",
    filters: "Filters",
    clear: "Clear filters",
    saved: "Saved",
    save: "Save",
    view: "View Product",
    affiliate: "Affiliate This Product",
    earnings: "Est. earnings",
    sales: "Sales",
    clicks: "Clicks",
    conversions: "Conversions",
    offer: "Special Offer",
    featuredBadge: "Featured",
    commercial: "Commercial Information",
    materials: "Promotional Materials",
    emptyTitle: "No products found",
    emptyDescription:
      "Try another search, category or filter. Products will appear here when suppliers publish active offers.",
    noProducts:
      "There are no active products in the marketplace yet.",
    noCategories: "No categories available yet.",
    language: "Language",
    english: "English",
    portuguese: "Português",
    performance: "Performance",
    stock: "Stock",
    availableStock: "Available",
    outOfStock: "Out of stock",
    page: "Product page",
    checkout: "Checkout",
    materialsLink: "Materials",
    allLinks: "Affiliate links",
    close: "Close",
  },
  pt: {
    marketplace: "Marketplace",
    discover: "Descubra produtos para promover.",
    description:
      "Encontre produtos, compare comissões, explore ofertas e tenha acesso aos materiais promocionais necessários para vender.",
    search: "Pesquisar produtos, nichos ou palavras-chave...",
    categories: "Categorias",
    all: "Todos os produtos",
    featured: "Destaques",
    offers: "Ofertas",
    explore: "Explorar produtos",
    available: "produtos disponíveis",
    sort: "Ordenar por",
    popular: "Populares",
    commission: "Comissão",
    newest: "Mais recentes",
    price: "Preço",
    highest: "Maior",
    lowest: "Menor",
    filters: "Filtros",
    clear: "Limpar filtros",
    saved: "Guardados",
    save: "Guardar",
    view: "Ver produto",
    affiliate: "Afiliar-se a este produto",
    earnings: "Ganhos estimados",
    sales: "Vendas",
    clicks: "Cliques",
    conversions: "Conversões",
    offer: "Oferta especial",
    featuredBadge: "Destaque",
    commercial: "Informações comerciais",
    materials: "Materiais promocionais",
    emptyTitle: "Nenhum produto encontrado",
    emptyDescription:
      "Tente outra pesquisa, categoria ou filtro. Os produtos aparecerão aqui quando os fornecedores publicarem ofertas ativas.",
    noProducts:
      "Ainda não existem produtos ativos no marketplace.",
    noCategories: "Ainda não existem categorias.",
    language: "Idioma",
    english: "English",
    portuguese: "Português",
    performance: "Desempenho",
    stock: "Stock",
    availableStock: "Disponível",
    outOfStock: "Sem stock",
    page: "Página do produto",
    checkout: "Checkout",
    materialsLink: "Materiais",
    allLinks: "Links de afiliado",
    close: "Fechar",
  },
};

function money(value: number | null, currency: string | null) {
  if (value == null) return "—";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency || "USD"} ${value.toFixed(2)}`;
  }
}

function getProductName(product: MarketplaceProduct, language: Language) {
  return language === "pt" ? product.name_pt : product.name_en;
}

function getProductDescription(
  product: MarketplaceProduct,
  language: Language,
) {
  return language === "pt"
    ? product.short_description_pt || product.description_pt || ""
    : product.short_description_en || product.description_en || "";
}

export default function MarketplacePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("popular");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [offersOnly, setOffersOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = translations[language];

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(
      "newvelion_language",
    );

    if (storedLanguage === "en" || storedLanguage === "pt") {
      setLanguage(storedLanguage);
    }

    const storedSaved = window.localStorage.getItem(
      "newvelion_saved_products",
    );

    if (storedSaved) {
      try {
        const parsed = JSON.parse(storedSaved);
        if (Array.isArray(parsed)) {
          setSavedProducts(parsed);
        }
      } catch {
        // Ignore invalid local storage.
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("newvelion_language", language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(
      "newvelion_saved_products",
      JSON.stringify(savedProducts),
    );
  }, [savedProducts]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [productResponse, categoryResponse] = await Promise.all([
          getMarketplaceProducts({
            q: search || undefined,
            category: category || undefined,
            featured: featuredOnly || undefined,
            offer: offersOnly || undefined,
            sort: sort as
              | "popular"
              | "commission"
              | "newest"
              | "price",
            page: 1,
            limit: 100,
          }),
          getMarketplaceCategories(),
        ]);

        if (cancelled) return;

        setProducts(productResponse?.data || []);
        setCategories(categoryResponse?.data || []);
      } catch (err) {
        if (cancelled) return;

        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load marketplace.",
        );
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
  }, [search, category, featuredOnly, offersOnly, sort]);

  const visibleProducts = useMemo(() => {
    if (!savedOnly) return products;

    return products.filter((product) =>
      savedProducts.includes(product.id),
    );
  }, [products, savedOnly, savedProducts]);

  function toggleSaved(productId: string) {
    setSavedProducts((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setFeaturedOnly(false);
    setOffersOnly(false);
    setSavedOnly(false);
    setSort("popular");
  }

  const activeCategory = categories.find((item) => item.id === category);

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#171717]">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <Link
              href="/marketplace"
              className="text-xl font-black tracking-tight sm:text-2xl"
            >
              NewVelion
            </Link>
            <p className="text-xs text-gray-500">{t.marketplace}</p>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
            <Link href="/marketplace" className="text-indigo-600">
              {t.marketplace}
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-900"
            >
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "pt" : "en")}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
              title={t.language}
            >
              <Globe2 size={15} />
              {language === "en" ? "EN" : "PT"}
            </button>

            <Link
              href="/dashboard"
              className="hidden rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 sm:block"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-indigo-600">
              <Sparkles size={14} />
              NewVelion Marketplace
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              {t.discover}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              {t.description}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.search}
                className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-14 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium outline-none focus:border-indigo-500 lg:w-60"
            >
              <option value="">{t.categories}: {t.all}</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {language === "pt" ? item.name_pt : item.name_en}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setOffersOnly((value) => !value)}
              className={`flex h-14 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-semibold transition ${
                offersOnly
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Tag size={18} />
              {t.offers}
            </button>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setFeaturedOnly(false);
                setOffersOnly(false);
                setSavedOnly(false);
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                !category &&
                !featuredOnly &&
                !offersOnly &&
                !savedOnly
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.all}
            </button>

            <button
              type="button"
              onClick={() => {
                setFeaturedOnly((value) => !value);
                setOffersOnly(false);
                setSavedOnly(false);
              }}
              className={`flex whitespace-nowrap items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                featuredOnly
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Sparkles size={15} />
              {t.featured}
            </button>

            <button
              type="button"
              onClick={() => {
                setOffersOnly((value) => !value);
                setFeaturedOnly(false);
                setSavedOnly(false);
              }}
              className={`flex whitespace-nowrap items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                offersOnly
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Tag size={15} />
              {t.offers}
            </button>

            <button
              type="button"
              onClick={() => {
                setSavedOnly((value) => !value);
                setFeaturedOnly(false);
                setOffersOnly(false);
              }}
              className={`flex whitespace-nowrap items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                savedOnly
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {savedOnly ? (
                <BookmarkCheck size={15} />
              ) : (
                <Bookmark size={15} />
              )}
              {t.saved}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black">{t.explore}</h2>
              {activeCategory && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                  {language === "pt"
                    ? activeCategory.name_pt
                    : activeCategory.name_en}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "..."
                : `${visibleProducts.length} ${t.available}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(category ||
              featuredOnly ||
              offersOnly ||
              savedOnly ||
              search) && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                {t.clear}
              </button>
            )}

            <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`rounded-lg p-2 ${
                  view === "grid"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400"
                }`}
                aria-label="Grid view"
              >
                <Grid3X3 size={17} />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded-lg p-2 ${
                  view === "list"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400"
                }`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-gray-500 sm:block">
                {t.sort}
              </span>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-9 text-sm font-semibold outline-none"
                >
                  <option value="popular">{t.popular}</option>
                  <option value="commission">
                    {t.commission}
                  </option>
                  <option value="newest">{t.newest}</option>
                  <option value="price">{t.price}</option>
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div
            className={
              view === "grid"
                ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                : "space-y-4"
            }
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <div className="h-48 bg-gray-100" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 rounded bg-gray-100" />
                  <div className="h-6 w-3/4 rounded bg-gray-100" />
                  <div className="h-4 w-full rounded bg-gray-100" />
                  <div className="h-4 w-5/6 rounded bg-gray-100" />
                  <div className="h-12 rounded-xl bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleProducts.length > 0 ? (
          <div
className={
              view === "grid"
                ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                : "space-y-4"
            }
          >
            {visibleProducts.map((product) => {
              const name = getProductName(product, language);
              const description = getProductDescription(product, language);
              const isSaved = savedProducts.includes(product.id);

              return (
                <div
                  key={product.id}
                  className={`group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md ${
                    view === "list" ? "flex flex-col sm:flex-row" : ""
                  }`}
                >
                  <div
                    className={`relative overflow-hidden bg-gray-100 ${
                      view === "list"
                        ? "h-48 sm:h-auto sm:w-64 sm:shrink-0"
                        : "h-48 w-full"
                    }`}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <ShoppingBag size={40} />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      {product.featured && (
                        <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white">
                          <Sparkles size={11} />
                          {t.featuredBadge}
                        </span>
                      )}
                      {product.offer && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">
                          <Tag size={11} />
                          {t.offer}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSaved(product.id)}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition hover:bg-white"
                      aria-label={t.save}
                    >
                      {isSaved ? (
                        <BookmarkCheck size={16} className="text-amber-500" />
                      ) : (
                        <Bookmark size={16} />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <Layers3 size={13} />
                      {((language === "pt" ? product.categories?.name_pt : product.categories?.name_en) || t.categories)}
                    </div>

                    <h3 className="mt-2 line-clamp-2 text-lg font-bold">
                      {name}
                    </h3>

                    <p className="mt-1 line-clamp-2 flex-1 text-sm leading-6 text-gray-500">
                      {description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                        <Percent size={15} />
                        {product.commission_percentage != null
                          ? `${product.commission_percentage}%`
                          : "—"}
                        <span className="font-normal text-gray-400">
                          {t.commission.toLowerCase()}
                        </span>
                      </div>

                      <div className="ml-auto text-right">
                        <p className="text-xs text-gray-400">{t.price}</p>
                        <p className="font-bold">
                          {money(product.price, product.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          product.stock && product.stock > 0
                            ? "bg-emerald-500"
                            : "bg-red-400"
                        }`}
                      />
                      <span className="text-gray-500">
                        {product.stock && product.stock > 0
                          ? t.availableStock
                          : t.outOfStock}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/marketplace/${product.id}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        {t.view}
                      </Link>
                      <Link
                        href={`/marketplace/${product.id}/affiliate`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                      >
                        {t.affiliate}
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <ShoppingBag size={26} />
            </div>
            <h3 className="mt-4 text-lg font-bold">{t.emptyTitle}</h3>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              {products.length === 0 ? t.noProducts : t.emptyDescription}
            </p>
            {(category || featuredOnly || offersOnly || savedOnly || search) && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                {t.clear}
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
