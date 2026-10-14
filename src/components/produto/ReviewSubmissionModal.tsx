"use client";

import { useRef, useState } from "react";

type Props = { productId: string };

const steps = ["Rating", "Media", "Review", "About you"];

export default function ReviewSubmissionModal({ productId }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function close() {
    if (busy) return;
    setOpen(false);
    setMessage("");
  }

  function chooseFiles(nextFiles: File[], kind: "photo" | "video") {
    const validTypes = kind === "photo"
      ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
      : ["video/mp4", "video/webm", "video/quicktime"];
    const maxSize = kind === "photo" ? 5 * 1024 * 1024 : 25 * 1024 * 1024;
    if (nextFiles.some((file) => !validTypes.includes(file.type) || file.size <= 0 || file.size > maxSize)) {
      setMessage(kind === "photo" ? "Use JPG, PNG, WEBP or GIF images up to 5 MB each." : "Use MP4, WEBM or MOV videos up to 25 MB.");
      return;
    }
    setFiles((current) => {
      const merged = [...current, ...nextFiles];
      if (merged.length > 4) {
        setMessage("You can attach up to 4 photos or videos.");
        return current;
      }
      setMessage("");
      return merged;
    });
  }

  async function submit() {
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("product_id", productId);
      form.append("rating", String(rating));
      form.append("review_text", reviewText.trim());
      form.append("first_name", firstName.trim());
      form.append("last_name", lastName.trim());
      form.append("email", email.trim());
      files.forEach((file) => form.append("files", file));
      const response = await fetch("/api/public/product-reviews", { method: "POST", body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not submit your review.");
      setMessage("Thank you! Your review was sent and is awaiting moderation.");
      setReviewText("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setFiles([]);
      setRating(0);
      window.setTimeout(() => { setOpen(false); setMessage(""); }, 2200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => { setOpen(true); setStep(1); setMessage(""); }} className="mt-4 rounded-xl bg-[#0078E8] px-5 py-3 text-sm font-bold text-white hover:bg-[#006CE5]">
        Write a review
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="review-modal-title" className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Step {step} of 4</p><p className="mt-1 text-xs text-slate-400">{steps[step - 1]}</p></div>
              <button type="button" onClick={close} disabled={busy} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Close</button>
            </div>

            {step === 1 && <div className="py-7 text-center">
              <h3 id="review-modal-title" className="text-2xl font-bold text-slate-950">How would you rate this item?</h3>
              <div className="mt-7 flex justify-center gap-2" role="radiogroup" aria-label="Rating">
                {[1,2,3,4,5].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} onClick={() => setRating(value)} className={`rounded-lg p-1 text-4xl transition ${value <= rating ? "text-[#FFB800]" : "text-slate-300"}`} aria-label={`${value} star`}>★</button>)}
              </div>
              <div className="mt-2 flex justify-between text-sm text-slate-500"><span>Dislike it</span><span>Love it!</span></div>
              <button type="button" disabled={!rating} onClick={() => setStep(2)} className="mt-8 w-full rounded-xl bg-[#0078E8] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>}

            {step === 2 && <div className="py-7">
              <div className="flex items-start justify-between gap-4"><div><h3 id="review-modal-title" className="text-2xl font-bold text-slate-950">Show it off</h3><p className="mt-2 text-sm text-slate-600">We'd love to see it in action!</p></div><button type="button" onClick={() => setStep(3)} className="text-sm font-semibold text-slate-500 underline">Skip</button></div>
              <p className="mt-5 rounded-xl bg-[#F7FAFF] p-4 text-center text-sm font-bold text-[#003B95]">Get 15% off your next purchase</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => { if (inputRef.current) { inputRef.current.accept = "image/jpeg,image/png,image/webp,image/gif"; inputRef.current.click(); } }} className="rounded-xl border border-slate-200 px-4 py-4 text-sm font-bold hover:bg-slate-50">Add photos</button>
                <button type="button" onClick={() => { if (inputRef.current) { inputRef.current.accept = "video/mp4,video/webm,video/quicktime"; inputRef.current.click(); } }} className="rounded-xl border border-slate-200 px-4 py-4 text-sm font-bold hover:bg-slate-50">Add video</button>
              </div>
              <input ref={inputRef} type="file" multiple className="hidden" onChange={(event) => { const selected = Array.from(event.target.files || []); const kind = selected.some((file) => file.type.startsWith("video/")) ? "video" : "photo"; chooseFiles(selected, kind); event.target.value = ""; }} />
              {files.length > 0 && <div className="mt-4 space-y-2">{files.map((file, index) => <div key={file.name + file.lastModified} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"><span className="truncate">{file.name}</span><button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} className="ml-3 font-bold text-red-600">Remove</button></div>)}</div>}
              {message && <p role="status" className="mt-3 text-sm text-red-600">{message}</p>}
              <button type="button" onClick={() => { setMessage(""); setStep(3); }} className="mt-6 w-full rounded-xl bg-[#0078E8] px-5 py-3 font-bold text-white">Next</button>
            </div>}

            {step === 3 && <div className="py-7">
              <h3 id="review-modal-title" className="text-2xl font-bold text-slate-950">Tell us more!</h3>
              <p className="mt-2 text-sm text-slate-500">Your feedback helps other customers make informed choices.</p>
              <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} minLength={5} maxLength={5000} rows={6} placeholder="Share your experience" className="mt-5 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-[#0078E8]" />
              <p className="mt-1 text-right text-xs text-slate-400">{reviewText.length}/5000</p>
              <button type="button" disabled={reviewText.trim().length < 5} onClick={() => setStep(4)} className="mt-5 w-full rounded-xl bg-[#0078E8] px-5 py-3 font-bold text-white disabled:opacity-40">Next</button>
            </div>}

            {step === 4 && <div className="py-7">
              <h3 id="review-modal-title" className="text-2xl font-bold text-slate-950">About you</h3>
              <p className="mt-2 text-sm text-slate-500">No account needed to leave a review.</p>
              <div className="mt-5 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">First name *<input required autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} maxLength={80} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-[#0078E8]" /></label>
                <label className="block text-sm font-semibold text-slate-700">Last name<input autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} maxLength={80} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-[#0078E8]" /></label>
                <label className="block text-sm font-semibold text-slate-700">Email *<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-[#0078E8]" /></label>
              </div>
              <p className="mt-5 text-xs leading-5 text-slate-500">By submitting, I acknowledge the <a href="/terms" target="_blank" rel="noreferrer" className="underline">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noreferrer" className="underline">Privacy Policy</a> and that my review will be publicly posted and shared online.</p>
              {message && <p role="status" className={`mt-3 text-sm ${message.startsWith("Thank") ? "text-emerald-700" : "text-red-600"}`}>{message}</p>}
              <button type="button" disabled={busy || !firstName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || reviewText.trim().length < 5} onClick={submit} className="mt-6 w-full rounded-xl bg-[#0078E8] px-5 py-3 font-bold text-white disabled:opacity-40">{busy ? "Submitting..." : "Done / SUBMIT REVIEW"}</button>
            </div>}
          </section>
        </div>
      )}
    </>
  );
}
