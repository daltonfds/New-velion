"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Link2,
  PackagePlus,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: string;
  commission: string;
  checkoutUrl: string;
  description: string;
};

const emptyProduct = (id: number): Product => ({
  id,
  name: "",
  category: "",
  price: "",
  stock: "",
  commission: "30",
  checkoutUrl: "",
  description: "",
});

export default function NewSupplierProductsPage() {
  const [products, setProducts] = useState<Product[]>([emptyProduct(1)]);
  const [saved, setSaved] = useState(false);

  const updateProduct = (
    id: number,
    field: keyof Product,
    value: string
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
    setSaved(false);
  };

  const addProduct = () => {
    const nextId =
      products.length > 0
        ? Math.max(...products.map((product) => product.id)) + 1
        : 1;

    setProducts((current) => [...current, emptyProduct(nextId)]);
  };

  const removeProduct = (id: number) => {
    if (products.length === 1) return;
    setProducts((current) => current.filter((product) => product.id !== id));
  };

  const saveProducts = () => {
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/dashboard/supplier"
            className="mt-1 rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Add Products
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add one or multiple products to your NewVelion catalog.
            </p>
          </div>
        </div>

        <button
          onClick={addProduct}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
        >
          <Plus className="h-4 w-4" />
          Add Another Product
        </button>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex gap-3">
          <PackagePlus className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <h3 className="font-bold text-slate-950">
              Supplier product setup
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Every product can have its own price, inventory, affiliate
              commission and payment checkout URL. Affiliates will use these
              details when promoting your products.
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          Products saved successfully. They are ready for catalog review.
        </div>
      )}

      <div className="space-y-5">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                  {index + 1}
                </div>

                <div>
                  <h3 className="font-bold text-slate-950">
                    Product {index + 1}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Product information and affiliate settings
                  </p>
                </div>
              </div>

              {products.length > 1 && (
                <button
                  onClick={() => removeProduct(product.id)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Remove product"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-6 p-5 lg:grid-cols-[180px_1fr]">
              <button className="flex h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center transition hover:border-blue-300 hover:bg-blue-50/30">
                <ImagePlus className="h-8 w-8 text-slate-400" />
                <span className="mt-3 text-sm font-semibold text-slate-600">
                  Add product image
                </span>
                <span className="mt-1 text-xs text-slate-400">
                  JPG, PNG or WEBP
                </span>
              </button>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Product name
                  </label>
                  <input
                    value={product.name}
                    onChange={(e) =>
                      updateProduct(product.id, "name", e.target.value)
                    }
                    placeholder="e.g. Premium Wellness Formula"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>
                  <select
                    value={product.category}
                    onChange={(e) =>
                      updateProduct(product.id, "category", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select category</option>
                    <option>Health & Wellness</option>
                    <option>Beauty</option>
                    <option>Fitness</option>
                    <option>Digital Products</option>
                    <option>Business</option>
                    <option>Education</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Price
                  </label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) =>
                      updateProduct(product.id, "price", e.target.value)
                    }
                    placeholder="49.00"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) =>
                      updateProduct(product.id, "stock", e.target.value)
                    }
                    placeholder="500"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Affiliate commission
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={product.commission}
                      onChange={(e) =>
                        updateProduct(product.id, "commission", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      %
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Checkout payment URL
                  </label>

                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={product.checkoutUrl}
                      onChange={(e) =>
                        updateProduct(
                          product.id,
                          "checkoutUrl",
                          e.target.value
                        )
                      }
                      placeholder="https://your-checkout-provider.com/checkout/..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Affiliates will receive this checkout link when they
                    affiliate with your product.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Short description
                  </label>
                  <textarea
                    rows={3}
                    value={product.description}
                    onChange={(e) =>
                      updateProduct(product.id, "description", e.target.value)
                    }
                    placeholder="Describe your product briefly..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span>
                  Commission:
                  <strong className="ml-1 text-blue-600">
                    {product.commission || "0"}%
                  </strong>
                </span>

                <span>
                  Stock:
                  <strong className="ml-1 text-slate-700">
                    {product.stock || "0"}
                  </strong>
                </span>

                <span className="flex items-center gap-1">
                  <Link2 className="h-3.5 w-3.5" />
                  {product.checkoutUrl
                    ? "Checkout configured"
                    : "Checkout not configured"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/supplier"
          className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </Link>

        <button
          onClick={saveProducts}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          Save Products
        </button>
      </div>
    </div>
  );
}
