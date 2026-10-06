import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/ZAR",
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Exchange rate provider unavailable");
    }

    const data = await response.json();
    const rate = Number(data?.rates?.CNY);

    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("Invalid exchange rate");
    }

    return NextResponse.json({
      from: "ZAR",
      to: "CNY",
      rate,
      date: data?.date ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to retrieve exchange rate" },
      { status: 502 }
    );
  }
}
