"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  Eye,
  Package,
  Search,
  ShoppingCart,
  Star,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type ProductStatus = "Active" | "Draft" | "Pending Review" | "Rejected";

type Product = {
  id: string;
  name: string;
  supplier: string;
  category: string;
  price: number;
  commission: number;
  stock: number;
  sales: number;
  featured: boolean;
  status: ProductStatus;
};

const initialProducts: Product[] = [
  {
    id: "PRD-4821",
    name: "Premium Hair Growth Formula",
    supplier: "Global Wellness Ltd.",
    category: "Health & Beauty",
    price: 89,
    commission: 30,
    stock: 842,
    sales: 392,
    featured: true,
    status: "Active",
  },
  {
    id: "PRD-4817",
    name: "Daily Wellness Complex",
    supplier: "Prime Nutrition Co.",
    category: "Health & Beauty",
    price: 64,
    commission: 25,
    stock: 1260,
    sales: 284,
    featured: true,
    status: "Active",
  },
  {
    id: "PRD-4809",
    name: "Digital Marketing Blueprint",
    supplier: "Digital Growth Store",
    category: "Digital Products",
    price: 49,
    commission: 50,
    stock: 0,
    sales: 218,
    featured: false,
    status: "Pending Review",
  },
  {
    id: "PRD-4802",
    name: "Advanced Fitness Program",
    supplier: "Nexa Commerce",
    category: "Fitness",
    price: 79,
    commission: 35,
    stock: 640,
    sales: 164,
    featured: false,
    status: "Active",
  },
  {
    id: "PRD-4796",
    name: "Sleep Support Formula",
    supplier: "Health Market Europe",
    category: "Health & Beauty",
    price: 58,
    commission: 28,
    stock: 84,
    sales: 137,
    featured: false,
    status: "Active",
  },
  {
    id: "PRD-4788",
    name: "Social Media Masterclass",
    supplier: "Digital Growth Store",
    category: "Education",
    price: 119,
    commission: 45,
    stock: 0,
    sales: 91,
    featured: false,
    status: "Draft",
  },
  {
    id: "PRD-4774",
    name: "Complete Nutrition Guide",
    supplier: "Prime Nutrition Co.",
    category: "Education",
    price: 39,
    commission: 40,
    stock: 320,
    sales: 76,
    featured: false,
    status: "Rejected",
  },
];

const statusClasses: Record<ProductStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Draft: "bg-slate-100 text-slate-600",
  "Pending Review": "bg-amber-50 text-amber-700",
  Rejected: "bg-red-50 text-red-700",
};

function money(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | ProductStatus>("All");
  const [category, setCategory] = useState("All");

  const categories = Array.from(
    new Set(products.map((product) => product.category)),
  );

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.supplier.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query);

      const matchesStatus =
        status === "All" || product.status === status;

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, search, status, category]);

  const activeProducts = products.filter(
    (product) => product.status === "Active",
  ).length;

  const pendingProducts = products.filter(
    (product) => product.status === "Pending Review",
  ).length;

  const totalSales = products.reduce(
    (sum, product) => sum + product.sales,
    0,
  );

  function toggleFeatured(id: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? { ...product, featured: !product.featured }
          : product,
      ),
    );
  }

  function changeStatus(id: string, nextStatus: ProductStatus) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, status: nextStatus } : product,
      ),
    );
  }

  return (
    <DashboardShell
      area="admin"
      activeKey="products"
      title="Products"
      subtitle="Review, manage and control every product listed on NewVelion."
    >
      <div className="space-y-6">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#1769e0]"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </Link>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Products", products.length, Package],
            ["Active Products", activeProducts, ToggleRight],
            ["Pending Review", pendingProducts, Eye],
            ["Total Sales", totalSales, ShoppingCart],
          ].map(([label, value, Icon]) => {
            const StatIcon = Icon as typeof Package;

            return (
              <div
                key={label as string}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {label as string}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {typeof value === "number"
                        ? value.toLocaleString("en-US")
                        : String(value)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3 text-[#1769e0]">
                    <StatIcon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product, supplier or product ID..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1769e0] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="relative">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-[#1769e0] sm:w-52"
              >
                <option value="All">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "All" | ProductStatus)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-[#1769e0] sm:w-48"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Rejected">Rejected</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-950">Product Management</h2>
            <p className="text-sm text-slate-500">
              {filteredProducts.length} product
              {filteredProducts.length === 1 ? "" : "s"} shown
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Supplier</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Commission</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Sales</th>
                  <th className="px-5 py-4">Featured</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                          <Package size={20} />
                        </div>

                        <div>
                          <p className="max-w-[240px] font-semibold text-slate-900">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {product.id} · {product.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {product.supplier}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-slate-900">
                      {money(product.price)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-emerald-600">
                        {product.commission}%
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                      {product.stock.toLocaleString("en-US")}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                      {product.sales.toLocaleString("en-US")}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(product.id)}
                        className="text-slate-400 transition hover:text-amber-500"
                        title={
                          product.featured
                            ? "Remove featured"
                            : "Mark as featured"
                        }
                      >
                        <Star
                          size={19}
                          fill={product.featured ? "currentColor" : "none"}
                          className={
                            product.featured ? "text-amber-500" : undefined
                          }
                        />
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${statusClasses[product.status]}`}
                      >
                        {product.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="View product"
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1769e0]"
                        >
                          <Eye size={16} />
                        </button>

                        <Link
                          href="/marketplace"
                          title="Open marketplace"
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1769e0]"
                        >
                          <ArrowUpRight size={16} />
                        </Link>

                        {product.status === "Pending Review" ? (
                          <button
                            type="button"
                            onClick={() =>
                              changeStatus(product.id, "Active")
                            }
                            className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              changeStatus(
                                product.id,
                                product.status === "Active"
                                  ? "Draft"
                                  : "Active",
                              )
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                          >
                            {product.status === "Active"
                              ? "Disable"
                              : "Activate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      No products match your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-950 p-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Package size={19} />
                <h2 className="font-bold">Product Review Center</h2>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Review new products before they become available to sellers,
                control featured products and manage marketplace visibility.
              </p>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              Open Marketplace
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
