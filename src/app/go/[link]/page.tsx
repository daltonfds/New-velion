import { createClient } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function AffiliateProductPage({
  params,
}: {
  params: Promise<{ link: string }>;
}) {
  const { link } = await params;

  if (!supabaseUrl || !supabaseAnonKey || !link) {
    notFound();
  }

  const affiliateLink = `go/${link}`;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("resolve_affiliate_product", {
    p_link_unico: affiliateLink,
  });

  if (error) {
    console.error("Failed to resolve affiliate product:", error);
    notFound();
  }

  const product = Array.isArray(data) ? data[0] : data;

  if (!product?.product_id || !product?.affiliate_id) {
    notFound();
  }

  const requestHeaders = await headers();

  const { error: clickError } = await supabase.rpc(
    "record_affiliate_click",
    {
      p_link_unico: affiliateLink,
      p_user_agent: requestHeaders.get("user-agent"),
      p_referrer: requestHeaders.get("referer"),
    },
  );

  if (clickError) {
    console.error("Failed to record affiliate click:", clickError);
  }

  const { data: productRecord, error: productError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", product.product_id)
    .eq("ativo", true)
    .maybeSingle();

  if (productError || !productRecord?.slug) {
    console.error("Failed to resolve product slug:", productError);
    notFound();
  }

  const productUrl =
    `/produto/${encodeURIComponent(String(productRecord.slug))}` +
    `?ref=${encodeURIComponent(affiliateLink)}`;

  redirect(productUrl);
}
