"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Star,
  ShoppingBag,
  Percent,
  BarChart3,
  Layers3,
  Tag,
} from "lucide-react";

const categories = [
  "All Categories",
  "Health & Fitness",
  "Beauty",
  "Business",
  "Finance",
  "Relationships",
  "Education",
  "Software",
  "Personal Development",
];

const products = [
  {
    name: "Premium Wellness Formula",
    category: "Health & Fitness",
    description:
      "A premium wellness product designed for customers looking to improve their daily health routine.",
    price: "$79",
    commission: "75%",
    earnings: "$59.25",
    gravity: "128",
    rating: "4.9",
    featured: true,
    offer: true,
  },
  {
    name: "Digital Growth Blueprint",
    category: "Business",
    description:
      "A complete digital business system with training, resources and actionable strategies.",
    price: "$97",
    commission: "60%",
    earnings: "$58.20",
    gravity: "94",
    rating: "4.8",
    featured: true,
    offer: false,
  },
  {
    name: "Mindset Mastery",
    category: "Personal Development",
    description:
      "A structured personal development program focused on mindset, discipline and performance.",
    price: "$67",
    commission: "70%",
    earnings: "$46.90",
    gravity: "81",
    rating: "4.7",
    featured: false,
    offer: true,
  },
  {
    name: "Beauty Essentials Kit",
    category: "Beauty",
    description:
      "A beauty product bundle designed for customers seeking a simple and effective routine.",
    price: "$89",
    commission: "55%",
    earnings: "$48.95",
    gravity: "73",
    rating: "4.8",
    featured: false,
    offer: false,
  },
  {
    name: "Online Skills Academy",
    category: "Education",
    description:
      "Practical online courses helping students develop valuable digital skills.",
    price: "$129",
    commission: "65%",
    earnings: "$83.85",
    gravity: "67",
    rating: "4.9",
    featured: true,
    offer: false,
  },
  {
    name: "Smart Finance System",
    category: "Finance",
    description:
      "A digital financial education product focused on budgeting and personal money management.",
    price: "$59",
    commission: "80%",
    earnings: "$47.20",
    gravity: "61",
    rating: "4.6",
    featured: false,
    offer: true,
  },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("Popular");

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" || product.category === category;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sort === "Commission") {
        return parseInt(b.commission) - parseInt(a.commission);
      }

      if (sort === "Earnings") {
        return parseFloat(b.earnings.replace("$", "")) -
          parseFloat(a.earnings.replace("$", ""));
      }

      if (sort === "Rating") {
        return parseFloat(b.rating) - parseFloat(a.rating);
      }

      return parseInt(b.gravity) - parseInt(a.gravity);
    });

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#171717]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-2xl font-bold tracking-tight">NewVelion</div>
            <div className="mt-1 text-sm text-gray-500">Marketplace</div>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="/marketplace" className="text-indigo-600">
              Marketplace
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              My Products
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Orders & Sales
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Analytics
            </a>
          </nav>

          <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Dashboard
          </button>
        </div>
      </header>

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="max-w-3xl">
            <span className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              NEWVELION MARKETPLACE
            </span>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Find products to sell.
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-500">
              Discover products, compare commissions and find offers with
              strong commercial potential for your business.
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
                placeholder="Search products, niches or keywords..."
                className="h-14 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-14 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium outline-none focus:border-indigo-500"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <button className="flex h-14 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 text-sm font-medium hover:bg-gray-50">
              <SlidersHorizontal size={18} />
              Filters
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Explore products</h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredProducts.length} products available
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm font-medium outline-none"
              >
                <option>Popular</option>
                <option>Commission</option>
                <option>Earnings</option>
                <option>Rating</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <article
              key={product.name}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
            >
              <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
                {product.featured && (
                  <span className="absolute left-4 top-4 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                    Featured
                  </span>
                )}

                {product.offer && (
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Special Offer
                  </span>
                )}

                <ShoppingBag
                  size={54}
                  strokeWidth={1.3}
                  className="text-indigo-300"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    {product.category}
                  </span>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star size={14} className="fill-current text-amber-400" />
                    {product.rating}
                  </div>
                </div>

                <h3 className="mt-3 text-xl font-bold">{product.name}</h3>

                <p className="mt-2 min-h-[72px] text-sm leading-6 text-gray-500">
                  {product.description}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Percent size={14} />
                      Commission
                    </div>
                    <div className="mt-1 text-lg font-bold">
                      {product.commission}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <TrendingUp size={14} />
                      Est. earnings
                    </div>
                    <div className="mt-1 text-lg font-bold">
                      {product.earnings}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <BarChart3 size={14} />
                    Performance {product.gravity}
                  </span>

                  <span className="font-semibold text-gray-900">
                    {product.price}
                  </span>
                </div>

                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                  View Product
                  <ArrowRight size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <Layers3 className="mx-auto text-gray-300" size={42} />
            <h3 className="mt-4 text-lg font-bold">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try another search or category.
            </p>
          </div>
        )}
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:grid-cols-3">
          <div>
            <Tag className="text-indigo-600" size={24} />
            <h3 className="mt-4 font-bold">Commercial information</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Understand price, commission, earnings and product conditions
              before choosing what to promote.
            </p>
          </div>

          <div>
            <BarChart3 className="text-indigo-600" size={24} />
            <h3 className="mt-4 font-bold">Performance metrics</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Compare product performance and identify opportunities using
              marketplace metrics.
            </p>
          </div>

          <div>
            <ShoppingBag className="text-indigo-600" size={24} />
            <h3 className="mt-4 font-bold">Promotional materials</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Access approved creative assets, product information and
              promotional resources.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
