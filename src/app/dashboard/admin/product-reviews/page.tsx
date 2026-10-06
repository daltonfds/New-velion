"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

async function api(path: string, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: "Bearer " + (session?.access_token || ""),
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body;
}

export default function ReviewModerationPage() {
  const [status, setStatus] = useState("pending");
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const body = await api("/api/admin/product-reviews?status=" + status);
      setReviews(body.reviews || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load reviews.");
    }
  }

  useEffect(() => { void load(); }, [status]);

  async function moderate(id: string, nextStatus: "approved" | "rejected") {
    try {
      await api("/api/admin/product-reviews/status", {
        method: "POST",
        body: JSON.stringify({ review_id: id, status: nextStatus }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update review.");
    }
  }

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#16294F]">Customer reviews</h1>
          <p className="mt-1 text-sm text-slate-500">Customers submit reviews; admins only moderate publication.</p>
        </div>

        <div className="flex gap-2">
          {["pending", "approved", "rejected"].map((value) => (
            <button key={value} type="button" onClick={() => setStatus(value)}
              className={"rounded-lg px-4 py-2 text-sm font-semibold " + (status === value ? "bg-[#16294F] text-white" : "border border-slate-200 bg-white text-slate-600")}>
              {value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                <div className="flex gap-4">
                  {review.product?.fotos?.[0] && <img src={review.product.fotos[0]} alt="" className="h-20 w-20 rounded-xl object-cover" />}
                  <div className="max-w-3xl">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{review.product?.nome || "Product"}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="tracking-widest text-[#C99A2E]">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                      <span className="text-xs text-slate-400">{review.verified_buyer ? "Verified buyer" : "Buyer"}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{review.review_text}</p>
                    <p className="mt-3 text-xs text-slate-400">By {review.is_anonymous ? "Anonymous customer" : (review.reviewer_name || "Customer")} · {new Date(review.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {status === "pending" && (
                  <div className="flex shrink-0 items-start gap-2">
                    <button onClick={() => void moderate(review.id, "approved")} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Approve</button>
                    <button onClick={() => void moderate(review.id, "rejected")} className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600">Reject</button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {reviews.length === 0 && <Card><div className="py-16 text-center text-sm text-slate-500">No {status} customer reviews.</div></Card>}
        </div>
      </div>
    </AppShell>
  );
}
