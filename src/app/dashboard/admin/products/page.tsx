"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  ArrowLeft,
  Package,
  Search,
  ShoppingCart,
  ToggleRight,
} from "lucide-react";
import { getAdminProducts } from "@/lib/newvelion-api";

type Product = {
  id: string;
  name_en?: string | null;
  name_pt?: string | null;
  slug?: string | null;
  supplier_id?: string | null;
  price?: number | null;
  original_price?: number | null;
  offer_price?: number | null;
  currency?: string | null;
  commission_percentage?: number | null;
  stock?: number | null;
  total_sales?: number | null;
  total_clicks?: number | null;
  featured?: boolean | null;
  offer?: boolean | null;
  status?: string | null;
  created_at?: string | null;
};

function money(value: number | null | undefined) {
  if (value == null) return "—";

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(value);
}

function productName(product: Product) {
  return product.name_en || product.name_pt || "Untitled product";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) =>
      [
        product.id,
        product.name_en,
        product.name_pt,
        product.slug,
        product.supplier_id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [products, search]);

  const activeProducts = products.filter(
    (product) => product.status === "active",
  ).length;

  const totalSales = products.reduce(
    (sum, product) => sum + Number(product.total_sales || 0),
    0,
  );

  return (
    <DashboardShell
      area="admin"
      activeKey="products"
      title="Products"
      subtitle="Live product catalog from NewVelion."
    >
      <div className="space-y-6">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#1769e0]"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </Link>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total Products", products.length, Package],
            ["Active Products", activeProducts, ToggleRight],
            ["Total Sales", totalSales, ShoppingCart],
          ].map(([label, value, Icon]) => {
            const StatIcon = Icon as typeof Package;

            return (
              <div
                key={label as string}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {label as string}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {value as number}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <StatIcon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="relative max-w-xl">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, supplier ID or product ID..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto text-slate-300" size={34} />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                No products found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Products created by suppliers will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {[
                      "Product",
                      "Supplier",
                      "Price",
                      "Commission",
                      "Stock",
                      "Sales",
                      "Status",
                      "Created",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {productName(product)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {product.id}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        <span className="font-mono text-xs">
                          {product.supplier_id || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {money(
                          Number(
                            product.offer_price ??
                              product.price ??
                              0,
                          ),
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-blue-600">
                        {Number(product.commission_percentage || 0)}%
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {product.stock ?? "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {product.total_sales ?? 0}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {product.status || "unknown"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString(
                              "en-ZA",
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
