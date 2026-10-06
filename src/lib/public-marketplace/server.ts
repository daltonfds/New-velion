import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type PublicMarketplaceProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: "ZAR";
  images: string[];
  stock: number;
  featured: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  category: { id: string; name: string; slug: string } | null;
  subcategory: { id: string; name: string; slug: string } | null;
  supplier: PublicSupplierSummary | null;
  benefits: string[];
  ingredients: string | null;
  usage: string | null;
  guarantee: string | null;
};

export type PublicSupplierSummary = {
  id: string;
  slug: string;
  name: string;
  countryCode: "ZA" | "CN";
  countryName: string;
  city: string | null;
  region: string | null;
  logoUrl: string | null;
  description: string | null;
  verified: boolean;
  productCount: number;
  rating: number | null;
};

type SupplierSource = {
  user_id: string;
  company_name: string;
  country_code: "ZA" | "CN" | null;
  country_name: string | null;
  description: string | null;
  logo_url: string | null;
  public_city: string | null;
  public_region: string | null;
  approval_status: string;
  public_profile_enabled: boolean;
  created_at: string;
};

function db(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Public marketplace database configuration is missing.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function countryName(code: string | null) {
  return code === "CN" ? "China" : "South Africa";
}

async function supplierSources(database: SupabaseClient) {
  const { data, error } = await database
    .from("supplier_profiles")
    .select("user_id,company_name,country_code,country_name,description,logo_url,public_city,public_region,approval_status,public_profile_enabled,created_at")
    .eq("approval_status", "approved")
    .eq("public_profile_enabled", true);

  if (error) throw error;
  return (data ?? []) as SupplierSource[];
}

async function productRows(database: SupabaseClient) {
  const { data, error } = await database
    .from("products")
    .select("id,nome,slug,descricao,preco,preco_promocional,moeda,fotos,estoque,destaque,novo,avaliacao_media,total_avaliacoes,created_by,categoria_id,subcategoria_id,fornecedor_nome,fornecedor_descricao,fornecedor_pais,beneficios,ingredientes,modo_uso,garantia_texto")
    .eq("ativo", true)
    .eq("supplier_status", "approved")
    .eq("moeda", "ZAR")
    .order("destaque", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function categories(database: SupabaseClient) {
  const { data, error } = await database
    .from("categories")
    .select("id,nome,slug,parent_id")
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

function supplierFromProduct(
  row: any,
  source: SupplierSource | undefined,
  count: number,
): PublicSupplierSummary | null {
  const name =
    source?.company_name?.trim() ||
    row.fornecedor_nome?.trim() ||
    "NewVelion Supplier";

  const code = (source?.country_code || (row.fornecedor_pais === "China" ? "CN" : "ZA")) as "ZA" | "CN";

  return {
    id: source?.user_id || row.created_by,
    slug: slugify(name) || String(source?.user_id || row.created_by),
    name,
    countryCode: code,
    countryName: source?.country_name || countryName(code),
    city: source?.public_city || null,
    region: source?.public_region || null,
    logoUrl: source?.logo_url || null,
    description: source?.description || row.fornecedor_descricao || null,
    verified: source?.approval_status === "approved",
    productCount: count,
    rating: null,
  };
}

export async function getPublicMarketplace() {
  const database = db();
  const [rows, supplierRows, categoryRows] = await Promise.all([
    productRows(database),
    supplierSources(database),
    categories(database),
  ]);

  const suppliers = new Map(supplierRows.map((item) => [item.user_id, item]));
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.created_by, (counts.get(row.created_by) ?? 0) + 1);

  const categoryMap = new Map(categoryRows.map((item) => [item.id, item]));
  const products: PublicMarketplaceProduct[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.nome,
    description: row.descricao,
    price: Number(row.preco_promocional ?? row.preco),
    compareAtPrice: row.preco_promocional != null ? Number(row.preco) : null,
    currency: "ZAR",
    images: Array.isArray(row.fotos) ? row.fotos.filter(Boolean) : [],
    stock: Math.max(Number(row.estoque ?? 0), 0),
    featured: Boolean(row.destaque),
    isNew: Boolean(row.novo),
    rating: Number(row.avaliacao_media ?? 0),
    reviewCount: Number(row.total_avaliacoes ?? 0),
    category: row.categoria_id && categoryMap.has(row.categoria_id)
      ? { id: categoryMap.get(row.categoria_id).id, name: categoryMap.get(row.categoria_id).nome, slug: categoryMap.get(row.categoria_id).slug }
      : null,
    subcategory: row.subcategoria_id && categoryMap.has(row.subcategoria_id)
      ? { id: categoryMap.get(row.subcategoria_id).id, name: categoryMap.get(row.subcategoria_id).nome, slug: categoryMap.get(row.subcategoria_id).slug }
      : null,
    supplier: supplierFromProduct(row, suppliers.get(row.created_by), counts.get(row.created_by) ?? 0),
    benefits: Array.isArray(row.beneficios) ? row.beneficios.filter(Boolean) : [],
    ingredients: row.ingredientes ?? null,
    usage: row.modo_uso ?? null,
    guarantee: row.garantia_texto ?? null,
  }));

  const publicSuppliers = new Map<string, PublicSupplierSummary>();
  for (const product of products) {
    if (product.supplier) publicSuppliers.set(product.supplier.id, product.supplier);
  }

  return {
    products,
    suppliers: Array.from(publicSuppliers.values()).sort((a, b) => a.name.localeCompare(b.name)),
    categories: categoryRows.filter((item) => !item.parent_id).map((item) => ({ id: item.id, name: item.nome, slug: item.slug })),
  };
}

export async function getPublicSupplier(slug: string) {
  const catalog = await getPublicMarketplace();
  const supplier = catalog.suppliers.find((item) => item.slug === slug);
  if (!supplier) return null;

  return {
    supplier,
    products: catalog.products.filter((item) => item.supplier?.id === supplier.id),
    categories: Array.from(new Set(
      catalog.products
        .filter((item) => item.supplier?.id === supplier.id)
        .map((item) => item.category)
        .filter(Boolean)
        .map((item) => JSON.stringify(item)),
    )).map((item) => JSON.parse(item)),
  };
}

export async function getPublicProduct(slug: string, affiliateRef?: string) {
  const catalog = await getPublicMarketplace();
  const product = catalog.products.find((item) => item.slug === slug);
  if (!product) return null;

  const database = db();
  let affiliatePrice: number | null = null;
  if (affiliateRef) {
    const { data: affiliateData } = await database.rpc("resolve_affiliate_product_with_slug", { p_link_unico: affiliateRef.replace(/^https?:\/\/[^/]+\//, "").replace(/^\//, "") });
    const resolved = Array.isArray(affiliateData) ? affiliateData[0] : affiliateData;
    if (resolved?.product_id === product.id && Number.isFinite(Number(resolved.sale_price))) affiliatePrice = Number(resolved.sale_price);
  }

  const { data: reviews, error } = await database
    .from("product_reviews")
    .select("id,reviewer_name,rating,review_text,media_urls,verified_buyer,created_at")
    .eq("product_id", product.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) throw error;

  return {
    product,
    affiliatePrice,
    reviews: reviews ?? [],
    related: catalog.products
      .filter((item) => item.id !== product.id && item.category?.id === product.category?.id)
      .slice(0, 6),
  };
}
