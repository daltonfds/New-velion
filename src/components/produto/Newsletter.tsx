"use client";

import { FormEvent, useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) return;

    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16294F]">
            Stay connected
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Get updates from Newvelion
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Receive new product updates, marketplace news and selected offers
            from Newvelion.
          </p>

          {submitted ? (
            <div className="mx-auto mt-7 max-w-md border border-emerald-200 bg-white px-5 py-4 text-sm font-semibold text-emerald-700">
              Thank you. You are on the list.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#16294F]"
              />

              <button
                type="submit"
                className="rounded-lg bg-[#16294F] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0e1d38]"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="mt-4 text-[11px] text-slate-400">
            You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
