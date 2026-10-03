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

  const roundedAverage = Math.max(
    0,
    Math.min(5, Math.round(average)),
  );

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16294F]">
            Customer reviews
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            What customers are saying
          </h2>

          <div className="mt-5 flex items-center justify-center gap-3">
            <span
              className="tracking-widest text-[#C99A2E]"
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

        {reviews.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-xl border border-slate-200 bg-slate-50 p-8 text-center">
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
