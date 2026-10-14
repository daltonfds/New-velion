import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const BUCKET = "review-media";
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const STATUSES = new Set(["pending", "approved", "hidden"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max: number) {
  return String(value ?? "").normalize("NFKC").replace(/<[^>]*>/g, "").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function context(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !url || !key) return null;
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await db.auth.getUser(token);
  if (!user) return null;
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile?.role || !["admin", "seller", "supplier", "producer"].includes(profile.role)) return null;
  return { db, user, role: profile.role };
}

async function canManage(ctx: NonNullable<Awaited<ReturnType<typeof context>>>, productId: string) {
  const { data: product } = await ctx.db.from("products").select("id,created_by").eq("id", productId).maybeSingle();
  if (!product) return false;
  if (ctx.role === "admin") return true;
  return product.created_by === ctx.user.id;
}

export async function GET(request: NextRequest) {
  const ctx = await context(request);
  if (!ctx) return jsonError("Acesso não autorizado.", 401);
  const productId = clean(request.nextUrl.searchParams.get("product_id"), 100);
  if (!productId) return jsonError("Produto inválido.", 400);
  if (!(await canManage(ctx, productId))) return jsonError("Sem permissão para gerir avaliações deste produto.", 403);
  const { data, error } = await ctx.db.from("product_reviews")
    .select("id,product_id,reviewer_name,first_name,last_name,email,rating,review_text,media_urls,photo_urls,status,created_at,review_date,verified_buyer,created_by_admin")
    .eq("product_id", productId).order("review_date", { ascending: false });
  if (error) return jsonError("Não foi possível carregar os depoimentos.", 500);
  return NextResponse.json({ reviews: data || [] });
}

export async function POST(request: NextRequest) {
  const ctx = await context(request);
  if (!ctx) return jsonError("Acesso não autorizado.", 401);
  const form = await request.formData().catch(() => null);
  if (!form) return jsonError("Formulário inválido.", 400);
  const productId = clean(form.get("product_id"), 100);
  if (!productId || !(await canManage(ctx, productId))) return jsonError("Sem permissão para gerir este produto.", 403);

  const action = clean(form.get("action"), 20) || "create";
  if (action === "upload") {
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Selecione uma foto ou vídeo.", 400);
    if ((!IMAGE_TYPES.has(file.type) && !VIDEO_TYPES.has(file.type)) || file.size <= 0 || file.size > MAX_FILE_BYTES) {
      return jsonError("Use JPG, PNG, WEBP, GIF, MP4, WEBM ou MOV até 4 MB por ficheiro.", 400);
    }
    const { data: buckets } = await ctx.db.storage.listBuckets();
    if (!buckets?.some((bucket) => bucket.name === BUCKET)) {
      const { error } = await ctx.db.storage.createBucket(BUCKET, { public: true, fileSizeLimit: MAX_FILE_BYTES, allowedMimeTypes: [...IMAGE_TYPES, ...VIDEO_TYPES] });
      if (error && !/already exists/i.test(error.message)) return jsonError("Armazenamento de mídia indisponível.", 503);
    }
    const ext = file.type === "image/jpeg" ? "jpg" : file.type === "video/quicktime" ? "mov" : file.type.split("/")[1];
    const path = `manual/${productId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await ctx.db.storage.from(BUCKET).upload(path, await file.arrayBuffer(), { contentType: file.type, cacheControl: "3600", upsert: false });
    if (error) return jsonError("Falha ao carregar a mídia.", 500);
    return NextResponse.json({ url: ctx.db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl });
  }

  const reviewerName = clean(form.get("reviewer_name"), 120);
  const email = clean(form.get("email"), 254).toLowerCase() || null;
  const rating = Number(form.get("rating"));
  const reviewText = clean(form.get("review_text"), 5000);
  const reviewDateRaw = clean(form.get("review_date"), 40);
  const reviewDate = reviewDateRaw && !Number.isNaN(Date.parse(reviewDateRaw)) ? new Date(reviewDateRaw).toISOString() : new Date().toISOString();
  const mediaRaw = clean(form.get("media_urls"), 10000);
  let mediaUrls: string[] = [];
  try { mediaUrls = mediaRaw ? JSON.parse(mediaRaw) : []; } catch { return jsonError("Lista de mídia inválida.", 400); }
  if (!reviewerName || !Number.isInteger(rating) || rating < 1 || rating > 5 || reviewText.length < 3 || !Array.isArray(mediaUrls) || mediaUrls.length > 4 || (email && !EMAIL_RE.test(email))) {
    return jsonError("Preencha nome, nota de 1 a 5 e comentário válido.", 400);
  }
  const validPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/manual/${productId}/`;
  if (mediaUrls.some((url: unknown) => typeof url !== "string" || !url.startsWith(validPrefix))) return jsonError("A mídia anexada não é válida.", 400);
  const reviewId = clean(form.get("review_id"), 100);
  const values = {
    reviewer_name: reviewerName,
    first_name: reviewerName.split(/\s+/)[0] || reviewerName,
    last_name: reviewerName.split(/\s+/).slice(1).join(" ") || null,
    email,
    rating,
    review_text: reviewText,
    media_urls: mediaUrls,
    photo_urls: mediaUrls,
    review_date: reviewDate,
    status: "approved",
    verified_buyer: false,
    created_by_admin: ctx.role === "admin",
    created_manually: true,
    is_anonymous: false,
  };
  if (action === "update") {
    if (!reviewId) return jsonError("Depoimento inválido.", 400);
    const { error } = await ctx.db.from("product_reviews").update(values).eq("id", reviewId).eq("product_id", productId);
    if (error) return jsonError("Não foi possível atualizar o depoimento.", 500);
  } else {
    const { error } = await ctx.db.from("product_reviews").insert({
      product_id: productId, reviewer_id: null, purchase_session_id: null, ...values,
    });
    if (error) {
      console.error("Manual product review failed:", error.message);
      return jsonError("Não foi possível guardar o depoimento. Confirme se a migração foi aplicada.", 500);
    }
  }
  const { data: approved } = await ctx.db.from("product_reviews").select("rating").eq("product_id", productId).eq("status", "approved");
  const ratings = (approved || []).map((r: any) => Number(r.rating));
  await ctx.db.from("products").update({
    avaliacao_media: ratings.length ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 100) / 100 : 0,
    total_avaliacoes: ratings.length,
    updated_at: new Date().toISOString(),
  }).eq("id", productId);
  return NextResponse.json({ ok: true }, { status: action === "update" ? 200 : 201 });
}

