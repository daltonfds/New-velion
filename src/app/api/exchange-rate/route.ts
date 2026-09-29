import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || "ZAR";
    const to = searchParams.get("to") || "MZN";

    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Exchange rate provider unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rate = Number(data?.rates?.[to]);

    if (!Number.isFinite(rate) || rate <= 0) {
      return NextResponse.json(
        { error: "Invalid exchange rate" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      from,
      to,
      rate,
      date: data?.date ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to retrieve exchange rate" },
      { status: 500 }
    );
  }
}
