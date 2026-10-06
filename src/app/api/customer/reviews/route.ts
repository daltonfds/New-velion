import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const auth = request.headers.get("authorization");
  if (!url || !key || !auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user } } = await admin.auth.getUser(auth.slice(7));
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile } = await admin.from("profiles").select("role,full_name").eq("id", user.id).maybeSingle();
  if (profile?.role !== "customer") return NextResponse.json({ error: "Customer account required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const productId = String(body?.product_id || "");
  const rating = Number(body?.rating);
  const reviewText = String(body?.review_text || "").trim();
  const anonymous = Boolean(body?.is_anonymous);

  if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5 || reviewText.length < 5 || reviewText.length > 5000) {
    return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  }

  const { data: sales } = await admin
    .from("sales")
    .select("id,gateway_ref")
    .eq("customer_id", user.id)
    .eq("product_id", productId);

  const saleIds = (sales || []).map((s: any) => s.id);
  if (!saleIds.length) return NextResponse.json({ error: "You can only review products you purchased." }, { status: 403 });

  const { data: fulfillment } = await admin
    .from("fulfillment_orders")
    .select("sale_id,status")
    .in("sale_id", saleIds)
    .eq("status", "delivered")
    .limit(1);

  if (!fulfillment?.length) return NextResponse.json({ error: "You can review this product after delivery." }, { status: 403 });

  const purchaseSessionId = (sales || []).find((s: any) => s.id === fulfillment[0].sale_id)?.gateway_ref?.replace(/^newvelion_checkout:/, "");
  if (!purchaseSessionId) return NextResponse.json({ error: "Purchase session not found." }, { status: 409 });

  const { data: existing } = await admin.from("product_reviews").select("id").eq("reviewer_id", user.id).eq("product_id", productId).maybeSingle();
  if (existing) return NextResponse.json({ error: "You have already reviewed this product." }, { status: 409 });

  const reviewerName = anonymous ? null : String(profile.full_name || user.email?.split("@")[0] || "Customer").slice(0, 120);
  const { error } = await admin.from("product_reviews").insert({
    product_id: productId,
    reviewer_id: user.id,
    purchase_session_id: purchaseSessionId,
    reviewer_name: reviewerName,
    is_anonymous: anonymous,
    rating,
    review_text: reviewText,
    media_urls: [],
    status: "pending",
    verified_buyer: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: "pending" });
}
