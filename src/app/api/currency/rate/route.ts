import { NextResponse } from "next/server";

const SUPPORTED = /^[A-Z]{3}$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const base = String(url.searchParams.get("base") || "ZAR").toUpperCase();
  const quote = String(url.searchParams.get("quote") || "").toUpperCase();

  if (!SUPPORTED.test(base) || !SUPPORTED.test(quote)) {
    return NextResponse.json({ error: "Unsupported currency." }, { status: 400 });
  }

  if (base === quote) return NextResponse.json({ base, quote, rate: 1 });

  try {
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`,
      { next: { revalidate: 300 } },
    );

    if (!response.ok) throw new Error("FX provider unavailable.");

    const data = await response.json();
    const rate = Number(data?.rates?.[quote]);

    if (!Number.isFinite(rate) || rate <= 0) {
      return NextResponse.json({ error: "Exchange rate unavailable." }, { status: 503 });
    }

    return NextResponse.json({
      base,
      quote,
      rate,
      fetched_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Exchange rate unavailable." }, { status: 503 });
  }
}
