"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NewvelionBrand from "@/components/ui/NewvelionBrand";
import { supabase } from "@/lib/supabase";

export default function PlatformAffiliateInvitePage() {
  const router = useRouter();
  const [invite, setInvite] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "accepting" | "accepted" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const token = new URLSearchParams(window.location.search).get("invite") || "";
    setInvite(token);
    if (!token) {
      setStatus("ready");
      return () => { active = false; };
    }
    if (!/^[0-9a-f-]{36}$/i.test(token)) {
      setMessage("This invitation link is invalid.");
      setStatus("error");
      return () => { active = false; };
    }
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) {
        setStatus("ready");
        return;
      }
      setStatus("accepting");
      const { error } = await supabase.rpc("accept_platform_affiliate_invitation", { p_token: token });
      if (!active) return;
      if (error) {
        const reason = error.message || "";
        setMessage(reason.includes("INVITATION_EXPIRED") ? "This invitation has expired. Ask an affiliate, seller, or administrator for a new one."
          : reason.includes("INVITATION_ALREADY_USED") ? "This invitation has already been used."
          : reason.includes("SELF_INVITATION_NOT_ALLOWED") ? "You cannot accept an invitation you created."
          : reason.includes("INVITATION_NOT_FOUND") ? "This invitation is invalid or no longer available."
          : "We could not accept this invitation. Make sure you are signed in to the account you want to use.");
        setStatus("error");
        return;
      }
      setStatus("accepted");
      router.replace("/dashboard/affiliate");
      router.refresh();
    }
    void checkSession();
    return () => { active = false; };
  }, [router]);

  const loginHref = "/login?redirect=" + encodeURIComponent("/register/affiliate?invite=" + invite);
  const registerHref = "/register?affiliate_invite=" + encodeURIComponent(invite);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F8FC] px-5 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-[#DCE3EE] bg-white p-7 text-center shadow-sm sm:p-9">
        <div className="mb-7 flex justify-center border-b border-slate-100 pb-6"><NewvelionBrand size="md" /></div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0078E8]">Newvelion Partner Program</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#001B44]">Affiliate access is by invitation</h1>
        {status === "loading" || status === "accepting" ? <p className="mt-4 text-sm text-slate-600">{status === "accepting" ? "Accepting your invitation…" : "Checking your invitation…"}</p>
          : status === "accepted" ? <p className="mt-4 text-sm text-slate-600">Invitation accepted. Opening your dashboard…</p>
          : status === "error" ? <p role="alert" className="mt-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{message}</p>
          : invite ? <><p className="mt-4 text-sm leading-6 text-slate-600">You have an invitation to join Newvelion as a platform affiliate. Sign in to the account you want to use, or create an account first. After email verification, reopen this invitation link to accept it.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center"><Link href={loginHref} className="rounded-lg bg-[#003B95] px-5 py-3 font-semibold text-white hover:bg-[#002B70]">Sign in and accept</Link><Link href={registerHref} className="rounded-lg border border-slate-200 px-5 py-3 font-semibold text-[#003B95] hover:bg-slate-50">Create an account</Link></div></>
          : <><p className="mt-4 text-sm leading-6 text-slate-600">Platform affiliate accounts cannot be created publicly. Ask an existing Newvelion affiliate, seller, or administrator to send you a personal invitation link.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center"><Link href="/login" className="rounded-lg bg-[#003B95] px-5 py-3 font-semibold text-white hover:bg-[#002B70]">Sign in</Link><Link href="/" className="rounded-lg border border-slate-200 px-5 py-3 font-semibold text-[#003B95] hover:bg-slate-50">Back to Newvelion</Link></div></>}
      </section>
    </main>
  );
}
