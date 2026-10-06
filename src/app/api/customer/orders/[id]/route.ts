import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const auth = request.headers.get("authorization");
  if (!url || !key || !auth?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await admin.auth.getUser(auth.slice(7));
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "customer") return NextResponse.json({ error: "Customer account required." }, { status: 403 });

  const { id } = await context.params;
  const { data: sale, error } = await admin.from("sales")
    .select("id,product_id,quantity,product_amount,shipping_amount,valor_venda,currency,status,vendido_em,gateway_ref")
    .eq("id", id).eq("customer_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!sale) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const purchaseSessionId = typeof sale.gateway_ref === "string" && sale.gateway_ref.startsWith("newvelion_checkout:")
    ? sale.gateway_ref.slice("newvelion_checkout:".length)
    : null;

  const [{ data: product }, { data: fulfillment }, { data: reviews }] = await Promise.all([
    admin.from("products").select("id,nome,slug,fotos,descricao,garantia_texto").eq("id", sale.product_id).maybeSingle(),
    admin.from("fulfillment_orders").select("id,status,tracking_number,carrier,tracking_url,public_tracking_token,shipping_address,shipping_city,shipping_province,estimated_delivery_at,updated_at").eq("sale_id", sale.id).maybeSingle(),
    purchaseSessionId
      ? admin.from("product_reviews").select("id,rating,review_text,status,verified_buyer,created_at").eq("purchase_session_id", purchaseSessionId).eq("reviewer_id", user.id)
      : Promise.resolve({ data: [], error: null }),
  ]);

  return NextResponse.json({
    order: {
      ...sale,
      purchase_session_id: purchaseSessionId,
      product: product ?? null,
      fulfillment: fulfillment ?? null,
      reviews: reviews ?? [],
    },
  });
}
