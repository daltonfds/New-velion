import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceRoleKey || !anonKey) {
    return NextResponse.json({ error: "Server Supabase configuration is missing." }, { status: 500 });
  }

  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const adminClient = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !authData.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile, error: profileError } = await adminClient.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (profileError || profile?.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const withdrawalId = String(body?.withdrawal_id || "").trim();
  const status = String(body?.status || "").trim().toLowerCase();
  const note = String(body?.note || body?.rejection_reason || "").trim() || null;
  const paymentReference = String(body?.payment_reference || "").trim() || null;

  if (!withdrawalId) return NextResponse.json({ error: "withdrawal_id is required." }, { status: 400 });
  if (!["em_processamento", "rejeitado", "pago"].includes(status)) return NextResponse.json({ error: "Invalid withdrawal status." }, { status: 400 });
  if (status === "rejeitado" && !note) return NextResponse.json({ error: "A rejection reason is required." }, { status: 400 });
  if (status === "pago" && !paymentReference) return NextResponse.json({ error: "A payment reference is required before marking as paid." }, { status: 400 });

  const userClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const result = status === "rejeitado"
    ? await userClient.rpc("admin_reject_withdrawal", { p_withdrawal_id: withdrawalId, p_note: note })
    : await userClient.rpc("admin_update_withdrawal_status", { p_withdrawal_id: withdrawalId, p_status: status, p_note: note, p_payment_reference: paymentReference });

  if (result.error) {
    const message = result.error.message || "Could not update withdrawal.";
    const code = /not found/i.test(message) ? 404 : /unauthorized|forbidden/i.test(message) ? 403 : /invalid withdrawal status|already finalized|transition/i.test(message) ? 409 : 500;
    return NextResponse.json({ error: message }, { status: code });
  }
  return NextResponse.json({ success: true, withdrawal: result.data });
}
