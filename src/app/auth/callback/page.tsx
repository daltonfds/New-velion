"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    let active = true;
    async function complete() {
      const params = new URLSearchParams(window.location.search);
      const requestedNext = params.get("next") || "/account";
      const nextPath = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/account";
      const code = params.get("code");
      const authError = params.get("error_description") || params.get("error");
      if (authError) {
        if (active) {
          setMessage(authError);
          window.setTimeout(() => router.replace("/register/customer?next=" + encodeURIComponent(nextPath)), 1800);
        }
        return;
      }
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (active) setMessage(error.message);
          return;
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (active) setMessage("Unable to complete sign-in. Please try again.");
        return;
      }
      const provider = String(session.user.app_metadata?.provider || "");
      const { data: existingProfile } = await supabase.from("profiles").select("role,full_name,phone_number,country_code").eq("id", session.user.id).maybeSingle();
      if (provider === "google" && params.get("intent") !== "customer" && ["seller", "supplier"].includes(String(existingProfile?.role || ""))) {
        await supabase.auth.signOut();
        if (active) setMessage("Google sign-in is not available for seller or supplier / producer accounts. Please sign in with email and password.");
        return;
      }
      if (params.get("intent") === "affiliate") {
        const response = await fetch("/api/auth/affiliate-oauth", {
          method: "POST",
          headers: { Authorization: "Bearer " + session.access_token },
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          if (active) setMessage(body.error || "Unable to finish setting up your affiliate account.");
          return;
        }
      }
      if (params.get("intent") === "customer") {
        const response = await fetch("/api/auth/customer-oauth", {
          method: "POST",
          headers: { Authorization: "Bearer " + session.access_token },
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          if (active) setMessage(body.error || "Unable to finish setting up your buyer account.");
          return;
        }
        const { data: customerRoleProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
        if (customerRoleProfile?.role !== "customer") {
          await supabase.auth.signOut();
          if (active) setMessage("Google sign-in is available only for buyer accounts. Please use the sign-in method assigned to your account.");
          return;
        }
      }
      if (params.get("intent") === "customer") {
        const { data: completedProfile } = await supabase.from("profiles").select("full_name,phone_number,country_code").eq("id", session.user.id).maybeSingle();
        if (!String(completedProfile?.full_name || "").trim() || !String(completedProfile?.phone_number || "").trim() || !String(completedProfile?.country_code || "").trim()) {
          if (active) router.replace("/auth/complete-profile?next=" + encodeURIComponent(nextPath));
          return;
        }
      }
      if (active) router.replace(nextPath);
    }
    void complete();
    return () => { active = false; };
  }, [router]);

  return <main className="flex min-h-screen items-center justify-center bg-[#f6f9fc] px-5"><div className="w-full max-w-md rounded-xl border border-[#dde5ef] bg-white p-8 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#003B95]" /><p role="status" className="mt-5 text-sm font-semibold text-[#003B95]">{message}</p></div></main>;
}
