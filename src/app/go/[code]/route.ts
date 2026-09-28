import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!supabaseUrl || !supabaseAnonKey || !code) {
    return new NextResponse("Affiliate link not found", { status: 404 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("resolve_affiliate_checkout", {
    p_link_unico: `go/${code}`,
  });

  if (error) {
    console.error("Failed to resolve affiliate link:", error);
    return new NextResponse("Affiliate link unavailable", { status: 404 });
  }

  const checkoutUrl = Array.isArray(data)
    ? data[0]?.checkout_url
    : data?.checkout_url;

  if (
    typeof checkoutUrl !== "string" ||
    !/^https?:\/\//i.test(checkoutUrl)
  ) {
    return new NextResponse("Affiliate link not found", { status: 404 });
  }

  return NextResponse.redirect(checkoutUrl, 307);
}
