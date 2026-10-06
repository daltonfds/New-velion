import { NextResponse } from "next/server";
import { getPublicProduct } from "@/lib/public-marketplace/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const result = await getPublicProduct(slug);
    if (!result) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Public product error:", error);
    return NextResponse.json({ error: "Unable to load the product." }, { status: 500 });
  }
}
