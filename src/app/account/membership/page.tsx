"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CustomerNav from "@/components/customer/CustomerNav";
import { supabase } from "@/lib/supabase";

type Plan = { code: string; name: string; amount: number; paymentUrl: string | null };
type Membership = { id: string; plan_code: string; amount_zar: number; status: string; payment_url: string | null; payment_reference: string | null; customer_note: string | null; created_at: string; starts_at: string | null; expires_at: string | null };
const benefits = ["Member-only product discounts", "Free delivery on eligible orders", "Exclusive promotions and offers"];
const money = (amount: number) => new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(amount);
const statusLabel: Record<string,string> = { pending_payment: "Awaiting payment", pending_review: "Payment confirmation submitted", active: "Active", rejected: "Rejected", expired: "Expired", cancelled: "Cancelled" };

export default function MembershipPage() {
  const [name, setName] = useState<string>("Customer");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Please sign in to manage your membership.");
    return session.access_token;
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: profile } = await supabase.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle();
      if (profile?.role !== "customer") { window.location.href = "/dashboard"; return; }
      setName(profile.full_name || "Customer");
      const response = await fetch("/api/customer/membership", { headers: { Authorization: `Bearer ${await token()}` }, cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to load membership.");
      setPlans(json.plans || []); setMemberships(json.memberships || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load membership."); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  async function requestPlan(plan: Plan) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/customer/membership", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` }, body: JSON.stringify({ action: "request", plan_code: plan.code }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to start membership.");
      await load();
      window.open(json.membership.payment_url, "_blank", "noopener,noreferrer");
      setMessage("Your request is ready. Complete payment in the new tab, then confirm it below.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to start membership."); }
    finally { setBusy(false); }
  }

  async function confirmPaid(item: Membership) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/customer/membership", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` }, body: JSON.stringify({ action: "paid", membership_id: item.id, payment_reference: reference, customer_note: note }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to submit payment confirmation.");
      setReference(""); setNote(""); setMessage("Payment confirmation submitted. Benefits start only after the Newvelion team verifies payment and approves your membership.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to submit confirmation."); }
    finally { setBusy(false); }
  }

  const openRequest = memberships.find(m => ["pending_payment","pending_review"].includes(m.status));
  const active = memberships.find(m => m.status === "active" && (!m.expires_at || new Date(m.expires_at) > new Date()));

  if (loading) return <main className="grid min-h-screen place-items-center text-sm text-slate-500">Loading membership…</main>;

  return <main className="min-h-screen bg-[#F5F8FC] text-[#001B44]">
    <CustomerNav name={name}/>
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
      <Link href="/account" className="text-sm font-semibold text-[#0078E8]">← My account</Link>
      <section className="mt-5 rounded-3xl bg-[#003B95] p-7 text-white sm:p-10">
        <p className="text-sm font-bold text-blue-100">NEWVELION CLUB</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">More value in every order.</h1>
        <p className="mt-3 max-w-2xl text-blue-100">Join for member discounts, free delivery on eligible orders and exclusive promotions. Membership is paid quarterly and activated after payment verification.</p>
        <div className="mt-5 flex flex-wrap gap-3">{benefits.map(b => <span key={b} className="rounded-full border border-white/30 px-3 py-2 text-sm">{b}</span>)}</div>
      </section>
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">{message}</p>}
      {active && <section className="mt-6 rounded-2xl border border-emerald-200 bg-white p-6"><p className="font-bold text-emerald-700">Your membership is active</p><h2 className="mt-1 text-2xl font-extrabold">{active.plan_code.replace("club_","Club ")}</h2><p className="mt-2 text-sm text-slate-600">Valid until {active.expires_at ? new Date(active.expires_at).toLocaleDateString("en-ZA") : "further notice"}.</p></section>}
      <div className="mt-7 grid gap-5 md:grid-cols-3">
        {plans.map((plan,i) => <article key={plan.code} className={"flex flex-col rounded-2xl border bg-white p-6 shadow-sm "+(i===1?"border-[#0078E8] ring-1 ring-[#0078E8]":"border-slate-200")}>
          <p className="text-sm font-bold text-[#0078E8]">{plan.name}</p><h2 className="mt-2 text-3xl font-extrabold">{money(plan.amount)}<span className="text-sm font-medium text-slate-500"> / 3 months</span></h2>
          <ul className="mt-5 flex-1 space-y-3 text-sm text-slate-600">{benefits.map(b=><li key={b} className="flex gap-2"><span className="font-bold text-emerald-600">✓</span>{b}</li>)}</ul>
          {!plan.paymentUrl && <p className="mt-5 text-xs text-amber-700">Payment link is being configured.</p>}
          <button disabled={busy || !plan.paymentUrl || Boolean(openRequest) || Boolean(active)} onClick={()=>void requestPlan(plan)} className="mt-6 rounded-xl bg-[#003B95] px-4 py-3 text-sm font-bold text-white hover:bg-[#0078E8] disabled:cursor-not-allowed disabled:opacity-50">{active?"Membership active":openRequest?"Request already in progress":"Choose plan & pay"}</button>
        </article>)}
      </div>
      {openRequest && <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your current request</p><h2 className="mt-1 text-xl font-extrabold">{money(Number(openRequest.amount_zar))} · Quarterly</h2></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{statusLabel[openRequest.status] || openRequest.status}</span></div>
        {openRequest.status==="pending_payment" && <div className="mt-5"><p className="text-sm text-slate-600">Complete payment using the link for your request. Once paid, submit the payment reference below.</p>{openRequest.payment_url && <a href={openRequest.payment_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-xl border border-[#0078E8] px-4 py-2 text-sm font-bold text-[#0078E8]">Open payment link ↗</a>}<label className="mt-4 block text-sm font-semibold">Payment reference (optional)<input value={reference} onChange={e=>setReference(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" placeholder="Reference or transaction ID"/></label><label className="mt-3 block text-sm font-semibold">Note for the team (optional)<textarea value={note} onChange={e=>setNote(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" rows={2} placeholder="Any payment details"/></label><button disabled={busy} onClick={()=>void confirmPaid(openRequest)} className="mt-4 rounded-xl bg-[#0078E8] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">I have paid — submit for review</button></div>}
        {openRequest.status==="pending_review" && <p className="mt-4 text-sm text-slate-600">Your payment confirmation is awaiting manual verification. Your benefits are not active yet.</p>}
      </section>}
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-extrabold">Membership history</h2>{memberships.length===0?<p className="mt-3 text-sm text-slate-500">No membership requests yet.</p>:<div className="mt-4 divide-y divide-slate-100">{memberships.map(m=><div key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><p className="font-bold">{money(Number(m.amount_zar))} · {m.plan_code.replace("club_","Club ")}</p><p className="mt-1 text-slate-500">{new Date(m.created_at).toLocaleDateString("en-ZA")}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{statusLabel[m.status]||m.status}</span></div>)}</div>}</section>
    </div>
  </main>;
}
