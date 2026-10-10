"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let resolved = false;

    async function routeUser(userId: string) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (!active || resolved) return;
      resolved = true;
      if (error) {
        router.replace("/dashboard/seller");
        return;
      }

      if (profile?.role === "platform_affiliate") router.replace("/dashboard/affiliate");
      else if (profile?.role === "supplier") router.replace("/dashboard/supplier");
      else if (profile?.role === "admin") router.replace("/dashboard/admin");
      else if (profile?.role === "customer") router.replace("/account");
      else router.replace("/dashboard/seller");
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && !resolved) {
        // Defer database access until after the auth callback has returned.
        window.setTimeout(() => { if (active && !resolved) void routeUser(session.user.id); }, 0);
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && active && !resolved) void routeUser(session.user.id);
      else if (!session && active) {
        // The auth listener handles the initial null session; avoid a premature redirect during restoration.
        window.setTimeout(() => {
          void supabase.auth.getSession().then(({ data: { session: restored } }) => {
            if (active && !resolved && restored?.user) void routeUser(restored.user.id);
            else if (active && !resolved) {
              resolved = true;
              router.replace("/login?next=%2Fdashboard");
            }
          });
        }, 400);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#DCE3EE] border-t-[#0078E8]" />
        Loading your Newvelion workspace…
      </div>
    </main>
  );
}
