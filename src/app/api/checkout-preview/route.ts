import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Checkout service is not configured." },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const affiliateLink = String(searchParams.get("ref") || "").trim();
    const quantity = Math.max(
      1,
      Math.min(50, Number(searchParams.get("qty") || "1")),
    );

    if (!affiliateLink) {
      return NextResponse.json({ error: "Invalid affiliate link." }, { status: 400 });
    }

    const normalizedLink = affiliateLink
      .replace(/^https?:\/\/[^/]+\//, "")
      .replace(/^\//, "");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data: resolved, error: resolveError } = await supabase.rpc(
      "resolve_affiliate_product_with_slug",
      { p_link_unico: normalizedLink },
    );

    if (resolveError) {
      console.error("Checkout preview RPC failed:", resolveError);
      return NextResponse.json(
        { error: "Could not load checkout details." },
        { status: 500 },
      );
    }

    const offer = Array.isArray(resolved) ? resolved[0] : resolved;

    if (!offer?.product_id || !Number.isFinite(Number(offer.sale_price))) {
      return NextResponse.json({ error: "Invalid affiliate link." }, { status: 404 });
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id,nome,slug,descricao,fotos,moeda,ativo,supplier_status,preco,preco_promocional")
      .eq("id", offer.product_id)
      .eq("ativo", true)
      .eq("supplier_status", "approved")
      .eq("moeda", "ZAR")
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json({ error: "Product is unavailable." }, { status: 409 });
    }

    const unitPrice = Number(offer.sale_price);
    const subtotal = Math.round(unitPrice * quantity * 100) / 100;

    return NextResponse.json(
      {
        product: {
          id: product.id,
          name: product.nome,
          slug: product.slug,
          description: product.descricao,
          image: Array.isArray(product.fotos) ? product.fotos[0] || null : null,
        },
        offer: {
          affiliate_link: normalizedLink,
          unit_price: unitPrice,
          currency: "ZAR",
        },
        quantity,
        subtotal,
        shipping: null,
        total: null,
      },
      {
        headers: {
          "cache-control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Checkout preview error:", error);
    return NextResponse.json(
      { error: "Could not load checkout details." },
      { status: 500 },
    );
  }
}
