type Review = {
  id: string;
  reviewer_name: string | null;
  rating: number;
  review_text: string;
  media_urls: string[];
  verified_buyer: boolean;
};

function ReviewCard({ review }: { review: Review }) {
  const rating = Math.max(0, Math.min(5, review.rating));

  return (
    <article className="border border-slate-200 bg-white p-5">
      <div className="tracking-widest text-[#C99A2E]">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-700">
        “{review.review_text}”
      </p>

      <div className="mt-5 text-xs font-bold text-slate-900">
        {review.reviewer_name || "Newvelion customer"}
      </div>

      {review.verified_buyer && (
        <div className="mt-1 text-[11px] font-semibold text-emerald-700">
          Verified Buyer
        </div>
      )}

      {review.media_urls?.[0] && (
        <img
          src={review.media_urls[0]}
          alt=""
          className="mt-4 h-16 w-16 rounded-lg object-cover"
        />
      )}
    </article>
  );
}

export default function ReviewsSection({
  reviews,
}: {
  reviews: Review[];
}) {
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) /
      reviews.length
    : 0;

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16294F]">
            Customer stories
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Reviews from customers
          </h2>

          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            <span className="tracking-widest text-[#C99A2E]">
              ★★★★★
            </span>

            <span className="font-semibold text-slate-600">
              {average ? average.toFixed(1) : "0.0"} ·{" "}
              {reviews.length} reviews
            </span>
          </div>
        </div>

        {reviews.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-slate-500">
            No approved reviews have been published for this product yet.
          </p>
        )}
      </div>
    </section>
  );
}
