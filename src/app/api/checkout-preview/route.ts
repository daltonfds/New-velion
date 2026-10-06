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
    const city = String(searchParams.get("city") || "").trim();

    if (!affiliateLink) {
      return NextResponse.json({ error: "Invalid affiliate link." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.rpc("preview_public_checkout", {
      p_affiliate_link: affiliateLink,
      p_quantity: quantity,
      p_city: city,
    });

    if (error) {
      console.error("Checkout preview RPC failed:", error);
      const message = error.message || "";

      if (/INVALID_AFFILIATE_LINK/i.test(message)) {
        return NextResponse.json({ error: "Invalid affiliate link." }, { status: 404 });
      }
      if (/PRODUCT_OUT_OF_STOCK/i.test(message)) {
        return NextResponse.json(
          { error: "Not enough stock for the requested quantity." },
          { status: 409 },
        );
      }
      if (/PRODUCT_UNAVAILABLE_FOR_CHECKOUT/i.test(message)) {
        return NextResponse.json({ error: "Product is unavailable." }, { status: 409 });
      }

      return NextResponse.json(
        { error: "Could not load checkout details." },
        { status: 500 },
      );
    }

    const preview = Array.isArray(data) ? data[0] : data;

    if (!preview?.product_id) {
      return NextResponse.json({ error: "Product is unavailable." }, { status: 409 });
    }

    return NextResponse.json(
      {
        product: {
          id: preview.product_id,
          name: preview.product_name,
          description: preview.product_description,
          image: preview.product_image,
        },
        offer: {
          unit_price: Number(preview.unit_price),
          currency: preview.currency,
        },
        quantity: Number(preview.quantity),
        subtotal: Number(preview.subtotal),
        shipping: Number(preview.shipping),
        total: Number(preview.total),
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