export async function PATCH(request: NextRequest) {
  const ctx = await context(request);
  if (!ctx) return jsonError("Acesso não autorizado.", 401);
  const body = await request.json().catch(() => null);
  const productId = clean(body?.product_id, 100);
  const reviewId = clean(body?.review_id, 100);
  const status = clean(body?.status, 20);
  if (!productId || !reviewId || !STATUSES.has(status)) return jsonError("Dados inválidos.", 400);
  if (!(await canManage(ctx, productId))) return jsonError("Sem permissão.", 403);
  const dbStatus = status === "hidden" ? "rejected" : status;
  const { error } = await ctx.db.from("product_reviews").update({ status: dbStatus }).eq("id", reviewId).eq("product_id", productId);
  if (error) return jsonError("Não foi possível alterar o estado.", 500);
  const { data: approved } = await ctx.db.from("product_reviews").select("rating").eq("product_id", productId).eq("status", "approved");
  const ratings = (approved || []).map((r: any) => Number(r.rating));
  await ctx.db.from("products").update({ avaliacao_media: ratings.length ? Math.round(ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length * 100) / 100 : 0, total_avaliacoes: ratings.length, updated_at: new Date().toISOString() }).eq("id", productId);
  return NextResponse.json({ ok: true, status: dbStatus });
}

export async function DELETE(request: NextRequest) {
  const ctx = await context(request);
  if (!ctx) return jsonError("Acesso não autorizado.", 401);
  const body = await request.json().catch(() => null);
  const productId = clean(body?.product_id, 100);
  const reviewId = clean(body?.review_id, 100);
  if (!productId || !reviewId || !(await canManage(ctx, productId))) return jsonError("Sem permissão.", 403);
  const { error } = await ctx.db.from("product_reviews").delete().eq("id", reviewId).eq("product_id", productId);
  if (error) return jsonError("Não foi possível excluir o depoimento.", 500);
  const { data: approved } = await ctx.db.from("product_reviews").select("rating").eq("product_id", productId).eq("status", "approved");
  const ratings = (approved || []).map((r: any) => Number(r.rating));
  await ctx.db.from("products").update({ avaliacao_media: ratings.length ? Math.round(ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length * 100) / 100 : 0, total_avaliacoes: ratings.length, updated_at: new Date().toISOString() }).eq("id", productId);
  return NextResponse.json({ ok: true });
}
