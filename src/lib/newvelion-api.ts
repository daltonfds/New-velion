import { supabase } from "@/lib/supabase";
const API_URL =
  process.env.NEXT_PUBLIC_NEWVELION_API_URL ||
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/newvelion-api`;

const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type MarketplaceProduct = {
  id: string;
  supplier_id: string;
  category_id: string | null;
  name_en: string;
  name_pt: string;
  slug: string;
  short_description_en: string | null;
  short_description_pt: string | null;
  description_en: string | null;
  description_pt: string | null;
  image_url: string | null;
  price: number | null;
  currency: string | null;
  commission_percentage: number | null;
  checkout_url: string | null;
  stock: number | null;
  featured: boolean;
  offer: boolean;
  status: string;
  total_clicks: number;
  total_sales: number;
  total_conversions: number;
  total_commission: number;
  original_price: number | null;
  offer_price: number | null;
  product_page_url: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name_en: string;
    name_pt: string;
    slug: string;
  } | null;
  product_materials?: Array<{
    id: string;
    product_id: string;
    title_en: string | null;
    title_pt: string | null;
    material_type: string;
    file_url: string;
    created_at: string;
  }>;
};

type MarketplaceResponse = {
  data: MarketplaceProduct[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export async function getMarketplaceProducts(params: {
  q?: string;
  category?: string;
  featured?: boolean;
  offer?: boolean;
  sort?: "popular" | "commission" | "newest" | "price";
  page?: number;
  limit?: number;
} = {}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.category) searchParams.set("category", params.category);
  if (params.featured) searchParams.set("featured", "true");
  if (params.offer) searchParams.set("offer", "true");
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const response = await fetch(
    `${API_URL}/marketplace/products?${searchParams.toString()}`,
    {
      headers: {
        apikey: API_KEY || "",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Marketplace API error: ${response.status}`);
  }

  return (await response.json()) as MarketplaceResponse;
}

