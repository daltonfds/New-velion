import { NextResponse } from "next/server";
import { getPublicMarketplace } from "@/lib/public-marketplace/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getPublicMarketplace();
    return NextResponse.json({ suppliers: catalog.suppliers });
  } catch (error) {
    console.error("Public suppliers error:", error);
    return NextResponse.json({ error: "Unable to load suppliers." }, { status: 500 });
  }
}
