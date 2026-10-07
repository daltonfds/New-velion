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

  const formattedDate = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

  return (
    <article className="border border-[#DDE5EF] bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="tracking-widest text-[#C99A2E]" aria-label={`${rating} out of 5 stars`}>
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </div>

        {formattedDate && (
          <span className="text-xs text-slate-400">{formattedDate}</span>
        )}
      </div>

      <p className="mt-5 text-sm leading-7 text-slate-700">
        “{review.review_text}”
      </p>

      <div className="mt-6 flex items-center gap-3">
        {review.media_urls?.[0] ? (
          <img
            src={review.media_urls[0]}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-[#0E1F3D]">
            {(review.reviewer_name || "N").charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <p className="text-sm font-bold text-slate-950">
            {review.reviewer_name || "Newvelion customer"}
          </p>

          {review.verified_buyer && (
            <p className="mt-0.5 text-xs font-semibold text-emerald-700">
              Verified Buyer
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
