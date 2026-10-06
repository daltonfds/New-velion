import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function adminFromRequest(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !url || !key) return null;
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return null;
  return supabase;
}

export async function GET(request: NextRequest) {
  const supabase = await adminFromRequest(request);
  if (!supabase) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const status = request.nextUrl.searchParams.get("status") || "pending";
  if (!["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { data: reviews, error } = await supabase
    .from("product_reviews")
    .select("id,product_id,reviewer_name,is_anonymous,rating,review_text,verified_buyer,status,created_at")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const productIds = (reviews || []).map((r: any) => r.product_id).filter(Boolean);
  const { data: products } = productIds.length
    ? await supabase.from("products").select("id,nome,slug,fotos").in("id", productIds)
    : { data: [] };

  const productMap = new Map((products || []).map((p: any) => [p.id, p]));
  return NextResponse.json({
    reviews: (reviews || []).map((review: any) => ({ ...review, product: productMap.get(review.product_id) || null })),
  });
}
