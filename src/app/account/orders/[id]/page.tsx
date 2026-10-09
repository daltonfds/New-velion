"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import CustomerNav from "@/components/customer/CustomerNav";
import { supabase } from "@/lib/supabase";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/login"); return; }
    const response = await fetch("/api/customer/orders/" + encodeURIComponent(id), {
      headers: { Authorization: "Bearer " + session.access_token },
      cache: "no-store",
    });
    const body = await response.json();
    if (!response.ok) setError(body.error || "Unable to load order.");
    else setOrder(body.order);
    setLoading(false);
  }

  useEffect(() => { void load(); }, [id]);

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!order?.product || !order.purchase_session_id || order.fulfillment?.status !== "delivered") return;
    setSubmitting(true);
    setReviewMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }

    let mediaUrls: string[] = [];
    if (reviewFiles.length) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      const formData = new FormData();
      formData.append("product_id", order.product_id);
      reviewFiles.forEach((file) => formData.append("files", file));
      const uploadResponse = await fetch("/api/customer/reviews", {
        method: "POST",
        headers: { Authorization: "Bearer " + session.access_token, "x-review-media-upload": "1" },
        body: formData,
      });
      const uploadBody = await uploadResponse.json();
      if (!uploadResponse.ok) {
        setSubmitting(false);
        setReviewMessage(uploadBody.error || "Unable to upload photos.");
        return;
      }
      mediaUrls = uploadBody.media_urls || [];
    }

    const { error: insertError } = await supabase.from("product_reviews").insert({
      product_id: order.product_id,
      reviewer_id: user.id,
      purchase_session_id: order.purchase_session_id,
      verified_buyer: true,
      rating,
      review_text: reviewText.trim(),
      media_urls: mediaUrls,
      is_anonymous: anonymous,
      reviewer_name: anonymous ? null : reviewerName.trim(),
      status: "pending",
    });

    setSubmitting(false);
    if (insertError) {
      setReviewMessage(insertError.message);
      return;
    }

    setReviewText("");
    setReviewerName("");
    setReviewFiles([]);
    setReviewMessage("Review submitted. It will appear after admin approval.");
    await load();
  }

  if (loading) return <main className="min-h-screen bg-slate-50"><CustomerNav /><div className="mx-auto max-w-5xl px-5 py-10 text-slate-500">Loading order…</div></main>;
  if (error || !order) return <main className="min-h-screen bg-slate-50"><CustomerNav /><div className="mx-auto max-w-5xl px-5 py-10"><p className="text-red-600">{error || "Order not found."}</p></div></main>;

  const f = order.fulfillment;
  const delivered = f?.status === "delivered";
  const existingReview = order.reviews?.[0];

  return (
    <main className="min-h-screen bg-slate-50">
      <CustomerNav />
      <div className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/account/orders" className="text-sm font-bold text-[#16294F]">← Back to orders</Link>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row">
            {order.product?.fotos?.[0] && <img src={order.product.fotos[0]} alt="" className="h-28 w-28 rounded-xl object-cover" />}
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Order</p>
              <h1 className="mt-1 text-2xl font-extrabold text-[#16294F]">{order.product?.nome || "Product"}</h1>
              <p className="mt-2 text-sm text-slate-500">Qty {order.quantity} · {new Date(order.vendido_em).toLocaleString()}</p>
              <p className="mt-3 text-xl font-extrabold text-slate-950">R {Number(order.valor_venda || 0).toFixed(2)}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{f?.status || order.status}</span>
              {f?.public_tracking_token && <Link href={"/rastreio/" + f.public_tracking_token} className="mt-3 block text-sm font-bold text-blue-600">Track delivery</Link>}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-extrabold text-[#16294F]">Delivery</h2>
          {f ? (
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <p><strong>Status:</strong> {f.status}</p>
              <p><strong>Carrier:</strong> {f.carrier || "—"}</p>
              <p><strong>Tracking:</strong> {f.tracking_number || "—"}</p>
              <p><strong>Estimated delivery:</strong> {f.estimated_delivery_at ? new Date(f.estimated_delivery_at).toLocaleDateString() : "—"}</p>
              <p className="sm:col-span-2"><strong>Address:</strong> {f.shipping_address || "—"}, {f.shipping_city || "—"}, {f.shipping_province || "—"}</p>
            </div>
          ) : <p className="mt-3 text-sm text-slate-500">Fulfillment details will appear after payment is confirmed.</p>}
        </section>

        {delivered && !existingReview ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-extrabold text-[#16294F]">Review your purchase</h2>
            <p className="mt-1 text-sm text-slate-500">Only verified customers can submit reviews. Your review will remain pending until an admin approves it.</p>
            <form onSubmit={submitReview} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700">Rating</label>
                <div className="mt-2 flex gap-1">
                  {[1,2,3,4,5].map(value => <button key={value} type="button" onClick={() => setRating(value)} className="text-2xl text-[#C99A2E]" aria-label={value + " stars"}>{value <= rating ? "★" : "☆"}</button>)}
                </div>
              </div>
              <textarea required minLength={5} maxLength={2000} value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Tell other customers about your experience" className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16294F]" />
              {!anonymous && <input required minLength={2} maxLength={120} value={reviewerName} onChange={e => setReviewerName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#16294F]" />}
              <div>
                <label htmlFor="order-review-photos" className="block text-sm font-bold text-slate-700">Add photos (up to 4)</label>
                <input id="order-review-photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={e => {
                  const selected = Array.from(e.target.files || []);
                  if (selected.length > 4) { setReviewMessage("Choose up to 4 photos."); e.target.value = ""; setReviewFiles([]); return; }
                  if (selected.some(file => file.size > 5 * 1024 * 1024)) { setReviewMessage("Each photo must be 5 MB or smaller."); e.target.value = ""; setReviewFiles([]); return; }
                  setReviewMessage("");
                  setReviewFiles(selected);
                }} className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-bold file:text-blue-700" />
                {reviewFiles.length > 0 && <p className="mt-2 text-xs text-slate-500">{reviewFiles.length} photo(s) selected</p>}
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} /> Post anonymously</label>
              <button type="submit" disabled={submitting} className="rounded-xl bg-[#16294F] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">{submitting ? "Submitting..." : "Submit review"}</button>
              {reviewMessage && <p className="text-sm text-slate-600">{reviewMessage}</p>}
            </form>
          </section>
        ) : existingReview ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-extrabold text-[#16294F]">Your review</h2>
            <p className="mt-2 text-sm text-slate-600">Status: <strong>{existingReview.status}</strong>. It will appear publicly when approved.</p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
