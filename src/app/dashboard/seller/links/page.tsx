"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

interface Affiliation {
  id: string;
  product_id: string;
  link_unico: string;
  ativo: boolean;
  created_at: string;
  product: {
    nome: string;
    slug: string;
    preco: number;
    moeda: string;
    fotos: string[];
  } | null;
}

export default function SellerLinksPage() {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const user = await getCurrentUser();

      if (!user) {
        setError("You must be signed in to view your affiliate links.");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("affiliations")
        .select(
          `
            id,
            product_id,
            link_unico,
            ativo,
            created_at,
            product:products (
              nome,
              slug,
              preco,
              moeda,
              fotos
            )
          `,
        )
        .eq("vendedor_id", user.id)
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      setAffiliations(
        (data ?? []) as unknown as Affiliation[],
      );

      setLoading(false);
    }

    load();
  }, []);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://newvelion.com");

  const links = useMemo(() => {
    return affiliations.map((item) => ({
      ...item,
      affiliateUrl: `${siteUrl.replace(/\/$/, "")}/${item.link_unico}`,
    }));
  }, [affiliations, siteUrl]);

  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return links;

    return links.filter((item) => {
      return (
        item.product?.nome
          ?.toLowerCase()
          .includes(query) ||
        item.link_unico
          .toLowerCase()
          .includes(query)
      );
    });
  }, [links, search]);

  async function copyLink(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);

      window.setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch {
      setError("Unable to copy the affiliate link.");
    }
  }

  async function shareLink(
    url: string,
    productName: string,
  ) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} on Newvelion.`,
          url,
        });
      } catch {
        // User cancelled sharing.
      }
      return;
    }

    await copyLink(url, productName);
  }

  function formatMoney(
    value: number,
    currency = "ZAR",
  ) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value).replace("ZAR", "R");
  }

  return (
    <AppShell area="seller">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Affiliate Links
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and share your links for the products you promote.
            </p>
          </div>

          <a
            href="/marketplace"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Browse Marketplace
          </a>
        </div>

        <Card>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Your affiliate links
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {affiliations.length} linked product
                {affiliations.length === 1 ? "" : "s"}.
              </p>
            </div>

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products or links..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 md:w-80"
            />
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
              Loading affiliate links...
            </div>
          </Card>
        ) : filteredLinks.length === 0 ? (
          <Card>
            <div className="py-14 text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                No affiliate links yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Choose a product in the Marketplace to create your first affiliate link.
              </p>

              <a
                href="/marketplace"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Go to Marketplace
              </a>
            </div>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredLinks.map((item) => {
              const productName =
                item.product?.nome || "Unknown product";

              const image =
                item.product?.fotos?.[0] || "";

              return (
                <Card key={item.id}>
                  <div className="flex gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {image ? (
                        <img
                          src={image}
                          alt={productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate font-semibold text-slate-900">
                            {productName}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.product
                              ? formatMoney(
                                  Number(item.product.preco),
                                  item.product.moeda,
                                )
                              : "Price unavailable"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.ativo
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.ativo ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="break-all text-xs text-slate-600">
                          {item.affiliateUrl}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            copyLink(
                              item.affiliateUrl,
                              item.id,
                            )
                          }
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                          {copied === item.id
                            ? "Copied"
                            : "Copy Link"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            shareLink(
                              item.affiliateUrl,
                              productName,
                            )
                          }
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Share
                        </button>

                        <a
                          href={item.affiliateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Open Link
                        </a>
                      </div>
                    </div>
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
