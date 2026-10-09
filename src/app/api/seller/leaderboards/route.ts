import { NextResponse } from "next/server";
import { adminClient } from "@/lib/integrations/server";

export async function GET(request: Request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  let db;
  try { db = adminClient(); } catch { return NextResponse.json({ error: "Server is not configured." }, { status: 500 }); }

  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const { data: me, error: meError } = await db.from("profiles").select("id,role,country_code,country,pais").eq("id", auth.user.id).maybeSingle();
  if (meError) return NextResponse.json({ error: meError.message }, { status: 500 });
  if (!me || !["seller", "affiliate"].includes(String(me.role || "").toLowerCase())) return NextResponse.json({ error: "Seller access required." }, { status: 403 });

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
  const [profilesResult, salesResult] = await Promise.all([
    db.from("profiles").select("id,full_name,nome_completo,role,country_code,country,pais").in("role", ["Seller", "seller", "affiliate", "Affiliate"]),
    db.from("sales").select("vendedor_id,valor_venda,comissao_vendedor,status,vendido_em").in("status", ["paga", "paid"]).gte("vendido_em", start).lt("vendido_em", end),
  ]);
  if (profilesResult.error) return NextResponse.json({ error: profilesResult.error.message }, { status: 500 });
  if (salesResult.error) return NextResponse.json({ error: salesResult.error.message }, { status: 500 });

  const countryOf = (p: any) => {
    const raw = String(p.country_code || p.country || p.pais || "").trim().toUpperCase();
    const aliases: Record<string, string> = { MOZAMBIQUE: "MZ", "MOÇAMBIQUE": "MZ", "SOUTH AFRICA": "ZA", "ÁFRICA DO SUL": "ZA", "AFRICA DO SUL": "ZA", BRAZIL: "BR", BRASIL: "BR" };
    const code = aliases[raw] || raw;
    return /^[A-Z]{2}$/.test(code) ? code : null;
  };
  const profileMap = new Map((profilesResult.data || []).map((p: any) => [p.id, p]));
  const totals = new Map<string, any>();
  for (const sale of salesResult.data || []) {
    const p: any = profileMap.get(sale.vendedor_id);
    if (!p) continue;
    const row = totals.get(sale.vendedor_id) || { seller_id: p.id, seller_name: p.full_name || p.nome_completo || "Seller", country_code: countryOf(p), sales_count: 0, monthly_sales: 0, monthly_commission: 0 };
    row.sales_count += 1;
    row.monthly_sales += Number(sale.valor_venda || 0);
    row.monthly_commission += Number(sale.comissao_vendedor || 0);
    totals.set(sale.vendedor_id, row);
  }
  const ranked = [...totals.values()].sort((a, b) => b.sales_count - a.sales_count || b.monthly_commission - a.monthly_commission || b.monthly_sales - a.monthly_sales || a.seller_name.localeCompare(b.seller_name));
  const countryCode = countryOf(me);
  return NextResponse.json({
    month_start: start,
    country_code: countryCode,
    country_leaders: ranked.filter((r, i, rows) => Boolean(r.country_code) && rows.findIndex((candidate) => candidate.country_code === r.country_code) === i).map((r) => ({ ...r, rank_position: 1 })),
    platform: ranked.slice(0, 10).map((r, i) => ({ ...r, rank_position: i + 1 })),
    country: ranked.filter((r) => countryCode && r.country_code === countryCode).slice(0, 10).map((r, i) => ({ ...r, rank_position: i + 1 })),
  }, { headers: { "Cache-Control": "private, no-store" } });
}
