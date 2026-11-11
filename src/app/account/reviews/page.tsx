"use client";

import { LoadingBlock } from "@/components/ui/Skeleton";
import SmartImage from "@/components/ui/SmartImage";
import Stars from "@/components/ui/Stars";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/customer/CustomerNav";
import { supabase } from "@/lib/supabase";

type Review = { id: string; product_id: string; rating: number; review_text: string; status: string; created_at: string; is_anonymous: boolean; product?: { nome: string; fotos?: string[] } };
type Purchase = { id: string; product_id: string; vendido_em: string; status: string | null; product?: { nome: string; fotos?: string[] } };

export default function ReviewsPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forms, setForms] = useState<Record<string, { rating: number; text: string; anonymous: boolean }>>({});

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }
    const [{ data: sales, error: salesError }, { data: reviewData, error: reviewError }] = await Promise.all([
      supabase.from("sales").select("id,product_id,vendido_em,status").eq("customer_id", user.id).order("vendido_em", { ascending: false }),
      supabase.from("product_reviews").select("id,product_id,rating,review_text,status,created_at,is_anonymous").eq("reviewer_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (salesError || reviewError) {
      setError(salesError?.message || reviewError?.message || "Unable to load your reviews.");
      setLoading(false);
      return;
    }
    const ids = [...new Set([...(sales || []).map((s: any) => s.product_id), ...(reviewData || []).map((r: any) => r.product_id)].filter(Boolean))];
    const { data: products } = ids.length ? await supabase.from("products").select("id,nome,fotos").in("id", ids) : { data: [] };
    const byId = new Map((products || []).map((p: any) => [p.id, p]));
    const reviewed = new Set((reviewData || []).map((r: any) => r.product_id));
    setPurchases((sales || []).filter((s: any) => !reviewed.has(s.product_id)).map((s: any) => ({ ...s, product: byId.get(s.product_id) })));
    setReviews((reviewData || []).map((r: any) => ({ ...r, product: byId.get(r.product_id) })));
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function submit(productId: string) {
    const f = forms[productId] || { rating: 5, text: "", anonymous: false };
    setError("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/login"); return; }
    const response = await fetch("/api/customer/reviews", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: "Bearer " + session.access_token },
      body: JSON.stringify({ product_id: productId, rating: f.rating, review_text: f.text, is_anonymous: f.anonymous }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.error || "Could not submit review."); return; }
    await load();
  }

  return (
    <main className="min-h-screen bg-ink-50">
      <CustomerNav />
      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="text-3xl font-extrabold text-ink-900">My reviews</h1>
        <p className="mt-2 text-slate-500">All testimonials you have submitted, plus purchases eligible for a new review.</p>
        {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <LoadingBlock label="Loading your reviews…" className="mt-8" /> : (
          <>
            <section className="mt-8">
              <h2 className="text-xl font-bold text-ink-900">Reviews you submitted <span className="text-sm font-medium text-slate-400">({reviews.length})</span></h2>
              {reviews.length === 0 ? <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">You have not submitted a review yet.</div> : <div className="mt-4 space-y-4">{reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start gap-4">{review.product?.fotos?.[0] && <SmartImage src={review.product.fotos[0]} alt="" className="h-16 w-16 rounded-xl object-cover" />}<div className="min-w-0 flex-1"><h3 className="font-bold text-ink-900">{review.product?.nome || "Product"}</h3><p className="mt-1 flex items-center gap-2"><Stars rating={review.rating || 0} size={18} /><span className="text-xs text-ink-500">{review.rating}/5</span></p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{review.review_text}</p><div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-600">{review.status === "approved" ? "Published" : review.status === "rejected" ? "Not approved" : "Pending moderation"}</span><span>{new Date(review.created_at).toLocaleDateString()}</span>{review.is_anonymous && <span>Posted anonymously</span>}</div></div></div>
                </article>
              ))}</div>}
            </section>
            <section className="mt-10">
              <h2 className="text-xl font-bold text-ink-900">Purchases you can review <span className="text-sm font-medium text-slate-400">({purchases.length})</span></h2>
              {purchases.length === 0 ? <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No purchases awaiting a review. Reviews are available after delivery.</div> : <div className="mt-4 space-y-5">{purchases.map((sale) => {
                const form = forms[sale.product_id] || { rating: 5, text: "", anonymous: false };
                return <article key={sale.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex gap-4">{sale.product?.fotos?.[0] && <SmartImage src={sale.product.fotos[0]} alt="" className="h-20 w-20 rounded-xl object-cover" />}<div><h3 className="font-extrabold text-ink-900">{sale.product?.nome || "Product"}</h3><p className="text-xs text-slate-400">Purchased {new Date(sale.vendido_em).toLocaleDateString()}</p></div></div>
                  <div className="mt-5 flex gap-1">{[1,2,3,4,5].map((n) => <button key={n} type="button" aria-label={`${n} stars`} onClick={() => setForms({ ...forms, [sale.product_id]: { ...form, rating: n } })} className="rounded-md p-0.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"><Star aria-hidden width={28} height={28} strokeWidth={1.75} className={n <= form.rating ? "fill-amber-500 text-amber-500" : "fill-transparent text-ink-300 hover:text-amber-500"} /></button>)}</div>
                  <textarea value={form.text} onChange={(e) => setForms({ ...forms, [sale.product_id]: { ...form, text: e.target.value } })} placeholder="Tell other customers about your experience…" className="mt-4 min-h-28 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-600" />
                  <label className="mt-3 flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.anonymous} onChange={(e) => setForms({ ...forms, [sale.product_id]: { ...form, anonymous: e.target.checked } })} />Post anonymously</label>
                  <button onClick={() => void submit(sale.product_id)} className="mt-4 rounded-xl bg-brand-600 px-5 py-3 font-bold text-white hover:bg-[#002d73] transition duration-150">Submit review</button>
                </article>;
              })}</div>}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
