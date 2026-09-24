"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Check,
  Clipboard,
  ExternalLink,
  Link2,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { getAffiliateProducts } from "@/lib/newvelion-api";

type Product = {
  id?: string;
  name?: string;
  title?: string;
  slug?: string;
  price?: number | string | null;
  currency?: string | null;
  image_url?: string | null;
  image?: string | null;
  thumbnail_url?: string | null;
  status?: string | null;
  commission_percentage?: number | string | null;
  commission_rate?: number | string | null;
  supplier?: {
    name?: string | null;
    company_name?: string | null;
  } | null;
};

type AffiliateProduct = {
  id?: string;
  product_id?: string;
  referral_code?: string | null;
  affiliate_code?: string | null;
  affiliate_link?: string | null;
  product_page_url?: string | null;
  checkout_url?: string | null;
  status?: string | null;
  created_at?: string | null;
  product?: Product | null;
};

function money(value: unknown) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getProductName(item: AffiliateProduct) {
  return (
    item.product?.name ||
    item.product?.title ||
    "Affiliate product"
  );
}

function getProductImage(item: AffiliateProduct) {
  return (
    item.product?.image_url ||
    item.product?.image ||
    item.product?.thumbnail_url ||
    ""
  );
}

function getReferralCode(item: AffiliateProduct) {
  return item.referral_code || item.affiliate_code || "";
}

function getProductLink(item: AffiliateProduct) {
  return (
    item.product_page_url ||
    item.product?.slug
      ? item.product_page_url ||
        `/marketplace/products/${item.product?.slug || ""}`
      : ""
  );
}

function getAffiliateLink(item: AffiliateProduct) {
  return item.affiliate_link || "";
}

function getCheckoutLink(item: AffiliateProduct) {
  return item.checkout_url || "";
}

function getStatus(item: AffiliateProduct) {
  return (item.status || "active").toLowerCase();
}

