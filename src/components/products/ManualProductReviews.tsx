"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Review = {
  id: string;
  reviewer_name: string | null;
  email: string | null;
  rating: number;
  review_text: string;
  media_urls: string[] | null;
  status: string;
  review_date: string | null;
  created_by_admin?: boolean;
};

type Draft = {
  reviewer_name: string;
  email: string;
  rating: number;
  review_text: string;
  review_date: string;
  files: File[];
};

const emptyDraft = (): Draft => ({
  reviewer_name: "", email: "", rating: 5, review_text: "",
  review_date: new Date().toISOString().slice(0, 10), files: [],
});

export default function ManualProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);

  const token = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || "";
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const accessToken = await token();
      const response = await fetch(`/api/dashboard/product-reviews?product_id=${encodeURIComponent(productId)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível carregar os depoimentos.");
      setReviews(body.reviews || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar depoimentos.");
    } finally {
      setLoading(false);
    }
  }, [productId, token]);

  useEffect(() => { void load(); }, [load]);

  function beginEdit(review: Review) {
    setEditingId(review.id);
    setDraft({
      reviewer_name: review.reviewer_name || "",
      email: review.email || "",
      rating: review.rating,
      review_text: review.review_text || "",
      review_date: (review.review_date || new Date().toISOString()).slice(0, 10),
      files: [],
    });
    setShowForm(true);
    setNotice("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const accessToken = await token();
      const mediaUrls: string[] = editingId ? [...(reviews.find(r => r.id === editingId)?.media_urls || [])] : [];
      for (const file of draft.files) {
        const upload = new FormData();
        upload.set("action", "upload");
        upload.set("product_id", productId);
        upload.set("file", file);
        const response = await fetch("/api/dashboard/product-reviews", {
          method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: upload,
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Falha no envio da mídia.");
        mediaUrls.push(body.url);
      }
      if (mediaUrls.length > 4) throw new Error("Cada depoimento pode ter no máximo 4 fotos ou vídeos.");
      const form = new FormData();
      form.set("action", editingId ? "update" : "create");
      form.set("product_id", productId);
      if (editingId) form.set("review_id", editingId);
      form.set("reviewer_name", draft.reviewer_name);
      form.set("email", draft.email);
      form.set("rating", String(draft.rating));
      form.set("review_text", draft.review_text);
      form.set("review_date", new Date((draft.review_date || new Date().toISOString().slice(0, 10)) + "T12:00:00").toISOString());
      form.set("media_urls", JSON.stringify(mediaUrls));
      const response = await fetch("/api/dashboard/product-reviews", {
        method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: form,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível guardar o depoimento.");
      setNotice(editingId ? "Depoimento atualizado." : "Depoimento adicionado e aprovado.");
      setDraft(emptyDraft());
      setEditingId(null);
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível guardar o depoimento.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(reviewId: string, status: "approved" | "hidden" | "pending") {
    setError(""); setNotice("");
    try {
      const accessToken = await token();
      const response = await fetch("/api/dashboard/product-reviews", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, review_id: reviewId, status }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível alterar o estado.");
      setNotice("Estado do depoimento atualizado.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao alterar estado."); }
  }

  async function remove(reviewId: string) {
    if (!window.confirm("Excluir este depoimento permanentemente?")) return;
    try {
      const accessToken = await token();
      const response = await fetch("/api/dashboard/product-reviews", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, review_id: reviewId }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível excluir.");
      setNotice("Depoimento excluído.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao excluir."); }
  }

  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-semibold text-slate-900">Depoimentos / Avaliações</h2><p className="mt-1 text-sm text-slate-500">Depoimentos inseridos manualmente ficam aprovados por padrão e não são marcados como compra verificada.</p></div>
      <button type="button" onClick={() => { setEditingId(null); setDraft(emptyDraft()); setShowForm(v => !v); setError(""); }} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">+ Adicionar novo depoimento</button>
    </div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {showForm && <form onSubmit={save} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h3 className="font-semibold text-slate-900">{editingId ? "Editar depoimento" : "Novo depoimento"}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Nome do cliente<input required maxLength={120} value={draft.reviewer_name} onChange={e => setDraft(d => ({...d, reviewer_name:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
        <label className="text-sm font-medium text-slate-700">E-mail (opcional)<input type="email" value={draft.email} onChange={e => setDraft(d => ({...d, email:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
        <label className="text-sm font-medium text-slate-700">Nota<select value={draft.rating} onChange={e => setDraft(d => ({...d, rating:Number(e.target.value)}))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5">{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} {n===1?"estrela":"estrelas"}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Data da avaliação<input type="date" value={draft.review_date} onChange={e => setDraft(d => ({...d, review_date:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Texto da avaliação<textarea required minLength={3} maxLength={5000} rows={4} value={draft.review_text} onChange={e => setDraft(d => ({...d, review_text:e.target.value}))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Fotos ou vídeos (opcional; até 4 ficheiros de 4 MB cada)<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={e => setDraft(d => ({...d, files:Array.from(e.target.files || []).slice(0, Math.max(0,4-(editingId ? (reviews.find(r => r.id === editingId)?.media_urls?.length || 0) : 0)))}))} className="mt-1.5 block w-full text-sm" /><span className="mt-1 block text-xs text-slate-500">Os ficheiros selecionados serão adicionados aos que já existem.</span></label>
      </div>
      <div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => {setShowForm(false);setEditingId(null);setDraft(emptyDraft());}} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm">Cancelar</button><button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "A guardar..." : "Guardar depoimento"}</button></div>
    </form>}
    {loading ? <p className="py-8 text-center text-sm text-slate-500">A carregar depoimentos...</p> : reviews.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Ainda não existem depoimentos para este produto.</div> : <div className="space-y-3">{reviews.map(review => <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{review.reviewer_name || "Cliente"}</h3><span className="text-amber-600" aria-label={`${review.rating} de 5 estrelas`}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span><span className={`rounded-full px-2 py-1 text-xs font-medium ${review.status==="approved"?"bg-green-50 text-green-700":review.status==="pending"?"bg-amber-50 text-amber-700":"bg-slate-100 text-slate-600"}`}>{review.status==="approved"?"Aprovado":review.status==="pending"?"Pendente":"Oculto"}</span></div><p className="mt-1 text-xs text-slate-500">{review.email || "Sem e-mail"} · {review.review_date ? new Date(review.review_date).toLocaleDateString("pt-PT") : "Sem data"}</p><p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{review.review_text}</p>{review.media_urls?.length ? <div className="mt-3 flex flex-wrap gap-2">{review.media_urls.map(url => url.match(/\.(mp4|webm|mov)(\?|$)/i) ? <video key={url} src={url} controls className="max-h-40 rounded-lg" /> : <img key={url} src={url} alt="Mídia do depoimento" className="h-24 w-24 rounded-lg object-cover" />)}</div> : null}</div>
      <div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => beginEdit(review)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium">Editar</button><select aria-label="Estado do depoimento" value={review.status==="rejected"?"hidden":review.status} onChange={e => void changeStatus(review.id,e.target.value as "approved"|"hidden"|"pending")} className="rounded-lg border border-slate-300 px-2 py-2 text-xs"><option value="approved">Aprovado</option><option value="hidden">Oculto</option><option value="pending">Pendente</option></select><button type="button" onClick={() => void remove(review.id)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700">Excluir</button></div>
    </article>)}</div>}
  </section>;
}
