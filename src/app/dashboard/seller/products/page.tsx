"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Link2, Package, RefreshCw } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  getAvailableAffiliateProducts,
  getAffiliateProducts,
  selectAffiliateProduct,
  type MarketplaceProduct,
} from "@/lib/newvelion-api";
import { supabase } from "@/lib/supabase";

type AffiliateProduct = {
  product_id?: string;
  products?: MarketplaceProduct | null;
  status?: string | null;
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [selected, setSelected] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [marketplace, mine] = await Promise.all([
        getAvailableAffiliateProducts(),
        getAffiliateProducts(),
      ]);

      setProducts(
        Array.isArray(marketplace)
          ? marketplace
          : marketplace?.data || []
      );

      setSelected(Array.isArray(mine) ? mine : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selectedIds = useMemo(
    () =>
      new Set(
        selected
          .map((item) => item.product_id || item.products?.id)
          .filter(Boolean)
      ),
    [selected]
  );

  async function affiliate(productId: string) {
    try {
      setSelecting(productId);
      setError("");
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Authentication required.");
      }

      await selectAffiliateProduct({
        productId,
        token: session.access_token,
      });

      setMessage("Product added to your affiliate account.");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not affiliate this product."
      );
    } finally {
      setSelecting("");
    }
  }

  return (
    <DashboardShell
      area="seller"
      activeKey="products"
      title="Marketplace"
      subtitle="Choose products from NewVelion suppliers and start promoting them."
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Available products
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">
                Supplier Marketplace
              </h1>
            </div>

            <button
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading marketplace...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <Package className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-900">
              No active products available
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Suppliers have not added any active products yet.
            </p>
          </div>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const isSelected = selectedIds.has(product.id);

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name_en}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-100">
                      <Package className="h-10 w-10 text-slate-400" />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-slate-950">
                          {product.name_en || product.name_pt}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {product.categories?.name_en || "Marketplace product"}
                        </p>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Price</p>
                        <p className="mt-1 font-bold text-slate-950">
                          R{" "}
                          {Number(product.price ?? 0).toLocaleString("en-ZA", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Commission</p>
                        <p className="mt-1 font-bold text-slate-950">
                          {Number(
                            product.commission_percentage ?? 0
                          ).toLocaleString("en-ZA")}
                          %
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => void affiliate(product.id)}
                      disabled={isSelected || selecting === product.id}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      <Link2 className="h-4 w-4" />
                      {isSelected
                        ? "Already affiliated"
                        : selecting === product.id
                          ? "Adding..."
                          : "Affiliate This Product"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
