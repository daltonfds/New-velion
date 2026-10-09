import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Authentication service is not configured." }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: authError } = await admin.auth.getUser(authorization.slice(7));
  if (authError || !user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  if (user.app_metadata?.provider !== "google") {
    return NextResponse.json({ error: "Google sign-in required." }, { status: 403 });
  }

  // Only initialize a newly created Google account as a buyer. Never change
  // the role of an existing account simply because it signed in here.
  const createdAt = new Date(user.created_at).getTime();
  if (!Number.isFinite(createdAt) || Date.now() - createdAt > 10 * 60 * 1000 || createdAt > Date.now() + 60_000) {
    return NextResponse.json({ ok: true });
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return NextResponse.json({ error: "Unable to load your account profile." }, { status: 500 });
  if (!profile) return NextResponse.json({ error: "Your account profile is not ready yet. Please try signing in again." }, { status: 409 });
  if (profile.role === "admin" || profile.role === "supplier") return NextResponse.json({ ok: true });

  if (profile.role !== "customer") {
    const { error: updateError } = await admin.from("profiles").update({
      role: "customer",
      country: "South Africa",
      country_code: "ZA",
      country_calling_code: "+27",
      preferred_language: "en",
    }).eq("id", user.id);
    if (updateError) return NextResponse.json({ error: "Unable to finish setting up your buyer account." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
