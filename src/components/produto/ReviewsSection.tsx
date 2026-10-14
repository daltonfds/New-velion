import ReviewCard from "./ReviewCard";
import ReviewSubmissionModal from "./ReviewSubmissionModal";

type Review = {
  id: string;
  reviewer_name: string | null;
  rating: number;
  review_text: string;
  media_urls: string[];
  verified_buyer: boolean;
  created_at: string;
};

const THE_HERBALIST_TESTIMONIAL_IMAGES = [
  "/the-herbalist-photos/_OvUIpev6_mid.jpg",
  "/the-herbalist-photos/_X3ZodHqt.jpg",
  "/the-herbalist-photos/-L3RyvjAR_mid.jpg",
  "/the-herbalist-photos/244727-1.webp",
  "/the-herbalist-photos/2CpxeomDh.jpg",
  "/the-herbalist-photos/3iwBQqQq9j.jpg",
  "/the-herbalist-photos/4qkqGYib1.jpg",
  "/the-herbalist-photos/67SnrZhNo.jpg",
  "/the-herbalist-photos/6NpYkDqsz_mid.jpg",
  "/the-herbalist-photos/7AN9vEmSu.jpg",
  "/the-herbalist-photos/7J6qrYRiE.jpg",
  "/the-herbalist-photos/7PtjPmt-3_mid.jpg",
  "/the-herbalist-photos/8008221704ed49709a57901b6f0d858b.jpg",
  "/the-herbalist-photos/862PK3eZF.jpg",
  "/the-herbalist-photos/9ed0ALNbUO_mid.jpg",
  "/the-herbalist-photos/9id9p1fTB.jpg",
  "/the-herbalist-photos/ATTRACTON-25-MOCKUP-DUO.jpg",
  "/the-herbalist-photos/CnqoYa_i9.jpg",
  "/the-herbalist-photos/cVs9LDi6G.jpg",
  "/the-herbalist-photos/CY0hYq8OB__1_.jpg",
  "/the-herbalist-photos/CY0hYq8OB_(1).jpg",
  "/the-herbalist-photos/CY0hYq8OB.jpg",
  "/the-herbalist-photos/eObdHNWsI.jpg",
  "/the-herbalist-photos/EUx9V9fNo_mid.jpg",
  "/the-herbalist-photos/FalpPvnjt_96KonAO17_orig.jpg",
  "/the-herbalist-photos/fRTHK7bhp.jpg",
  "/the-herbalist-photos/GHQDNrI3t.jpg",
  "/the-herbalist-photos/GrXguk2wL__1_.jpg",
  "/the-herbalist-photos/GrXguk2wL_(1).jpg",
  "/the-herbalist-photos/GrXguk2wL.jpg",
  "/the-herbalist-photos/hN94rtPLHh.jpg",
  "/the-herbalist-photos/JVih4JS-w.jpg",
  "/the-herbalist-photos/KgkC21diP__1_.jpg",
  "/the-herbalist-photos/KgkC21diP_(1).jpg",
  "/the-herbalist-photos/KgkC21diP.jpg",
  "/the-herbalist-photos/kk2esUiGq.jpg",
  "/the-herbalist-photos/LmjuAKdxB.jpg",
  "/the-herbalist-photos/mGYpE0QYf.jpg",
  "/the-herbalist-photos/mHeEVfbXW__1_.jpg",
  "/the-herbalist-photos/mHeEVfbXW_(1).jpg",
  "/the-herbalist-photos/mHeEVfbXW.jpg",
  "/the-herbalist-photos/mqzMi6TZ-.jpg",
  "/the-herbalist-photos/nAioFT2we.jpg",
  "/the-herbalist-photos/NmbKyHhLM.jpg",
  "/the-herbalist-photos/npSYy18Om.jpg",
  "/the-herbalist-photos/NU2OalTgk.jpg",
  "/the-herbalist-photos/NvyxDkowia.jpg",
  "/the-herbalist-photos/O7q53xFBd.jpg",
  "/the-herbalist-photos/okVpmE_CS.jpg",
  "/the-herbalist-photos/pkiiMaxYX.jpg",
  "/the-herbalist-photos/qLcgwStIM.jpg",
  "/the-herbalist-photos/qve3O3dfm.jpg",
  "/the-herbalist-photos/raw-herb-capsule-superhuman.jpeg",
  "/the-herbalist-photos/RnpWMzMMp.jpg",
  "/the-herbalist-photos/rxtmuzuOn_mid.jpg",
  "/the-herbalist-photos/Sg4Fja2yH.jpg",
  "/the-herbalist-photos/SPciSUlGh.jpg",
  "/the-herbalist-photos/superhuman_ingredients.jpeg",
  "/the-herbalist-photos/superhuman-info.jpeg",
  "/the-herbalist-photos/Tak4gqhNWm__1_.jpg",
  "/the-herbalist-photos/Tak4gqhNWm_(1).jpg",
  "/the-herbalist-photos/Tak4gqhNWm.jpg",
  "/the-herbalist-photos/tB5nIdLf_.jpg",
  "/the-herbalist-photos/vbqp2u1N3.jpg",
  "/the-herbalist-photos/VhiwMzVOQ.jpg",
  "/the-herbalist-photos/VnZ7va1tD.jpg",
  "/the-herbalist-photos/Weight_Loss_Bundle.jpeg",
  "/the-herbalist-photos/Weight-Loss-Bundle.jpeg",
  "/the-herbalist-photos/wiwnO23eM.jpg",
  "/the-herbalist-photos/x5wf7S_RT6.jpg",
  "/the-herbalist-photos/XXLl1AY_E.jpg",
  "/the-herbalist-photos/Y9Q6E5R6ia__1_.jpg",
  "/the-herbalist-photos/Y9Q6E5R6ia_(1).jpg",
  "/the-herbalist-photos/Y9Q6E5R6ia.jpg",
  "/the-herbalist-photos/YReDi1r3z.jpg",
  "/the-herbalist-photos/yzCPYHT1J__1_.jpg",
  "/the-herbalist-photos/yzCPYHT1J_(1).jpg",
  "/the-herbalist-photos/yzCPYHT1J.jpg",
  "/the-herbalist-photos/zoSHYhk9e.jpg",
];

export default function ReviewsSection({ reviews, productId, sharedTestimonials = false }: { reviews: Review[]; productId: string; sharedTestimonials?: boolean }) {
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
        {sharedTestimonials && (
          <div className="mt-10">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-2xl font-bold text-slate-950">The Herbalist customer testimonials</h3>
              <p className="mt-2 text-sm text-slate-600">Shared customer testimonials shown across The Herbalist product pages. These photos are not assigned to a specific product.</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {THE_HERBALIST_TESTIMONIAL_IMAGES.map((src) => (
                <article key={src} className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                  <a href={src} target="_blank" rel="noreferrer" className="block">
                    <img src={src} alt="The Herbalist customer testimonial" loading="lazy" className="aspect-[3/4] w-full object-contain bg-slate-50" />
                  </a>
                  <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
                    <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                    <span className="text-xs font-semibold text-emerald-800">Verified buyer</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        <div className="mt-10 rounded-2xl border border-[#DCE8F7] bg-[#F7FAFF] p-6">
          <p className="text-lg font-black text-[#001B44]">Share your experience</p>
          <p className="mt-1 text-sm text-slate-500">Share your feedback without creating an account. Every review is checked before it appears publicly.</p>
          <ReviewSubmissionModal productId={productId} />
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

