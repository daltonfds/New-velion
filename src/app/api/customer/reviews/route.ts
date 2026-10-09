import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MEDIA_BUCKET = "product-review-media";
const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function getCustomer(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const auth = request.headers.get("authorization");
  if (!url || !key || !auth?.startsWith("Bearer ")) return { error: "Unauthorized.", status: 401 as const };
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await admin.auth.getUser(auth.slice(7));
  if (!user) return { error: "Unauthorized.", status: 401 as const };
  const { data: profile } = await admin.from("profiles").select("role,full_name").eq("id", user.id).maybeSingle();
  if (profile?.role !== "customer") return { error: "Customer account required.", status: 403 as const };
  return { admin, user, profile };
}

export async function POST(request: Request) {
  const customer = await getCustomer(request);
  if ("error" in customer) return NextResponse.json({ error: customer.error }, { status: customer.status });
  const { admin, user, profile } = customer;

  if (request.headers.get("x-review-media-upload") === "1") {
    const formData = await request.formData();
    const productId = String(formData.get("product_id") || "");
    const files = formData.getAll("files").filter((item): item is File => item instanceof File);
    if (!productId) return NextResponse.json({ error: "Product unavailable." }, { status: 400 });
    if (!files.length || files.length > MAX_FILES) return NextResponse.json({ error: "Choose between 1 and 4 photos." }, { status: 400 });

    const { data: sales } = await admin.from("sales").select("id").eq("customer_id", user.id).eq("product_id", productId);
    const saleIds = (sales || []).map((sale: any) => sale.id);
    if (!saleIds.length) return NextResponse.json({ error: "You can only review products you purchased." }, { status: 403 });
    const { data: fulfillment } = await admin.from("fulfillment_orders").select("sale_id").in("sale_id", saleIds).eq("status", "delivered").limit(1);
    if (!fulfillment?.length) return NextResponse.json({ error: "You can review this product after delivery." }, { status: 403 });
    const { data: existingReview } = await admin.from("product_reviews").select("id").eq("reviewer_id", user.id).eq("product_id", productId).maybeSingle();
    if (existingReview) return NextResponse.json({ error: "You have already reviewed this product." }, { status: 409 });
    if (files.some((file) => !ALLOWED_TYPES.has(file.type) || file.size <= 0 || file.size > MAX_FILE_SIZE)) {
      return NextResponse.json({ error: "Photos must be JPG, PNG, WEBP or GIF, up to 5 MB each." }, { status: 400 });
    }

    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.some((bucket) => bucket.name === MEDIA_BUCKET)) {
      const { error: createError } = await admin.storage.createBucket(MEDIA_BUCKET, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: [...ALLOWED_TYPES],
      });
      if (createError && !/already exists/i.test(createError.message)) {
        return NextResponse.json({ error: "Photo storage is not configured. Please try again later." }, { status: 500 });
      }
    }

    const mediaUrls: string[] = [];
    for (const file of files) {
      const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await admin.storage.from(MEDIA_BUCKET).upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) return NextResponse.json({ error: "Unable to upload a photo. Please try again." }, { status: 500 });
      const { data } = admin.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      mediaUrls.push(data.publicUrl);
    }
    return NextResponse.json({ ok: true, media_urls: mediaUrls });
  }

  const body = await request.json().catch(() => null);
  const productId = String(body?.product_id || "");
  const rating = Number(body?.rating);
  const reviewText = String(body?.review_text || "").trim();
  const anonymous = Boolean(body?.is_anonymous);
  const submittedMedia = Array.isArray(body?.media_urls) ? body.media_urls : [];
  const allowedPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${user.id}/`;
  const mediaUrls = submittedMedia.filter((value: unknown): value is string => typeof value === "string" && value.startsWith(allowedPrefix)).slice(0, MAX_FILES);

  if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5 || reviewText.length < 5 || reviewText.length > 5000 || submittedMedia.length > MAX_FILES || mediaUrls.length !== submittedMedia.length) {
    return NextResponse.json({ error: "Invalid review or photo attachment." }, { status: 400 });
  }

  const { data: sales } = await admin.from("sales").select("id,gateway_ref").eq("customer_id", user.id).eq("product_id", productId);
  const saleIds = (sales || []).map((sale: any) => sale.id);
  if (!saleIds.length) return NextResponse.json({ error: "You can only review products you purchased." }, { status: 403 });

  const { data: fulfillment } = await admin.from("fulfillment_orders").select("sale_id,status").in("sale_id", saleIds).eq("status", "delivered").limit(1);
  if (!fulfillment?.length) return NextResponse.json({ error: "You can review this product after delivery." }, { status: 403 });

  const purchaseSessionId = (sales || []).find((sale: any) => sale.id === fulfillment[0].sale_id)?.gateway_ref?.replace(/^newvelion_checkout:/, "");
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
    media_urls: mediaUrls,
    status: "pending",
    verified_buyer: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: "pending" });
}
