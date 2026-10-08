import { useState } from "react";
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

export default function ReviewsSection({
  reviews,
}: {
  reviews: Review[];
}) {
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const roundedAverage = Math.max(0, Math.min(5, Math.round(average)));

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#003B95]">
            Customer reviews
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            What customers are saying
          </h2>

          <div className="mt-5 flex items-center justify-center gap-3">
            <span
              className="tracking-widest text-[#0078E8]"
              aria-label={`${roundedAverage} out of 5 stars`}
            >
              {"★".repeat(roundedAverage)}
              {"☆".repeat(5 - roundedAverage)}
            </span>

            <span className="text-sm font-semibold text-slate-600">
              {average ? average.toFixed(1) : "0.0"} / 5
            </span>

            <span className="text-sm text-slate-400">
              ({reviews.length} reviews)
            </span>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-[#DCE8F7] bg-[#F7FAFF] p-6">
          <p className="text-lg font-black text-[#001B44]">Share your experience</p>
          <p className="mt-1 text-sm text-slate-500">Verified reviews are available after a delivered purchase.</p>
          <ReviewForm />
        </div>

        {reviews.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-xl border border-[#E5E7EB] bg-[#F7F8FA] p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No customer reviews yet.
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Reviews will appear here once approved for this product.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}


function ReviewForm() {
  const [rating,setRating]=useState(5);
  const [text,setText]=useState("");
  const [anonymous,setAnonymous]=useState(false);
  const [status,setStatus]=useState("");
  const [submitting,setSubmitting]=useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setStatus("");
    try {
      const { supabase } = await import("@/lib/supabase");
      if (!supabase) throw new Error("Account service unavailable.");
      const { data:{session} } = await supabase.auth.getSession();
      if (!session) { window.location.href="/login?next="+encodeURIComponent(window.location.pathname); return; }
      const productId=document.querySelector("[data-product-id]")?.getAttribute("data-product-id");
      if (!productId) throw new Error("Product unavailable.");
      const response=await fetch("/api/customer/reviews",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},body:JSON.stringify({product_id:productId,rating,review_text:text,is_anonymous:anonymous})});
      const body=await response.json(); if(!response.ok) throw new Error(body.error||"Unable to submit review.");
      setText(""); setStatus("Review submitted. It will appear after approval.");
    } catch(error) { setStatus(error instanceof Error?error.message:"Unable to submit review."); }
    finally { setSubmitting(false); }
  }
  return <form onSubmit={submit} className="mt-4">
    <div className="flex gap-1">{[1,2,3,4,5].map(v=><button key={v} type="button" onClick={()=>setRating(v)} className={`text-2xl ${v<=rating?"text-[#FFB800]":"text-slate-300"}`} aria-label={`${v} stars`}>★</button>)}</div>
    <textarea required minLength={5} maxLength={5000} rows={4} value={text} onChange={e=>setText(e.target.value)} placeholder="Tell other customers about your experience..." className="mt-3 w-full rounded-xl border border-[#CBD8E8] bg-white p-3 text-sm outline-none focus:border-[#0078E8] focus:ring-2 focus:ring-[#EAF3FF]" />
    <label className="mt-3 flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)} /> Post anonymously</label>
    <button disabled={submitting} className="mt-4 rounded-xl bg-[#0078E8] px-5 py-3 text-sm font-black text-white hover:bg-[#006CE5] disabled:opacity-50">{submitting?"Submitting...":"SUBMIT REVIEW"}</button>
    {status && <p className="mt-3 text-sm font-semibold text-slate-600" role="status">{status}</p>}
  </form>;
}