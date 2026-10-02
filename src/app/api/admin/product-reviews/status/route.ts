import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase server configuration is missing." },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const reviewId = String(body?.review_id || "").trim();
    const status = String(body?.status || "").trim();

    if (!reviewId || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid review_id or status." },
        { status: 400 },
      );
    }

    const { data: review, error: reviewError } = await supabase
      .from("product_reviews")
      .select("id,product_id,status")
      .eq("id", reviewId)
      .maybeSingle();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: "Review not found." },
        { status: 404 },
      );
    }

    const { error: updateError } = await supabase
      .from("product_reviews")
      .update({ status })
      .eq("id", reviewId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 },
      );
    }

    const { data: approvedReviews, error: approvedError } = await supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", review.product_id)
      .eq("status", "approved");

    if (approvedError) {
      return NextResponse.json({
        success: true,
        review_id: reviewId,
        status,
        warning:
          "Review status changed, but product rating could not be refreshed.",
      });
    }

    const ratings = (approvedReviews ?? []).map((item) => Number(item.rating));
    const total = ratings.length;

    const average =
      total > 0
        ? Math.round(
            (ratings.reduce((sum, rating) => sum + rating, 0) / total) * 100,
          ) / 100
        : 0;

    const { error: productError } = await supabase
      .from("products")
      .update({
        avaliacao_media: average,
        total_avaliacoes: total,
        updated_at: new Date().toISOString(),
      })
      .eq("id", review.product_id);

    if (productError) {
      return NextResponse.json({
        success: true,
        review_id: reviewId,
        status,
        warning:
          "Review status changed, but product rating could not be refreshed.",
      });
    }

    return NextResponse.json({
      success: true,
      review_id: reviewId,
      status,
      product_rating: {
        average,
        total,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      { status: 500 },
    );
  }
}
