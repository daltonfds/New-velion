import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function adminContext(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const header = request.headers.get("authorization");
  if (!url || !key || !header?.startsWith("Bearer ")) return null;
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await db.auth.getUser(header.slice(7));
  if (!user) return null;
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return profile?.role === "admin" ? { db, user } : null;
}

export async function GET(request: Request) {
  const ctx = await adminContext(request);
  if (!ctx) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const [{ data, error }, { data: plans, error: planError }] = await Promise.all([
    ctx.db.from("club_memberships").select("id,customer_id,plan_code,amount_zar,status,payment_reference,customer_note,created_at,starts_at,expires_at,profiles:profiles!club_memberships_customer_id_fkey(full_name,nome_completo,country_code)").order("created_at", { ascending: false }).limit(250),
    ctx.db.from("club_membership_plans").select("plan_code,name,amount_zar,payment_url,active").order("amount_zar")
  ]);
  if (error || planError) return NextResponse.json({ error: "Unable to load membership requests." }, { status: 500 });
  return NextResponse.json({ memberships: data || [], plans: plans || [] });
}

export async function POST(request: Request) {
  const ctx = await adminContext(request);
  if (!ctx) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const action = String(body?.action || "");
  if (action === "save_link") {
    const code = String(body?.plan_code || "");
    const paymentUrl = String(body?.payment_url || "").trim();
    if (!["club_399","club_499","club_599"].includes(code)) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    if (paymentUrl && (!/^https:\/\//i.test(paymentUrl) || paymentUrl.length > 2000)) return NextResponse.json({ error: "Enter a valid HTTPS payment link." }, { status: 400 });
    const { error } = await ctx.db.from("club_membership_plans").update({ payment_url: paymentUrl || null, updated_at: new Date().toISOString() }).eq("plan_code", code);
    if (error) return NextResponse.json({ error: "Unable to save payment link." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  const id = String(body?.id || "");
  if (!id || !["approve","reject"].includes(action)) return NextResponse.json({ error: "Invalid membership action." }, { status: 400 });
  const { data: item, error: findError } = await ctx.db.from("club_memberships").select("id,status").eq("id", id).maybeSingle();
  if (findError || !item) return NextResponse.json({ error: "Membership request not found." }, { status: 404 });
  if (item.status !== "pending_review" && item.status !== "pending_payment") return NextResponse.json({ error: "This request has already been reviewed." }, { status: 409 });
  const now = new Date();
  const update = action === "approve"
    ? { status: "active", approved_by: ctx.user.id, reviewed_at: now.toISOString(), starts_at: now.toISOString(), expires_at: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(), updated_at: now.toISOString() }
    : { status: "rejected", approved_by: ctx.user.id, reviewed_at: now.toISOString(), updated_at: now.toISOString() };
  const { error } = await ctx.db.from("club_memberships").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: "Unable to review membership request." }, { status: 500 });
  return NextResponse.json({ ok: true, status: update.status });
}
