import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PLANS = {
  club_399: { amount: 399, env: "NEWVELION_CLUB_LINK_399", name: "Essential" },
  club_499: { amount: 499, env: "NEWVELION_CLUB_LINK_499", name: "Plus" },
  club_599: { amount: 599, env: "NEWVELION_CLUB_LINK_599", name: "Premium" },
} as const;

async function context(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const header = request.headers.get("authorization");
  if (!url || !key || !header?.startsWith("Bearer ")) return { error: "Please sign in again.", status: 401 as const };
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await db.auth.getUser(header.slice(7));
  if (!user) return { error: "Please sign in again.", status: 401 as const };
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "customer") return { error: "Customer account required.", status: 403 as const };
  return { db, user };
}

export async function GET(request: Request) {
  const ctx = await context(request);
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const [{ data, error }, { data: planRows, error: planError }] = await Promise.all([
    ctx.db.from("club_memberships").select("id,plan_code,amount_zar,status,payment_url,payment_reference,customer_note,created_at,starts_at,expires_at,reviewed_at").eq("customer_id", ctx.user.id).order("created_at", { ascending: false }).limit(10),
    ctx.db.from("club_membership_plans").select("plan_code,name,amount_zar,payment_url,benefits,active").eq("active", true).order("amount_zar")
  ]);
  if (error || planError) return NextResponse.json({ error: "Unable to load membership history." }, { status: 500 });
  const plans = (planRows || []).map((p: any) => ({ code: p.plan_code, name: p.name, amount: Number(p.amount_zar), paymentUrl: p.payment_url, benefits: p.benefits }));
  return NextResponse.json({ memberships: data || [], plans });
}

export async function POST(request: Request) {
  const ctx = await context(request);
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const body = await request.json().catch(() => null);
  const action = String(body?.action || "request");
  if (action === "request") {
    const planCode = String(body?.plan_code || "");
    const { data: plan, error: planError } = await ctx.db.from("club_membership_plans").select("plan_code,amount_zar,payment_url,active").eq("plan_code", planCode).eq("active", true).maybeSingle();
    if (planError || !plan) return NextResponse.json({ error: "Choose a valid plan." }, { status: 400 });
    const paymentUrl = plan.payment_url;
    if (!paymentUrl || !/^https:\/\//i.test(paymentUrl)) return NextResponse.json({ error: "The payment link for this plan has not been configured by an administrator yet." }, { status: 503 });
    const { data: existing } = await ctx.db.from("club_memberships").select("id,status").eq("customer_id", ctx.user.id).in("status", ["pending_payment","pending_review","active"]).limit(1);
    if (existing?.length) return NextResponse.json({ error: "You already have a pending or active membership. Open your membership page to continue." }, { status: 409 });
    const { data, error } = await ctx.db.from("club_memberships").insert({ customer_id: ctx.user.id, plan_code: planCode, amount_zar: plan.amount_zar, payment_url: paymentUrl, status: "pending_payment" }).select("id,payment_url,status,amount_zar,plan_code").single();
    if (error) return NextResponse.json({ error: "Unable to create membership request." }, { status: 500 });
    return NextResponse.json({ membership: data });
  }
  if (action === "paid") {
    const id = String(body?.membership_id || "");
    const reference = String(body?.payment_reference || "").trim().slice(0, 160);
    const note = String(body?.customer_note || "").trim().slice(0, 1000);
    if (!id) return NextResponse.json({ error: "Membership request is required." }, { status: 400 });
    const { data: current, error: lookupError } = await ctx.db.from("club_memberships").select("id,status").eq("id", id).eq("customer_id", ctx.user.id).maybeSingle();
    if (lookupError || !current) return NextResponse.json({ error: "Membership request not found." }, { status: 404 });
    if (current.status !== "pending_payment" && current.status !== "pending_review") return NextResponse.json({ error: "This membership request cannot be updated." }, { status: 409 });
    const { error } = await ctx.db.from("club_memberships").update({ status: "pending_review", payment_reference: reference || null, customer_note: note || null, updated_at: new Date().toISOString() }).eq("id", id).eq("customer_id", ctx.user.id);
    if (error) return NextResponse.json({ error: "Unable to submit payment confirmation." }, { status: 500 });
    return NextResponse.json({ ok: true, status: "pending_review" });
  }
  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
