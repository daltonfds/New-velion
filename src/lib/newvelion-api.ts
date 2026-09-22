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
