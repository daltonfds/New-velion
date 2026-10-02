"use client";

import { useEffect, useState } from "react";
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
  categoria_id: string | null;
  subcategoria_id: string | null;
}

interface Category {
  id: string;
  nome: string;
  parent_id: string | null;
}

interface Affiliation {
  id: string;
  product_id: string;
  link_unico: string;
  ativo: boolean;
  created_at: string;
  product: Product | null;
}

export default function SellerProductsPage() {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [subcategoryId, setSubcategoryId] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const user = await getCurrentUser();

      if (!user) {
        setError("You must be signed in to view your products.");
        setLoading(false);
        return;
      }

      const [{ data, error: queryError }, { data: categoryData, error: categoryError }] =
        await Promise.all([
          supabase
            .from("affiliations")
        .select(
          `
            id,
            product_id,
            link_unico,
            ativo,
            created_at,
            product:products (
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
              categoria_id,
              subcategoria_id
            )
          `,
        )
            .eq("vendedor_id", user.id)
            .eq("ativo", true)
            .order("created_at", { ascending: false }),
          supabase
            .from("categories")
            .select("id, nome, parent_id")
            .order("ordem", { ascending: true })
            .order("nome", { ascending: true }),
        ]);

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      if (categoryError) {
        setError(categoryError.message);
        setLoading(false);
        return;
      }

      setCategories((categoryData ?? []) as Category[]);
      setAffiliations(
        ((data ?? []) as unknown) as Affiliation[],
      );
      setLoading(false);
    }

    load();
  }, []);

  async function copyLink(link: string, id: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(id);

      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch {
      setError("Unable to copy the affiliate link.");
    }
  }

  function getAffiliateUrl(linkUnico: string) {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      window.location.origin;

    return `${siteUrl}/${linkUnico}`;
  }

  const parentCategories = categories
    .filter((category) => !category.parent_id)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const visibleSubcategories = categories
    .filter((category) => category.parent_id === categoryId)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const filteredAffiliations = affiliations.filter((affiliation) => {
    if (categoryId === "all") return true;

    const product = affiliation.product;
    if (!product) return false;

    if (product.categoria_id !== categoryId) return false;

    if (
      subcategoryId !== "all" &&
      product.subcategoria_id !== subcategoryId
    ) {
      return false;
    }

    return true;
  });

  function getCategoryName(id: string | null) {
    if (!id) return "Uncategorized";
    return categories.find((category) => category.id === id)?.nome ?? "Uncategorized";
  }

  function getSubcategoryName(id: string | null) {
    if (!id) return "No subcategory";
    return categories.find((category) => category.id === id)?.nome ?? "No subcategory";
  }

  function formatMoney(
    value: number,
    currency: string,
  ) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  }

  function formatCommission(
    type: string,
    value: number,
    currency: string,
  ) {
    if (type === "percentual") {
      return `${value}%`;
    }

    return formatMoney(value, currency);
  }

  return (
    <AppShell area="seller">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              My Products
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Products you have selected to promote.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Browse Marketplace
          </Link>
        </div>

        <Card>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setSubcategoryId("all");
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-600"
              >
                <option value="all">All categories</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Subcategory
              </label>
              <select
                value={subcategoryId}
                onChange={(event) => setSubcategoryId(event.target.value)}
                disabled={categoryId === "all" || visibleSubcategories.length === 0}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="all">
                  {categoryId === "all"
                    ? "Select a category first"
                    : visibleSubcategories.length
                      ? "All subcategories"
                      : "No subcategories"}
                </option>
                {visibleSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {error && (
          <Card>
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        {loading ? (
          <Card>
            <div className="py-12 text-center text-sm text-slate-500">
              Loading your products...
            </div>
          </Card>
        ) : filteredAffiliations.length === 0 ? (
          <Card>
            <div className="py-14 text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                {affiliations.length === 0
                  ? "No products yet"
                  : "No products match these filters"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {affiliations.length === 0
                  ? "Browse the marketplace and select products you want to promote."
                  : "Try another category or subcategory."}
              </p>

              <Link
                href="/marketplace"
                className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Browse Marketplace
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAffiliations.map((affiliation) => {
              const product = affiliation.product;

              if (!product) {
                return (
                  <Card key={affiliation.id}>
                    <p className="text-sm text-slate-500">
                      Product information is unavailable.
                    </p>
                  </Card>
                );
              }

              const price =
                product.preco_promocional ??
                product.preco;

              const affiliateUrl =
                getAffiliateUrl(affiliation.link_unico);

              return (
                <Card
                  key={affiliation.id}
                  className="overflow-hidden p-0"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    {product.fotos?.[0] ? (
                      <img
                        src={product.fotos[0]}
                        alt={product.nome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-slate-900">
                          {product.nome}
                        </h2>

                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {product.descricao ||
                            "No description available."}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                          {getCategoryName(product.categoria_id)}
                        </span>

                        {product.subcategoria_id && (
                          <span className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {getSubcategoryName(product.subcategoria_id)}
                          </span>
                        )}
                      </div>

                      <Badge>
                        {affiliation.ativo
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">
                          Price
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {formatMoney(
                            price,
                            product.moeda,
                          )}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">
                          Commission
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {formatCommission(
                            product.comissao_tipo,
                            product.comissao_valor,
                            product.moeda,
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Affiliate Link
                      </p>

                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={affiliateUrl}
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            copyLink(
                              affiliateUrl,
                              affiliation.id,
                            )
                          }
                          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {copied === affiliation.id
                            ? "Copied"
                            : "Copy"}
                        </button>
                      </div>
                    </div>

                    <Link
                      href={`/marketplace/${product.id}`}
                      className="block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View Product
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
