import { NextResponse } from "next/server";
import { getPublicSupplier } from "@/lib/public-marketplace/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const result = await getPublicSupplier(slug);
    if (!result) return NextResponse.json({ error: "Supplier not found." }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Public supplier error:", error);
    return NextResponse.json({ error: "Unable to load the supplier." }, { status: 500 });
  }
}
