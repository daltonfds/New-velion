import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Checkout service is not configured." },
        { status: 500 }
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
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const normalizedLink = affiliateLink
      .trim()
      .replace(/^\/+/, "")
      .replace(/^go\//i, "go/");

    const canonicalLink = normalizedLink.startsWith("go/")
      ? normalizedLink
      : `go/${normalizedLink}`;

    const { data: resolved, error: resolveError } = await supabase.rpc(
      "resolve_affiliate_product",
      { p_link_unico: canonicalLink }
    );

    const resolvedProduct = Array.isArray(resolved) ? resolved[0] : resolved;

    if (
      resolveError ||
      !resolvedProduct?.product_id ||
      !resolvedProduct?.affiliate_id
    ) {
      console.error("Affiliate resolution failed:", {
        affiliateLink,
        normalizedLink,
        canonicalLink,
        resolveError,
        resolved,
      });

      return NextResponse.json(
        {
          error: "Invalid affiliate link.",
          debug: process.env.NODE_ENV === "development"
            ? { canonicalLink, resolveError: resolveError?.message }
            : undefined,
        },
        { status: 404 }
      );
    }

    const { data: affiliation, error: affiliationError } = await supabase
      .from("affiliations")
      .select("id, vendedor_id, product_id, link_unico, ativo")
      .eq("id", resolvedProduct.affiliate_id)
      .eq("ativo", true)
      .maybeSingle();

    if (affiliationError || !affiliation) {
      console.error("Resolved affiliation could not be loaded:", {
        canonicalLink,
        affiliateId: resolvedProduct.affiliate_id,
        affiliationError,
      });

      return NextResponse.json(
        { error: "Invalid affiliate link." },
        { status: 404 }
      );
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, preco, preco_promocional, moeda, checkout_url, ativo")
      .eq("id", resolvedProduct.product_id)
      .eq("ativo", true)
      .maybeSingle();

    if (
      productError ||
      !product ||
      !product.checkout_url ||
      !/^https?:\/\//i.test(product.checkout_url)
    ) {
      console.error("Product checkout unavailable:", {
        productId: resolvedProduct.product_id,
        productError,
        checkoutUrl: product?.checkout_url,
      });

      return NextResponse.json(
        { error: "Product checkout is unavailable." },
        { status: 409 }
      );
    }

    const amount =
      product.preco_promocional !== null &&
      Number(product.preco_promocional) > 0
        ? Number(product.preco_promocional)
        : Number(product.preco);

    const { data: session, error: sessionError } = await supabase
      .from("checkout_sessions")
      .insert({
        affiliation_id: affiliation.id,
        product_id: product.id,
        seller_id: affiliation.vendedor_id,
        affiliate_link: affiliation.link_unico,
        full_name: fullName,
        phone,
        whatsapp,
        email,
        country,
        province,
        city,
        postal_code: postalCode,
        address,
        address_reference: addressReference,
        amount,
        currency: product.moeda,
        checkout_url: product.checkout_url,
        status: "pending",
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      console.error("Failed to create checkout session:", sessionError);
      return NextResponse.json(
        { error: "Could not create checkout session." },
        { status: 500 }
      );
    }

    const checkoutUrl = new URL(product.checkout_url);
    checkoutUrl.searchParams.set("newvelion_session", session.id);

    return NextResponse.redirect(checkoutUrl.toString(), 303);
  } catch (error) {
    console.error("Checkout intent error:", error);

    return NextResponse.json(
      { error: "Unexpected checkout error." },
      { status: 500 }
    );
  }
}
