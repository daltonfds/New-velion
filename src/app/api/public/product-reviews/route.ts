import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const BUCKET = "product-review-media";
const MAX_FILES = 4;
const IMAGE_MAX = 5 * 1024 * 1024;
const VIDEO_MAX = 25 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown, max: number) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, max);
}

function extensionFor(type: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
    "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
  };
  return map[type] || "bin";
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Review service is temporarily unavailable." }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid review submission." }, { status: 400 });

  const productId = cleanText(form.get("product_id"), 100);
  const rating = Number(form.get("rating"));
  const reviewText = cleanText(form.get("review_text"), 5000);
  const firstName = cleanText(form.get("first_name"), 80);
  const lastName = cleanText(form.get("last_name"), 80) || null;
  const email = cleanText(form.get("email"), 254).toLowerCase();
  const files = form.getAll("files").filter((value): value is File => value instanceof File);

  if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5 ||
      reviewText.length < 5 || reviewText.length > 5000 ||
      !firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please check your rating, review, name and email." }, { status: 400 });
  }
  if (files.length > MAX_FILES) return NextResponse.json({ error: "You can attach up to 4 photos or videos." }, { status: 400 });

  for (const file of files) {
    const image = IMAGE_TYPES.has(file.type);
    const video = VIDEO_TYPES.has(file.type);
    const limit = image ? IMAGE_MAX : VIDEO_MAX;
    if ((!image && !video) || file.size <= 0 || file.size > limit) {
      return NextResponse.json({ error: "Photos must be JPG, PNG, WEBP or GIF up to 5 MB; videos must be MP4, WEBM or MOV up to 25 MB." }, { status: 400 });
    }
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: product, error: productError } = await admin.from("products").select("id").eq("id", productId).maybeSingle();
  if (productError || !product) return NextResponse.json({ error: "This product is unavailable for reviews." }, { status: 404 });

  const { data: buckets, error: bucketListError } = await admin.storage.listBuckets();
  if (bucketListError) return NextResponse.json({ error: "Review media storage is unavailable." }, { status: 503 });
  if (!buckets?.some((bucket) => bucket.name === BUCKET)) {
    const { error } = await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: VIDEO_MAX,
      allowedMimeTypes: [...IMAGE_TYPES, ...VIDEO_TYPES],
    });
    if (error && !/already exists/i.test(error.message)) {
      return NextResponse.json({ error: "Review media storage could not be configured." }, { status: 503 });
    }
  }

  const mediaUrls: string[] = [];
  for (const file of files) {
    const path = `anonymous/${crypto.randomUUID()}.${extensionFor(file.type)}`;
    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) return NextResponse.json({ error: "Unable to upload review media. Please try again." }, { status: 500 });
    mediaUrls.push(admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }

  const reviewerName = [firstName, lastName].filter(Boolean).join(" ");
  const { error: insertError } = await admin.from("product_reviews").insert({
    product_id: productId,
    reviewer_id: null,
    purchase_session_id: null,
    reviewer_name: reviewerName,
    first_name: firstName,
    last_name: lastName,
    email,
    is_anonymous: false,
    rating,
    review_text: reviewText,
    media_urls: mediaUrls,
    photo_urls: mediaUrls,
    status: "pending",
    verified_buyer: false,
  });

  if (insertError) {
    // Do not return database internals or PII to anonymous callers.
    console.error("Anonymous product review insert failed:", insertError.message);
    return NextResponse.json({ error: "Your review could not be saved. Please try again later." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: "pending" }, { status: 201 });
}