export async function getMarketplaceCategories() {
  const response = await fetch(`${API_URL}/marketplace/categories`, {
    headers: {
      apikey: API_KEY || "",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Categories API error: ${response.status}`);
  }

  return response.json();
}

export async function getMarketplaceProduct(slug: string) {
  const response = await fetch(
    `${API_URL}/marketplace/products/${encodeURIComponent(slug)}`,
    {
      headers: {
        apikey: API_KEY || "",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Product API error: ${response.status}`);
  }

  return response.json();
}


export async function trackAffiliateClick(params: {
  referralCode: string;
  destination?: "product" | "checkout" | "materials";
  materialId?: string;
  visitorId?: string;
  sessionId?: string;
}) {
  const response = await fetch(`${API_URL}/track/click`, {
    method: "POST",
    headers: {
      apikey: API_KEY || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      referral_code: params.referralCode,
      destination: params.destination || "product",
      material_id: params.materialId || null,
      visitor_id: params.visitorId || null,
      session_id: params.sessionId || null,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Affiliate tracking error: ${response.status}`);
  }

  return response.json();
}

export async function selectAffiliateProduct(params: {
  productId: string;
  token: string;
}) {
  const response = await fetch(`${API_URL}/affiliate/products`, {
    method: "POST",
    headers: {
      apikey: API_KEY || "",
      Authorization: `Bearer ${params.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      product_id: params.productId,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Affiliate product error: ${response.status}`);
  }

  return response.json();
}

export type AdminStats = {
  counts: {
    profiles: number;
    products: number;
    sales: number;
    commissions: number;
    withdrawals: number;
    disputes: number;
    kyc_submissions: number;
    analytics_events: number;
    sellers: number;
    suppliers: number;
    active_products: number;
    pending_products: number;
    revenue: number;
    commission_amount: number;
    pending_withdrawals: number;
    pending_withdrawal_amount: number;
    clicks: number;
  };
  salesByDay: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
};

export async function getAdminStats(): Promise<AdminStats> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: API_KEY || "",
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload?.error || "Failed to load admin statistics."
    );
  }

  const totals = payload?.data?.totals ?? {};
  const counts = payload?.counts ?? {};

  return {
    counts: {
      profiles: Number(totals.users ?? counts.profiles ?? 0),
      products: Number(totals.products ?? counts.products ?? 0),
      sales: Number(totals.sales ?? counts.sales ?? 0),
      commissions: Number(
        totals.commissions ?? counts.commissions ?? 0
      ),
      withdrawals: Number(
        totals.withdrawalsPending ?? counts.withdrawals ?? 0
      ),
      disputes: Number(
        totals.disputesOpen ?? counts.disputes ?? 0
      ),
      kyc_submissions: Number(
        totals.kycPending ?? counts.kyc_submissions ?? 0
      ),
      analytics_events: Number(
        totals.clicks ?? counts.analytics_events ?? 0
      ),
      sellers: Number(totals.sellers ?? counts.sellers ?? 0),
      suppliers: Number(totals.suppliers ?? counts.suppliers ?? 0),
      active_products: Number(
        totals.activeProducts ?? counts.active_products ?? 0
      ),
      pending_products: Number(
        totals.pendingProducts ?? counts.pending_products ?? 0
      ),
      revenue: Number(totals.revenue ?? counts.revenue ?? 0),
      commission_amount: Number(
        totals.commissionAmount ??
          totals.commission_amount ??
          counts.commission_amount ??
          0
      ),
      pending_withdrawals: Number(
        totals.withdrawalsPending ?? counts.pending_withdrawals ?? 0
      ),
      pending_withdrawal_amount: Number(
        totals.withdrawalAmountPending ??
          counts.pending_withdrawal_amount ??
          0
      ),
      clicks: Number(totals.clicks ?? counts.clicks ?? 0),
    },
    salesByDay: Array.isArray(payload?.data?.salesByDay)
      ? payload.data.salesByDay.map((item: any) => ({
          date: String(item?.date ?? ""),
          sales: Number(item?.sales ?? 0),
          revenue: Number(item?.revenue ?? 0),
        }))
      : [],
  };
}

export type AdminUser = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  country?: string | null;
  role?: "seller" | "supplier" | "admin" | string | null;
  status?: string | null;
  created_at?: string | null;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(
    `${API_URL}/admin/users`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Failed to load users.");
  }

  return Array.isArray(payload) ? payload : payload?.data || [];
}

export type AdminSeller = AdminUser & {
  sales_count?: number | null;
  revenue?: number | null;
  commissions?: number | null;
};

export async function getAdminSellers(): Promise<AdminSeller[]> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(
    `${API_URL}/admin/sellers`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Failed to load sellers.");
  }

  return Array.isArray(payload) ? payload : payload?.data || [];
}

export type AdminSupplier = AdminUser & {
  products_count?: number | null;
  sales_count?: number | null;
  revenue?: number | null;
};

export async function getAdminSuppliers(): Promise<AdminSupplier[]> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(
    `${API_URL}/admin/suppliers`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Failed to load suppliers.");
  }

  return Array.isArray(payload) ? payload : payload?.data || [];
}


export type AdminCategory = {
  id: string;
  name_en?: string | null;
  name_pt?: string | null;
  slug?: string | null;
  description?: string | null;
  active?: boolean | null;
  created_at?: string | null;
};

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(
    `${API_URL}/admin/categories`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Failed to load categories.");
  }

  return Array.isArray(payload) ? payload : payload?.data || [];
}

export type AdminTransaction = {
  id: string;
  user_id?: string | null;
  type?: string | null;
  direction?: string | null;
  amount?: number | null;
  currency?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  description?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export async function getAdminTransactions(): Promise<AdminTransaction[]> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(
    `${API_URL}/admin/transactions`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Failed to load transactions.");
  }

  return Array.isArray(payload) ? payload : payload?.data || [];
}

export type AdminCommission = {
  id: string;
  affiliate_id?: string | null;
  supplier_id?: string | null;
  product_id?: string | null;
  conversion_id?: string | null;
  sale_id?: string | null;
  rate?: number | null;
  sale_amount?: number | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  available_at?: string | null;
  created_at?: string | null;
};

export async function getAdminCommissions(): Promise<AdminCommission[]> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(
    `${API_URL}/admin/commissions`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Failed to load commissions.");
  }

  return Array.isArray(payload) ? payload : payload?.data || [];
}

export type AdminWithdrawal = Record<string, unknown>;
export type AdminDispute = Record<string, unknown>;
export type AdminKyc = Record<string, unknown>;
export type AdminAnalyticsEvent = Record<string, unknown>;

async function protectedApi(path: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed.");
  }

  return payload;
}

export async function getAdminWithdrawals(): Promise<AdminWithdrawal[]> {
  const payload = await protectedApi("/admin/withdrawals");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getAdminDisputes(): Promise<AdminDispute[]> {
  const payload = await protectedApi("/admin/disputes");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getAdminKyc(): Promise<AdminKyc[]> {
  const payload = await protectedApi("/admin/kyc");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsEvent[]> {
  const payload = await protectedApi("/admin/analytics");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getSupplierProducts() {
  const payload = await protectedApi("/supplier/products");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getSupplierMaterials() {
  const payload = await protectedApi("/supplier/materials");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getSupplierOffers() {
  const payload = await protectedApi("/supplier/offers");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getSupplierMetrics() {
  return protectedApi("/supplier/metrics");
}

export async function getSupplierOrders() {
  const payload = await protectedApi("/supplier/orders");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getSupplierCommissions() {
  const payload = await protectedApi("/finance/commissions");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getSupplierWithdrawals() {
  const payload = await protectedApi("/finance/withdrawals");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getFinanceSummary() {
  return protectedApi("/finance/summary");
}

export async function getFinanceTransactions() {
  const payload = await protectedApi("/finance/transactions");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getAffiliatePerformance() {
  return protectedApi("/affiliate/performance");
}

export async function getAffiliateSales() {
  const payload = await protectedApi("/affiliate/sales");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getAffiliateClicks() {
  const payload = await protectedApi("/affiliate/clicks");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getAffiliateConversions() {
  const payload = await protectedApi("/affiliate/conversions");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getAffiliateReports() {
  const payload = await protectedApi("/affiliate/reports");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getAffiliateProducts() {
  const payload = await protectedApi("/affiliate/products");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

export async function getAvailableAffiliateProducts() {
  const payload = await protectedApi("/marketplace/products");
  return Array.isArray(payload) ? payload : payload?.data || [];
}


export async function getFinanceWithdrawals() {
  const payload = await protectedApi("/finance/withdrawals");
  return Array.isArray(payload) ? payload : payload?.data || [];
}

