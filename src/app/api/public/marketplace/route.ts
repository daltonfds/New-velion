import { NextResponse } from "next/server";
import { getPublicMarketplace } from "@/lib/public-marketplace/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim().toLowerCase() || "";
    const category = url.searchParams.get("category") || "";
    const supplier = url.searchParams.get("supplier") || "";
    const featured = url.searchParams.get("featured") === "true";
    const isNew = url.searchParams.get("new") === "true";
    const min = Number(url.searchParams.get("min") || 0);
    const maxParam = url.searchParams.get("max");
    const max = maxParam ? Number(maxParam) : Number.POSITIVE_INFINITY;
    const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 24), 1), 48);

    const catalog = await getPublicMarketplace();

    const filtered = catalog.products.filter((product) => {
      const haystack = [
        product.name,
        product.description || "",
        product.category?.name || "",
        product.subcategory?.name || "",
        product.supplier?.name || "",
      ].join(" ").toLowerCase();

      return (
        (!q || haystack.includes(q)) &&
        (!category || product.category?.slug === category || product.category?.id === category) &&
        (!supplier || product.supplier?.slug === supplier || product.supplier?.id === supplier) &&
        (!featured || product.featured) &&
        (!isNew || product.isNew) &&
        product.price >= min &&
        product.price <= max
      );
    });

    const start = (page - 1) * limit;
    return NextResponse.json({
      products: filtered.slice(start, start + limit),
      categories: catalog.categories,
      suppliers: catalog.suppliers,
      pagination: {
        page,
        limit,
        total: filtered.length,
        pages: Math.max(Math.ceil(filtered.length / limit), 1),
      },
    });
  } catch (error) {
    console.error("Public marketplace error:", error);
    return NextResponse.json({ error: "Unable to load the public marketplace." }, { status: 500 });
  }
}
