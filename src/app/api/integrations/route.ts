import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET: Buscar integrações do Seller
export async function GET() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("seller_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST: Adicionar uma nova integração (Shopify/WooCommerce/API)
export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { platform, store_url, api_key, api_secret } = body;

    const { data, error } = await supabase
      .from("integrations")
      .insert({
        seller_id: user.id,
        platform,
        store_url,
        api_key,
        api_secret,
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
