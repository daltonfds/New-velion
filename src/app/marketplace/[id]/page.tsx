"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { createAffiliation } from "@/lib/services/affiliations";

interface Product {
  id: string;
  nome: string;
  categoria_id: string | null;
  subcategoria_id: string | null;
  descricao: string | null;
  preco: number;
  preco_promocional: number | null;
  moeda: string;
  comissao_tipo: string;
  comissao_valor: number;
  fotos: string[];
  ativo: boolean;
  checkout_url?: string | null;
}

export default function SellerProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<
    { id: string; nome: string; parent_id: string | null }[]
  >([]);
  const [affiliateLink, setAffiliateLink] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [affiliating, setAffiliating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      const user = await getCurrentUser();

      const [{ data, error: queryError }, { data: categoryData }] =
        await Promise.all([
          supabase
            .from("products")
        .select(
          `
            id,
            nome,
            categoria_id,
            subcategoria_id,
            descricao,
            preco,
            preco_promocional,
            moeda,
            comissao_tipo,
            comissao_valor,
            fotos,
            ativo,
            checkout_url
          `,
        )
        .eq("id", productId)
        .maybeSingle(),
          supabase
            .from("categories")
            .select("id, nome, parent_id")
            .order("ordem", { ascending: true }),
        ]);

      if (categoryData) {
        setCategories(categoryData);
      }

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Product not found.");
        setLoading(false);
        return;
      }

      setProduct(data as Product);

      if (user) {
        const { data: affiliation } = await supabase
          .from("affiliations")
          .select("link_unico, ativo")
          .eq("product_id", productId)
          .eq("vendedor_id", user.id)
          .eq("ativo", true)
          .maybeSingle();

        if (affiliation?.link_unico) {
          const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL ||
            window.location.origin;

          setAffiliateLink(
            `${siteUrl}/${affiliation.link_unico}`,
          );
        }
      }

      setLoading(false);
    }

    loadProduct();
  }, [productId]);

  function formatMoney(value: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  }

  function formatCommission(type: string, value: number, currency: string) {
    if (type === "percentual") return `${value}%`;
    return formatMoney(value, currency);
  }

  if (loading) {
    return (
      <AppShell area="seller">
        <Card>
          <div className="py-16 text-center text-sm text-slate-500">
            Loading product...
          </div>
        </Card>
      </AppShell>
    );
  }

  if (error || !product) {
    return (
      <AppShell area="seller">
        <Card>
          <div className="py-16 text-center">
            <h1 className="text-xl font-semibold text-slate-900">
              Product unavailable
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {error || "This product could not be found."}
            </p>
            <Link
              href="/dashboard/seller/products"
              className="mt-6 inline-flex rounded-lg bg-[#16294F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#10203d]"
            >
              Back to My Products
            </Link>
          </div>
        </Card>
      </AppShell>
    );
  }

  const price = product.preco_promocional ?? product.preco;

  return (
    <AppShell area="seller">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/dashboard/seller/products"
          className="inline-flex text-sm font-medium text-slate-500 hover:text-[#16294F]"
        >
          ← Back to My Products
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <div
              className="relative aspect-square overflow-hidden bg-slate-100 touch-pan-y"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                e.currentTarget.dataset.touchX = String(touch.clientX);
              }}
              onTouchEnd={(e) => {
                const startX = Number(e.currentTarget.dataset.touchX || 0);
                const endX = e.changedTouches[0]?.clientX || startX;
                const diff = startX - endX;

                if (Math.abs(diff) < 50 || product.fotos.length <= 1) return;

                if (diff > 0) {
                  setCurrentPhoto((index) =>
                    Math.min(index + 1, product.fotos.length - 1),
                  );
                } else {
                  setCurrentPhoto((index) => Math.max(index - 1, 0));
                }
              }}
            >
              {product.fotos?.length ? (
                <>
                  <img
                    src={product.fotos[currentPhoto]}
                    alt={`${product.nome} ${currentPhoto + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {product.fotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous image"
                        onClick={() =>
                          setCurrentPhoto((index) => Math.max(index - 1, 0))
                        }
                        disabled={currentPhoto === 0}
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-700 shadow-sm disabled:opacity-30"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        aria-label="Next image"
                        onClick={() =>
                          setCurrentPhoto((index) =>
                            Math.min(index + 1, product.fotos.length - 1),
                          )
                        }
                        disabled={currentPhoto === product.fotos.length - 1}
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-slate-700 shadow-sm disabled:opacity-30"
                      >
                        ›
                      </button>

                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5">
                        {product.fotos.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            aria-label={`Go to image ${index + 1}`}
                            onClick={() => setCurrentPhoto(index)}
                            className={`h-1.5 rounded-full transition-all ${
                              index === currentPhoto
                                ? "w-5 bg-white"
                                : "w-1.5 bg-white/60"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No image available
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <div>
              <div className="mb-3">
                <Badge>{product.ativo ? "Active" : "Inactive"}</Badge>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {product.nome}
              </h1>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {categories.find(
                      (category) => category.id === product.categoria_id,
                    )?.nome || "Uncategorized"}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Subcategory
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {categories.find(
                      (category) => category.id === product.subcategoria_id,
                    )?.nome || "No subcategory"}
                  </p>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {product.descricao || "No description available."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Price
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {formatMoney(price, product.moeda)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Commission
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {formatCommission(
                    product.comissao_tipo,
                    product.comissao_valor,
                    product.moeda,
                  )}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {product.checkout_url ? (
                <a
                  href={product.checkout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center rounded-lg bg-[#16294F] px-6 text-sm font-semibold text-white transition hover:bg-[#10203d]"
                >
                  Open Checkout
                </a>
              ) : (
                <div className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-6 text-sm font-medium text-slate-400">
                  Checkout unavailable
                </div>
              )}

              {affiliateLink ? (
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(affiliateLink);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1800);
                  }}
                  className="flex h-12 items-center justify-center rounded-lg border border-[#16294F] bg-white px-6 text-sm font-semibold text-[#16294F] transition hover:bg-slate-50"
                >
                  {copied ? "Copied!" : "Copy Affiliate Link"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={affiliating}
                  onClick={async () => {
                    try {
                      setError("");
                      setAffiliating(true);

                      const result = await createAffiliation(product.id);

                      setAffiliateLink(result.affiliate_link);
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Failed to create affiliate link.",
                      );
                    } finally {
                      setAffiliating(false);
                    }
                  }}
                  className="flex h-12 items-center justify-center rounded-lg bg-[#16294F] px-6 text-sm font-semibold text-white transition hover:bg-[#10203d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {affiliating ? "Creating affiliate link..." : "Sell This Product"}
                </button>
              )}
            </div>

            {affiliateLink && (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Promotion Links
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Use these links to promote this product.
                    </p>
                  </div>
                  <Badge>Affiliate Ready</Badge>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-semibold text-slate-700">
                      Affiliate Link
                    </p>
                    <div className="mt-2 flex gap-2">
                      <input
                        readOnly
                        value={affiliateLink}
                        className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(affiliateLink);
                          setCopied(true);
                          window.setTimeout(() => setCopied(false), 1800);
                        }}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-semibold text-slate-700">
                      Product Page
                    </p>
                    <div className="mt-2 flex gap-2">
                      <input
                        readOnly
                        value={`${window.location.origin}/marketplace/${product.id}`}
                        className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/marketplace/${product.id}`,
                          );
                        }}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-semibold text-slate-700">
                      Checkout
                    </p>
                    <div className="mt-2 flex gap-2">
                      <input
                        readOnly
                        value={product.checkout_url || "Checkout unavailable"}
                        className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none"
                      />
                      {product.checkout_url && (
                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              product.checkout_url || "",
                            );
                          }}
                          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </AppShell>
  );
}
