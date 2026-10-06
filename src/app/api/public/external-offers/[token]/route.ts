import { NextResponse } from "next/server";
import { adminClient } from "@/lib/integrations/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const client = adminClient();

  const { data: offer, error } = await client
    .from("integration_external_offers")
    .select(
      "id,platform_id,external_seller_id,newvelion_product_id,pricing_mode,sale_price,base_price_zar,seller_margin_zar,currency,offer_token,status",
    )
    .eq("offer_token", token.trim())
    .eq("status", "active")
    .maybeSingle();

  if (error || !offer) {
    return NextResponse.json({ error: { code: "OFFER_NOT_FOUND", message: "Offer not found." } }, { status: 404 });
  }

  const { data: product } = await client
    .from("products")
    .select("id,nome,slug,descricao,fotos,moeda,pricing_mode")
    .eq("id", offer.newvelion_product_id)
    .eq("ativo", true)
    .eq("supplier_status", "approved")
    .eq("moeda", "ZAR")
    .maybeSingle();

  if (!product) {
    return NextResponse.json({ error: { code: "PRODUCT_NOT_AVAILABLE", message: "Product is no longer available." } }, { status: 409 });
  }

  return NextResponse.json({
    data: {
      offer_id: offer.id,
      offer_token: offer.offer_token,
      pricing_mode: offer.pricing_mode,
      sale_price: Number(offer.sale_price),
      base_price_zar: Number(offer.base_price_zar),
      seller_margin_zar: Number(offer.seller_margin_zar),
      currency: "ZAR",
      product,
    },
  }, { headers: { "cache-control": "no-store" } });
}
