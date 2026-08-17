import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Verificar se é Admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    // Total de Sellers e Producers
    const { count: sellers } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "seller");
    const { count: producers } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "producer");
    
    // Produtos pendentes de aprovação
    const { count: pendingProducts } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", false);
    
    // Saques pendentes (soma dos valores)
    const { data: pendingWithdrawals } = await supabase.from("withdrawals").select("amount").eq("status", "pending");
    const totalPendingWithdrawals = pendingWithdrawals?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    return NextResponse.json({
      totalSellers: sellers || 0,
      totalProducers: producers || 0,
      pendingProducts: pendingProducts || 0,
      pendingWithdrawalsAmount: totalPendingWithdrawals,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
