import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET: Buscar histórico de saques do Seller logado
export async function GET() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: Solicitar um novo saque
export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { amount, method } = body; // amount em R, method: "M-Pesa", "Bank Transfer", etc.

    // 1. Verificar saldo disponível do Seller
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) throw new Error("User profile not found");
    if (profile.balance < amount) throw new Error("Insufficient balance");

    // 2. Criar a solicitação no banco
    const { data, error } = await supabase
      .from("withdrawals")
      .insert({
        seller_id: user.id,
        amount,
        method,
        status: "pending",
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
