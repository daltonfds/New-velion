"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SalesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = params.id as string;
  const ref = searchParams.get("ref");

  const [error, setError] = useState("");

  useEffect(() => {
    async function redirectToProduct() {
      if (!productId) return;

      const { data, error: queryError } = await supabase
        .from("products")
        .select("slug")
        .eq("id", productId)
        .eq("ativo", true)
        .maybeSingle();

      if (queryError || !data?.slug) {
        setError(
          queryError?.message || "This product is no longer available.",
        );
        return;
      }

      const params = new URLSearchParams();

      if (ref) {
        params.set("ref", ref);
      }

      const query = params.toString();

      router.replace(
        `/produto/${encodeURIComponent(data.slug)}${query ? `?${query}` : ""}`,
      );
    }

    redirectToProduct();
  }, [productId, ref, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-950">
            Offer unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-sm text-slate-500">Loading offer...</p>
    </main>
  );
}
