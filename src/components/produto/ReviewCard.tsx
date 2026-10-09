type Review = {
  id: string;
  reviewer_name: string | null;
  rating: number;
  review_text: string;
  media_urls: string[];
  verified_buyer: boolean;
  created_at: string;
};

export default function ReviewCard({ review }: { review: Review }) {
  const rating = Math.max(0, Math.min(5, Math.round(review.rating)));
  const date = new Date(review.created_at);
  const formattedDate = Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <article className="border border-[#E5E7EB] bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="tracking-widest text-[#10069F]" aria-label={`${rating} out of 5 stars`}>{ "★".repeat(rating) }{ "☆".repeat(5 - rating) }</div>
        {formattedDate && <span className="text-xs text-slate-400">{formattedDate}</span>}
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-700">“{review.review_text}”</p>
      {review.media_urls?.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {review.media_urls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-slate-200"><img src={url} alt="Customer review photo" loading="lazy" className="h-32 w-full object-cover" /></a>)}
        </div>
      )}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-[#0A0440]">{(review.reviewer_name || "N").charAt(0).toUpperCase()}</div>
        <div>
          <p className="text-sm font-bold text-slate-950">{review.reviewer_name || "Newvelion customer"}</p>
          {review.verified_buyer && <p className="mt-0.5 text-xs font-semibold text-emerald-700">Verified Buyer</p>}
        </div>
      </div>
    </article>
  );
}
