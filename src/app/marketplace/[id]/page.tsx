"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

interface Product {
  id: string;
  nome: string;
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
  const [affiliateLink, setAffiliateLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      const user = await getCurrentUser();

      const { data, error: queryError } = await supabase
        .from("products")
        .select(
          `
            id,
            nome,
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
        .maybeSingle();

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
          .select("link_unico")
          .eq("product_id", productId)
          .eq("vendedor_id", user.id)
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
            <div className="aspect-square bg-slate-100">
              {product.fotos?.[0] ? (
                <img
                  src={product.fotos[0]}
                  alt={product.nome}
                  className="h-full w-full object-cover"
                />
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
                  }}
                  className="flex h-12 items-center justify-center rounded-lg border border-[#16294F] bg-white px-6 text-sm font-semibold text-[#16294F] transition hover:bg-slate-50"
                >
                  Affiliate Link
                </button>
              ) : (
                <div className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-6 text-sm font-medium text-slate-400">
                  Affiliate Link unavailable
                </div>
              )}
            </div>

            {affiliateLink && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Your Affiliate Link
                </p>
                <input
                  readOnly
                  value={affiliateLink}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
