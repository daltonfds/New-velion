import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ndtitpmkfbouvaiforfx.supabase.co";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ referral: string }> },
) {
  const { referral } = await params;

  if (!referral) {
    return NextResponse.json(
      { error: "Referral code is required." },
      { status: 400 },
    );
  }

  const target = new URL(
    `/functions/v1/newvelion-api/go/${encodeURIComponent(referral)}`,
    SUPABASE_URL,
  );

  const response = await fetch(target, {
    method: "GET",
    redirect: "manual",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const location = response.headers.get("location");

  if (location) {
    return NextResponse.redirect(location, response.status);
  }

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") || "application/json",
    },
  });
}
