"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ImagePlus,
  Link2,
  Loader2,
  PackagePlus,
  Plus,
  Trash2,
  Upload,
  Video,
  X,
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

type Material = {
  id: number;
  title: string;
  type: "image" | "video" | "document" | "copy" | "other";
  url: string;
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
  images: File[];
  materials: Material[];
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
  images: [],
  materials: [],
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

function materialIcon(type: Material["type"]) {
  if (type === "image") return <ImagePlus className="h-4 w-4" />;
  if (type === "video") return <Video className="h-4 w-4" />;
  if (type === "document") return <FileText className="h-4 w-4" />;
  return <Link2 className="h-4 w-4" />;
}

export default function NewSupplierProductsPage() {
  const [products, setProducts] = useState<Product[]>([emptyProduct(1)]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [addingCategories, setAddingCategories] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState("");

  async function loadCategories() {
    try {
      setLoadingCategories(true);

      const payload = await getMarketplaceCategories();

      const data = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load categories."
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const updateProduct = (
    id: number,
    field: keyof Product,
    value: string | File[] | Material[]
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

    setProducts((current) =>
      current.filter((product) => product.id !== id)
    );
  };

  async function addCategories() {
    const names = categoryInput
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter(Boolean);

    const uniqueNames = Array.from(
      new Set(names.map((name) => name.toLowerCase()))
    ).map((lower) => names.find((name) => name.toLowerCase() === lower) || lower);

    if (uniqueNames.length === 0) {
      setCategoryMessage("Enter at least one category.");
      return;
    }

    setAddingCategories(true);
    setCategoryMessage("");

    try {
      const rows = uniqueNames.map((name) => ({
        name_en: name,
        name_pt: name,
        slug: makeSlug(name),
      }));

      const { error: insertError } = await supabase
        .from("categories")
        .insert(rows);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setCategoryInput("");
      setCategoryMessage(
        `${uniqueNames.length} categor${uniqueNames.length === 1 ? "y" : "ies"} added successfully.`
      );

      await loadCategories();
    } catch (err) {
      setCategoryMessage(
        err instanceof Error
          ? err.message
          : "Failed to add categories."
      );
    } finally {
      setAddingCategories(false);
    }
  }

  function handleImages(
    productId: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              images: [...product.images, ...files],
            }
          : product
      )
    );

    event.target.value = "";
  }

  function removeImage(productId: number, index: number) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              images: product.images.filter(
                (_, imageIndex) => imageIndex !== index
              ),
            }
          : product
      )
    );
  }

  function addMaterial(productId: number) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              materials: [
                ...product.materials,
                {
                  id: Date.now() + Math.random(),
                  title: "",
                  type: "image",
                  url: "",
                },
              ],
            }
          : product
      )
    );
  }

  function updateMaterial(
    productId: number,
    materialId: number,
    field: keyof Material,
    value: string
  ) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              materials: product.materials.map((material) =>
                material.id === materialId
                  ? { ...material, [field]: value }
                  : material
              ),
            }
          : product
      )
    );
  }

  function removeMaterial(productId: number, materialId: number) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              materials: product.materials.filter(
                (material) => material.id !== materialId
              ),
            }
          : product
      )
    );
  }

  async function uploadProductImage(
    userId: string,
    productId: string,
    file: File
  ) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const path = `products/${userId}/${productId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    return publicUrl;
  }

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

    if (
      products.some(
        (product) =>
          !product.price ||
          Number(product.price) < 0
      )
    ) {
      setError("Enter a valid price for every product.");
      return;
    }

    if (
      products.some(
        (product) =>
          !product.stock ||
          Number(product.stock) < 0
      )
    ) {
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

    for (const product of products) {
      for (const material of product.materials) {
        if (
          (material.title.trim() && !material.url.trim()) ||
          (!material.title.trim() && material.url.trim())
        ) {
          setError(
            "Complete both the material name and URL for every material."
          );
          return;
        }
      }
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

      for (const product of products) {
        const baseSlug = makeSlug(product.name);

        const uniqueSlug = `${
          baseSlug || "product"
        }-${crypto.randomUUID().slice(0, 8)}`;

        const { data: createdProduct, error: insertError } =
          await supabase
            .from("products")
            .insert({
              supplier_id: user.id,
              category_id: product.category || null,
              name_en: product.name.trim(),
              name_pt: product.name.trim(),
              slug: uniqueSlug,
              short_description_en:
                product.description.trim() || null,
              short_description_pt:
                product.description.trim() || null,
              description_en:
                product.description.trim() || null,
              description_pt:
                product.description.trim() || null,
              price: Number(product.price),
              currency: "ZAR",
              commission_percentage:
                Number(product.commission),
              checkout_url:
                product.checkoutUrl.trim() || null,
              stock: Number(product.stock),
              featured: false,
              offer: false,
              status: "active",
            })
            .select("id")
            .single();

        if (insertError || !createdProduct) {
          throw new Error(
            insertError?.message ||
              "Failed to create product."
          );
        }

        const imageUrls: string[] = [];

        for (const file of product.images) {
          const publicUrl = await uploadProductImage(
            user.id,
            createdProduct.id,
            file
          );

          imageUrls.push(publicUrl);
        }

        if (imageUrls.length > 0) {
          const { error: imageError } = await supabase
            .from("products")
            .update({
              image_url: imageUrls[0],
            })
            .eq("id", createdProduct.id)
            .eq("supplier_id", user.id);

          if (imageError) {
            throw new Error(imageError.message);
          }

          const imageMaterials = imageUrls.map(
            (url, index) => ({
              product_id: createdProduct.id,
              title_en: `Product image ${index + 1}`,
              title_pt: `Imagem do produto ${index + 1}`,
              material_type: "image",
              file_url: url,
            })
          );

          const { error: imageMaterialError } =
            await supabase
              .from("product_materials")
              .insert(imageMaterials);

          if (imageMaterialError) {
            throw new Error(
              imageMaterialError.message
            );
          }
        }

        const materials = product.materials
          .filter(
            (material) =>
              material.title.trim() &&
              material.url.trim()
          )
          .map((material) => ({
            product_id: createdProduct.id,
            title_en: material.title.trim(),
            title_pt: material.title.trim(),
            material_type: material.type,
            file_url: material.url.trim(),
          }));

        if (materials.length > 0) {
          const { error: materialError } =
            await supabase
              .from("product_materials")
              .insert(materials);

          if (materialError) {
            throw new Error(materialError.message);
          }
        }
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
              Every product can have its own price, inventory,
              affiliate commission, checkout URL, product photos
              and promotional materials.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="font-bold text-slate-950">
              Product categories
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Create one or many categories at once. Use a comma or
              a new line between categories.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {categories.length} categories
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <textarea
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            rows={3}
            placeholder={"Beauty\nHealth\nSupplements\nFitness"}
            className="min-h-[90px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={addCategories}
            disabled={addingCategories || !categoryInput.trim()}
            className="inline-flex h-fit items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {addingCategories ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Categories
          </button>
        </div>

        {categoryMessage && (
          <p className="mt-3 text-sm font-semibold text-blue-600">
            {categoryMessage}
          </p>
        )}

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                {category.name_en ||
                  category.name_pt ||
                  category.slug}
              </span>
            ))}
          </div>
        )}
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
                    Product information, photos, affiliate settings and creatives
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

            <div className="grid gap-6 p-5 lg:grid-cols-[240px_1fr]">
              <div>
                <input
                  id={`product-images-${product.id}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(event) =>
                    handleImages(product.id, event)
                  }
                />

                <label
                  htmlFor={`product-images-${product.id}`}
                  className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center transition hover:border-blue-300 hover:bg-blue-50/30"
                >
                  <ImagePlus className="h-8 w-8 text-slate-400" />

                  <span className="mt-3 text-sm font-semibold text-slate-600">
                    Add product photos
                  </span>

                  <span className="mt-1 text-xs text-slate-400">
                    Select multiple JPG, PNG or WEBP files
                  </span>

                  <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">
                    <Upload className="h-3.5 w-3.5" />
                    Choose Photos
                  </span>
                </label>

                {product.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {product.images.map((file, imageIndex) => (
                      <div
                        key={`${file.name}-${imageIndex}`}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="aspect-square w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              product.id,
                              imageIndex
                            )
                          }
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs text-slate-400">
                  {product.images.length} photo
                  {product.images.length === 1 ? "" : "s"} selected
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Product name
                  </label>

                  <input
                    value={product.name}
                    onChange={(e) =>
                      updateProduct(
                        product.id,
                        "name",
                        e.target.value
                      )
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
                      updateProduct(
                        product.id,
                        "category",
                        e.target.value
                      )
                    }
                    disabled={
                      loadingCategories || saving
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading categories..."
                        : categories.length === 0
                          ? "Add a category above first"
                          : "Select category"}
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name_en ||
                          category.name_pt ||
                          category.slug}
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
                      updateProduct(
                        product.id,
                        "price",
                        e.target.value
                      )
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
                      updateProduct(
                        product.id,
                        "stock",
                        e.target.value
                      )
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
                        updateProduct(
                          product.id,
                          "commission",
                          e.target.value
                        )
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
                      updateProduct(
                        product.id,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Describe your product briefly..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-bold text-slate-950">
                    Affiliate materials & creatives
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add links to banners, videos, documents, ad copy,
                    product pages or any promotional material your
                    affiliates can use.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    addMaterial(product.id)
                  }
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600"
                >
                  <Plus className="h-4 w-4" />
                  Add Material
                </button>
              </div>

              {product.materials.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-400">
                  No affiliate materials added yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {product.materials.map(
                    (material, materialIndex) => (
                      <div
                        key={material.id}
                        className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[180px_140px_1fr_auto]"
                      >
                        <input
                          value={material.title}
                          onChange={(e) =>
                            updateMaterial(
                              product.id,
                              material.id,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder={`Material ${materialIndex + 1}`}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />

                        <select
                          value={material.type}
                          onChange={(e) =>
                            updateMaterial(
                              product.id,
                              material.id,
                              "type",
                              e.target.value
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                          <option value="document">Document</option>
                          <option value="copy">Ad Copy</option>
                          <option value="other">Other</option>
                        </select>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {materialIcon(material.type)}
                          </span>

                          <input
                            type="url"
                            value={material.url}
                            onChange={(e) =>
                              updateMaterial(
                                product.id,
                                material.id,
                                "url",
                                e.target.value
                              )
                            }
                            placeholder="https://..."
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeMaterial(
                              product.id,
                              material.id
                            )
                          }
                          className="rounded-lg p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
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

                <span>
                  Photos:
                  <strong className="ml-1 text-slate-700">
                    {product.images.length}
                  </strong>
                </span>

                <span>
                  Materials:
                  <strong className="ml-1 text-slate-700">
                    {product.materials.length}
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
