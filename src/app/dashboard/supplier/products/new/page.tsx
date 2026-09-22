"use client";

import { useEffect, useState } from "react";
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
import { supabase } from "@/lib/supabase";
import { getMarketplaceCategories } from "@/lib/newvelion-api";

type Category = {
  id: string;
  name_en?: string | null;
  name_pt?: string | null;
  slug?: string | null;
};

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

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function NewSupplierProductsPage() {
  const [products, setProducts] = useState<Product[]>([emptyProduct(1)]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const payload = await getMarketplaceCategories();

        const data = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        if (mounted) {
          setCategories(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load categories."
          );
        }
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

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
    setError("");
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

  async function saveProducts() {
    setError("");
    setSaved(false);

    if (products.some((product) => !product.name.trim())) {
      setError("Every product must have a product name.");
      return;
    }

    if (products.some((product) => !product.category)) {
      setError("Select a category for every product.");
      return;
    }

    if (products.some((product) => !product.price || Number(product.price) < 0)) {
      setError("Enter a valid price for every product.");
      return;
    }

    if (products.some((product) => !product.stock || Number(product.stock) < 0)) {
      setError("Enter valid stock for every product.");
      return;
    }

    if (
      products.some(
        (product) =>
          !product.commission ||
          Number(product.commission) < 0 ||
          Number(product.commission) > 100
      )
    ) {
      setError("Commission must be between 0% and 100%.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Authentication required.");
      }

      const rows = products.map((product) => {
        const category = categories.find(
          (item) => item.id === product.category
        );

        const baseSlug = makeSlug(product.name);
        const uniqueSlug = `${baseSlug || "product"}-${crypto.randomUUID().slice(0, 8)}`;

        return {
          supplier_id: user.id,
          category_id: category?.id || null,
          name_en: product.name.trim(),
          name_pt: product.name.trim(),
          slug: uniqueSlug,
          short_description_en: product.description.trim() || null,
          short_description_pt: product.description.trim() || null,
          description_en: product.description.trim() || null,
          description_pt: product.description.trim() || null,
          price: Number(product.price),
          currency: "USD",
          commission_percentage: Number(product.commission),
          checkout_url: product.checkoutUrl.trim() || null,
          stock: Number(product.stock),
          featured: false,
          offer: false,
        };
      });

      const { error: insertError } = await supabase
        .from("products")
        .insert(rows);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSaved(true);
      setProducts([emptyProduct(1)]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save products."
      );
    } finally {
      setSaving(false);
    }
  }

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
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
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
              commission and payment checkout URL.
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          Products saved successfully.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
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
                  disabled={saving}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  title="Remove product"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-6 p-5 lg:grid-cols-[180px_1fr]">
              <button
                type="button"
                className="flex h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center transition hover:border-blue-300 hover:bg-blue-50/30"
              >
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
                    disabled={loadingCategories || saving}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading categories..."
                        : "Select category"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name_en || category.name_pt || category.slug}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
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
                    min="0"
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
          disabled={saving || loadingCategories}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Products"}
        </button>
      </div>
    </div>
  );
}
