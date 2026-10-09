"use client";

import { useState } from "react";
import Link from "next/link";
import ReviewCard from "./ReviewCard";

type Review = {
  id: string;
  reviewer_name: string | null;
  rating: number;
  review_text: string;
  media_urls: string[];
  verified_buyer: boolean;
  created_at: string;
};

export default function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const roundedAverage = Math.max(0, Math.min(5, Math.round(average)));

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#003B95]">Customer reviews</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">What customers are saying</h2>
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="tracking-widest text-[#0078E8]" aria-label={`${roundedAverage} out of 5 stars`}>{ "★".repeat(roundedAverage) }{ "☆".repeat(5 - roundedAverage) }</span>
            <span className="text-sm font-semibold text-slate-600">{average ? average.toFixed(1) : "0.0"} / 5</span>
            <span className="text-sm text-slate-400">({reviews.length} reviews)</span>
          </div>
        </div>
        <div className="mt-10 rounded-2xl border border-[#DCE8F7] bg-[#F7FAFF] p-6">
          <p className="text-lg font-black text-[#001B44]">Share your experience</p>
          <p className="mt-1 text-sm text-slate-500">Verified reviews are available after a delivered purchase. You can attach up to 4 photos.</p>
          <p className="mt-2 text-sm text-slate-600">New to Newvelion? <Link href="/register/customer" className="font-bold text-[#10069F] underline underline-offset-2">Create a customer account</Link> with your mobile number and email.</p>
          <ReviewForm />
        </div>
        {reviews.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-xl border border-[#E5E7EB] bg-[#F7F8FA] p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">No customer reviews yet.</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Reviews will appear here once approved for this product.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    try {
      const { supabase } = await import("@/lib/supabase");
      if (!supabase) throw new Error("Account service unavailable.");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/login?next=" + encodeURIComponent(window.location.pathname);
        return;
      }
      const productId = document.querySelector("[data-product-id]")?.getAttribute("data-product-id");
      if (!productId) throw new Error("Product unavailable.");

      let mediaUrls: string[] = [];
      if (files.length) {
        const formData = new FormData();
        formData.append("product_id", productId);
        files.forEach((file) => formData.append("files", file));
        const uploadResponse = await fetch("/api/customer/reviews", {
          method: "POST",
          headers: { Authorization: "Bearer " + session.access_token, "x-review-media-upload": "1" },
          body: formData,
        });
        const uploadBody = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadBody.error || "Unable to upload photos.");
        mediaUrls = uploadBody.media_urls || [];
      }

      const response = await fetch("/api/customer/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ product_id: productId, rating, review_text: text, is_anonymous: anonymous, media_urls: mediaUrls }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to submit review.");
      setText("");
      setFiles([]);
      setStatus("Review submitted. It will appear after approval.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <div className="flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className={`text-2xl ${value <= rating ? "text-[#FFB800]" : "text-slate-300"}`} aria-label={`${value} stars`}>★</button>)}</div>
      <textarea required minLength={5} maxLength={5000} rows={4} value={text} onChange={(event) => setText(event.target.value)} placeholder="Tell other customers about your experience..." className="mt-3 w-full rounded-xl border border-[#CBD8E8] bg-white p-3 text-sm outline-none focus:border-[#0078E8] focus:ring-2 focus:ring-[#EAF3FF]" />
      <div className="mt-4">
        <label htmlFor="review-photos" className="block text-sm font-semibold text-slate-700">Add photos (up to 4)</label>
        <input id="review-photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => {
          const selected = Array.from(event.target.files || []);
          if (selected.length > 4) { setStatus("Choose up to 4 photos."); event.target.value = ""; setFiles([]); return; }
          if (selected.some((file) => file.size > 5 * 1024 * 1024)) { setStatus("Each photo must be 5 MB or smaller."); event.target.value = ""; setFiles([]); return; }
          setStatus("");
          setFiles(selected);
        }} className="mt-2 block w-full rounded-xl border border-[#CBD8E8] bg-white p-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#EAF3FF] file:px-4 file:py-2 file:font-bold file:text-[#003B95]" />
        {files.length > 0 && <div className="mt-3 flex flex-wrap gap-3">{files.map((file) => <div key={file.name + file.lastModified} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2"><span className="max-w-40 truncate text-xs text-slate-600">{file.name}</span><button type="button" onClick={() => setFiles((current) => current.filter((item) => item !== file))} className="text-xs font-bold text-red-600" aria-label={`Remove ${file.name}`}>Remove</button></div>)}</div>}
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} /> Post anonymously</label>
      <button disabled={submitting} className="mt-4 rounded-xl bg-[#0078E8] px-5 py-3 text-sm font-black text-white hover:bg-[#006CE5] disabled:opacity-50">{submitting ? "Submitting..." : "SUBMIT REVIEW"}</button>
      {status && <p className="mt-3 text-sm font-semibold text-slate-600" role="status">{status}</p>}
    </form>
  );
}
