import { createClient } from "@supabase/supabase-js";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function AffiliateRedirectPage({
  params,
}: {
  params: Promise<{ link: string }>;
}) {
  const { link } = await params;

  if (!supabaseUrl || !supabaseAnonKey || !link) {
    notFound();
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("resolve_affiliate_checkout", {
    p_link_unico: `go/${link}`,
  });

  if (error) {
    console.error("Failed to resolve affiliate link:", error);
    notFound();
  }

  const checkoutUrl = Array.isArray(data)
    ? data[0]?.checkout_url
    : data?.checkout_url;

  if (
    typeof checkoutUrl !== "string" ||
    !/^https?:\/\//i.test(checkoutUrl)
  ) {
    notFound();
  }

  redirect(checkoutUrl);
}