export default function SellerLinksPage() {
  const [items, setItems] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copied, setCopied] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getAffiliateProducts();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your affiliate links."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const copyText = async (value: string, label: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setNotice(`${label} copied successfully.`);
      window.setTimeout(() => setCopied(""), 1800);
      window.setTimeout(() => setNotice(""), 2500);
    } catch {
      setNotice("Unable to copy this link.");
      window.setTimeout(() => setNotice(""), 2500);
    }
  };

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();

    return items.filter((item) => {
      const name = getProductName(item).toLowerCase();
      const referral = getReferralCode(item).toLowerCase();
      const status = getStatus(item);

      const matchesQuery =
        !term ||
        name.includes(term) ||
        referral.includes(term);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  const stats = useMemo(() => {
    const active = items.filter((item) => getStatus(item) === "active").length;
    const withCheckout = items.filter((item) => Boolean(getCheckoutLink(item))).length;
    const withAffiliate = items.filter((item) => Boolean(getAffiliateLink(item))).length;

    return {
      total: items.length,
      active,
      withCheckout,
      withAffiliate,
    };
  }, [items]);

  return (
    <DashboardShell
      area="seller"
      activeKey="links"
      title="Sales Links"
      subtitle="Manage the tracked links you use to promote your selected products."
    >
      <div className="min-h-screen bg-[#f7f8fc] px-4 py-5 md:px-8 md:py-8">
        <div className="mx-auto max-w-7xl space-y-6">

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 p-6 md:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <Link2 className="h-3.5 w-3.5" />
                    Affiliate link center
                  </div>

                  <h1 className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
                    Sales Links
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-700/80 md:text-base">
                    Your product and checkout links are connected to your
                    <span className="font-semibold text-indigo-700"> referral code</span>,
                    so clicks, conversions, sales and commissions can be attributed
                    to your account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void load(true)}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Selected products",
                value: stats.total,
                icon: Package,
              },
              {
                label: "Active links",
                value: stats.active,
                icon: Check,
              },
              {
                label: "Affiliate links",
                value: stats.withAffiliate,
                icon: Link2,
              },
              {
                label: "Checkout links",
                value: stats.withCheckout,
                icon: ShoppingCart,
              },
            ].map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-slate-100 p-2.5">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {card.value}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-blue-200/50 md:p-6">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-start">
              <div className="rounded-xl border border-white/20 bg-white/15 p-2.5 shadow-sm backdrop-blur-sm">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>

              <div>
                <h2 className="font-bold text-white">
                  How your tracking works
                </h2>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-blue-50">
                  Every affiliate link identifies your Seller account through
                  its <span className="font-semibold text-white">referral code</span>,
                  allowing clicks, conversions, sales and commissions to be
                  attributed to your account.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
                  {[
                    "Seller",
                    "Referral code",
                    "Click",
                    "Checkout",
                    "Conversion",
                    "Sale",
                    "Commission",
                  ].map((step, index) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-white shadow-sm backdrop-blur-sm">
                        {step}
                      </span>
                      {index < 6 && (
                        <span className="text-white/60">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Your affiliate links
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Use these links when promoting your selected products.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search product or referral..."
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-64"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
            </div>

            {notice && (
              <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700">
                {notice}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading your affiliate links...
                </div>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <div className="flex items-start gap-3">
                    <X className="mt-0.5 h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">
                        Unable to load affiliate links
                      </p>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                      <button
                        type="button"
                        onClick={() => void load()}
                        className="mt-4 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <Link2 className="h-7 w-7 text-slate-500" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-950">
                  {items.length === 0
                    ? "No affiliate links yet"
                    : "No matching links"}
                </h3>

                <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                  {items.length === 0
                    ? "Select a product in the Marketplace first. Once it is registered for your account, its tracked links will appear here."
                    : "Try another product name, referral code or status filter."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const name = getProductName(item);
                  const image = getProductImage(item);
                  const referral = getReferralCode(item);
                  const productLink = getProductLink(item);
                  const affiliateLink = getAffiliateLink(item);
                  const checkoutLink = getCheckoutLink(item);
                  const status = getStatus(item);

                  return (
                    <article
                      key={item.id || `${item.product_id}-${referral}`}
                      className="p-5 transition hover:bg-slate-50/70 md:p-6"
                    >
                      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">

                        <div className="flex min-w-0 gap-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                            {image ? (
                              <img
                                src={image}
                                alt={name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-6 w-6 text-slate-400" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-base font-bold text-slate-950">
                                {name}
                              </h3>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                                  status === "active"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {status}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 font-medium">
                                <Tag className="h-3.5 w-3.5" />
                                {referral || "No referral code"}
                              </span>

                              <span>
                                Added {formatDate(item.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px]">
                          <LinkCard
                            icon={ExternalLink}
                            title="Product Page Link"
                            description="Tracked product destination"
                            value={productLink}
                            copied={copied === `${item.id}-product`}
                            onCopy={() =>
                              void copyText(
                                productLink,
                                `${item.id}-product`
                              )
                            }
                          />

                          <LinkCard
                            icon={ShoppingCart}
                            title="Affiliate Checkout Link"
                            description="Tracked checkout destination"
                            value={checkoutLink}
                            copied={copied === `${item.id}-checkout`}
                            onCopy={() =>
                              void copyText(
                                checkoutLink,
                                `${item.id}-checkout`
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                              <Sparkles className="h-3.5 w-3.5" />
                              Affiliate tracking link
                            </div>

                            <p className="mt-1 truncate text-sm font-medium text-slate-700">
                              {affiliateLink || "No affiliate link returned"}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={!affiliateLink}
                              onClick={() =>
                                void copyText(
                                  affiliateLink,
                                  `${item.id}-affiliate`
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {copied === `${item.id}-affiliate` ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Clipboard className="h-4 w-4" />
                              )}
                              Copy Affiliate Link
                            </button>

                            {affiliateLink && (
                              <a
                                href={affiliateLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {productLink && (
                          <a
                            href={productLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open Product Page
                          </a>
                        )}

                        {checkoutLink && (
                          <a
                            href={checkoutLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Open Checkout
                          </a>
                        )}

                        {referral && (
                          <button
                            type="button"
                            onClick={() =>
                              void copyText(referral, `${item.id}-referral`)
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            {copied === `${item.id}-referral` ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Clipboard className="h-3.5 w-3.5" />
                            )}
                            Copy Referral Code
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={Link2}
              title="Product Page"
              text="Use the product page when you want customers to learn about the offer before buying."
            />

            <InfoCard
              icon={ShoppingCart}
              title="Affiliate Checkout"
              text="Use the checkout link when you want to send the customer directly toward purchase."
            />

            <InfoCard
              icon={BarChart3}
              title="Tracking"
              text="Your referral identifies the Seller journey so clicks and downstream sales can be attributed correctly."
            />
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}

function LinkCard({
  icon: Icon,
  title,
  description,
  value,
  copied,
  onCopy,
}: {
  icon: typeof ExternalLink;
  title: string;
  description: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-500" />
            <p className="text-sm font-bold text-slate-900">{title}</p>
          </div>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <button
          type="button"
          disabled={!value}
          onClick={onCopy}
          className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          title={copied ? "Copied" : "Copy link"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Clipboard className="h-4 w-4" />
          )}
        </button>
      </div>

      <p className="mt-3 truncate rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
        {value || "Not available"}
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Link2;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-md shadow-blue-200">
        <Icon className="h-5 w-5 text-white" />
      </div>

      <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
