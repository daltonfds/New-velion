"use client";

import { useEffect, useState } from "react";
import { Building2, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SupplierCompanyCompletionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [incomplete, setIncomplete] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setChecking(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role,primary_company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      setIncomplete(
        ["supplier", "producer", "producer_supplier"].includes(
          profile?.role,
        ) && !profile?.primary_company_id,
      );

      setChecking(false);
    }

    check();

    window.addEventListener("profile-updated", check);

    return () => {
      mounted = false;
      window.removeEventListener("profile-updated", check);
    };
  }, [pathname]);

  if (
    checking ||
    !incomplete ||
    dismissed ||
    pathname === "/dashboard/supplier/profile"
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1769e0]/10">
          <Building2 className="h-8 w-8 text-[#1769e0]" />
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Complete your company profile
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Add your business information to unlock supplier features.
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          You can continue using the platform and complete your company profile
          later.
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/supplier/profile")}
          className="mt-6 w-full rounded-2xl bg-[#1769e0] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#125bc4]"
        >
          Complete company profile
        </button>
      </div>
    </div>
  );
}
