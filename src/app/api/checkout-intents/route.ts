import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Checkout service is not configured." },
        { status: 500 },
      );
    }

    const form = await request.formData();

    const affiliateLink = String(form.get("affiliate_link") || "").trim();
    const fullName = String(form.get("full_name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const whatsapp = String(form.get("whatsapp") || "").trim() || null;
    const email = String(form.get("email") || "").trim() || null;
    const country = String(form.get("country") || "").trim();
    const province = String(form.get("province") || "").trim();
    const city = String(form.get("city") || "").trim();
    const postalCode = String(form.get("postal_code") || "").trim() || null;
    const address = String(form.get("address") || "").trim();
    const addressReference =
      String(form.get("address_reference") || "").trim() || null;

    if (
      !affiliateLink ||
      !fullName ||
      !phone ||
      !country ||
      !province ||
      !city ||
      !address
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.rpc(
      "create_public_checkout_session",
      {
        p_affiliate_link: affiliateLink,
        p_full_name: fullName,
        p_phone: phone,
        p_whatsapp: whatsapp,
        p_email: email,
        p_country: country,
        p_province: province,
        p_city: city,
        p_postal_code: postalCode,
        p_address: address,
        p_address_reference: addressReference,
      },
    );

    if (error) {
      console.error("Public checkout session RPC failed:", error);

      const message = error.message || "";

      if (/invalid affiliate link/i.test(message)) {
        return NextResponse.json(
          { error: "Invalid affiliate link." },
          { status: 404 },
        );
      }

      if (/product is unavailable/i.test(message)) {
        return NextResponse.json(
          { error: "Product is unavailable." },
          { status: 409 },
        );
      }

      if (/required customer delivery fields/i.test(message)) {
        return NextResponse.json(
          { error: "Please complete all required fields." },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Could not create checkout session." },
        { status: 500 },
      );
    }

    const session = Array.isArray(data) ? data[0] : data;

    if (!session?.session_id || !session?.checkout_url) {
      console.error("Checkout RPC returned an invalid result:", data);

      return NextResponse.json(
        { error: "Could not create checkout session." },
        { status: 500 },
      );
    }

    const checkoutUrl = new URL(session.checkout_url);
    checkoutUrl.searchParams.set("newvelion_session", session.session_id);

    return NextResponse.redirect(checkoutUrl.toString(), 303);
  } catch (error) {
    console.error("Checkout intent error:", error);

    return NextResponse.json(
      { error: "Unexpected checkout error." },
      { status: 500 },
    );
  }
}
