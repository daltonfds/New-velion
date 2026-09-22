"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function resolveDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.replace("/login?redirect=/dashboard");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      const role = String(profile?.role || "").toLowerCase();

      if (role === "admin") {
        router.replace("/dashboard/admin");
        return;
      }

      if (role === "supplier") {
        router.replace("/dashboard/supplier");
        return;
      }

      router.replace("/dashboard/seller");
    }

    resolveDashboard();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading your dashboard...
        </p>
      </div>
    </main>
  );
}
