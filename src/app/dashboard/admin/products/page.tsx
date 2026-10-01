"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setProducts((data ?? []) as Product[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const categories = Array.from(
    new Map(
      products
        .filter((product) => product.categoria_id)
        .map((product) => [
          product.categoria_id,
          product.categoria_id,
        ]),
    ).entries(),
  );

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (product) => product.categoria_id === selectedCategory,
        );

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-600">Commerce</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Products
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage products available across the Newvelion marketplace.
            </p>
          </div>

          <Link href="/dashboard/admin/products/new">
            <Button>Add Product</Button>
          </Link>
        </div>

        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Product Catalog</h2>
              <p className="text-sm text-slate-500">
                {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="product-category"
                className="text-sm font-medium text-slate-600"
              >
                Category
              </label>
              <select
                id="product-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">All Categories</option>
                {categories.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="font-semibold text-slate-900">
                No products yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Create the first product to make it available for sellers.
              </p>
              <div className="mt-5">
                <Link href="/dashboard/admin/products/new">
                  <Button>Add Product</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Commission</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.fotos?.[0] ? (
                            <img
                              src={product.fotos[0]}
                              alt={product.nome}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                              No image
                            </div>
                          )}

                          <div>
                            <p className="font-medium text-slate-900">
                              {product.nome}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {product.moeda}{" "}
                        {Number(
                          product.preco_promocional ?? product.preco,
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {product.comissao_tipo === "percentual"
                          ? `${product.comissao_valor}%`
                          : `${product.moeda} ${Number(
                              product.comissao_valor,
                            ).toFixed(2)}`}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {product.estoque ?? 0}
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={product.ativo ? "success" : "default"}>
                          {product.ativo ? "Active" : "Inactive"}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/admin/products/${product.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
