import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  const auth = request.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const token = auth.slice(7);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await request.json();

  const withdrawalId = String(body?.withdrawal_id || "").trim();
  const status = String(body?.status || "").trim().toLowerCase();
  const rejectionReason = body?.rejection_reason
    ? String(body.rejection_reason).trim()
    : null;

  if (!withdrawalId) {
    return NextResponse.json(
      { error: "withdrawal_id is required." },
      { status: 400 },
    );
  }

  if (!["approved", "rejected", "paid"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid withdrawal status." },
      { status: 400 },
    );
  }

  const { data: withdrawal, error: withdrawalError } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("id", withdrawalId)
    .maybeSingle();

  if (withdrawalError) {
    return NextResponse.json(
      { error: withdrawalError.message },
      { status: 500 },
    );
  }

  if (!withdrawal) {
    return NextResponse.json(
      { error: "Withdrawal not found." },
      { status: 404 },
    );
  }

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "rejected") {
    update.rejection_reason = rejectionReason;
  }

  const { data: updated, error: updateError } = await supabase
    .from("withdrawals")
    .update(update)
    .eq("id", withdrawalId)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    withdrawal: updated,
  });
}
