"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ExternalLink,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { getAffiliateProducts } from "@/lib/newvelion-api";

type Supplier = {
  name?: string;
  full_name?: string;
  company_name?: string;
  logo_url?: string;
  avatar_url?: string;
  country?: string;
  country_code?: string;
  city?: string;
  state_region?: string;
  verification_status?: string;
  company_type?: string;
  website?: string;
  description?: string;
};

type Product = {
  id?: string;
  name?: string;
  name_en?: string;
  name_pt?: string;
  slug?: string;
  description?: string;
  short_description_en?: string | null;
  short_description_pt?: string | null;
  image_url?: string | null;
  price?: number | null;
  currency?: string | null;
  status?: string;
  supplier?: Supplier;
};

type AffiliateProduct = {
  id?: string;
  product_id?: string;
  referral_code?: string;
  affiliate_code?: string;
  status?: string;
  product_page_url?: string;
  checkout_url?: string;
  created_at?: string;
  product?: Product;
  supplier?: Supplier;
};

function getProduct(item: AffiliateProduct): Product {
  return item.product || {};
}

function getSupplier(item: AffiliateProduct): Supplier | undefined {
  return item.supplier || item.product?.supplier;
}

export default function SellerMyProductsPage() {
  const [items, setItems] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const data = await getAffiliateProducts();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load your products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const activeCount = useMemo(
    () =>
      items.filter(
        (item) =>
          !item.status ||
          item.status === "active" ||
          item.status === "approved"
      ).length,
    [items]
  );

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#3B2FE0]">Seller</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A2E]">
              My Products
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Products you have selected for promotion on NewVelion.
            </p>
          </div>

          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-[#3B2FE0]">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Selected Products</p>
                <p className="text-2xl font-bold text-[#1A1A2E]">{items.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active Products</p>
            <p className="mt-1 text-2xl font-bold text-[#1A1A2E]">{activeCount}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Affiliate Status</p>
            <p className="mt-1 text-lg font-bold text-emerald-600">
              {items.length ? "Active" : "No products yet"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            Loading your products...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-300" />
            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No products selected yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Go to the Marketplace and select products you want to promote.
            </p>
            <a
              href="/marketplace"
              className="mt-5 inline-flex items-center rounded-xl bg-[#3B2FE0] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3125C4]"
            >
              Browse Marketplace
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const product = getProduct(item);
              const supplier = getSupplier(item);
              const productName = product.name || product.name_en || product.name_pt || "Unnamed product";
              const supplierName =
                supplier?.company_name ||
                supplier?.name ||
                supplier?.full_name ||
                "Supplier / Producer";

              return (
                <article
                  key={item.id || item.product_id || `${productName}-${index}`}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">
                          {productName}
                        </h2>

                        {item.status && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
                            {item.status}
                          </span>
                        )}
                      </div>

                      {(product.description ||
                        product.short_description_en ||
                        product.short_description_pt) && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {product.description ||
                            product.short_description_en ||
                            product.short_description_pt}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                        <span className="font-bold text-gray-900">
                          {product.price != null
                            ? `${product.currency || "ZAR"} ${Number(product.price).toLocaleString()}`
                            : "Price unavailable"}
                        </span>

                        {item.referral_code && (
                          <span>
                            Referral:{" "}
                            <span className="font-semibold text-gray-700">
                              {item.referral_code}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full rounded-2xl bg-gray-50 p-4 lg:max-w-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Supplier / Producer
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                          {supplier?.logo_url || supplier?.avatar_url ? (
                            <img
                              src={supplier.logo_url || supplier.avatar_url}
                              alt={supplierName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {supplierName}
                            </p>

                            {supplier?.verification_status &&
                              supplier.verification_status !== "unverified" && (
                                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
                              )}
                          </div>

                          {(supplier?.country || supplier?.country_code) && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3.5 w-3.5" />
                              {supplier.country || supplier.country_code}
                              {supplier.city ? ` · ${supplier.city}` : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {supplier?.company_type && (
                        <p className="mt-3 text-xs text-gray-500">
                          Type:{" "}
                          <span className="font-semibold capitalize text-gray-700">
                            {supplier.company_type}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 lg:w-40 lg:flex-col">
                      {(item.product_page_url || product.slug) && (
                        <a
                          href={
                            item.product_page_url ||
                            `/marketplace/products/${product.slug}`
                          }
                          target={item.product_page_url ? "_blank" : undefined}
                          rel={item.product_page_url ? "noreferrer" : undefined}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Product
                        </a>
                      )}

                      {item.checkout_url && (
                        <a
                          href={item.checkout_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3B2FE0] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3125C4]"
                        >
                          Affiliate Link
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
