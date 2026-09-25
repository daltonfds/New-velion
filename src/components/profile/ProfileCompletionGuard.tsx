"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircle2, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Profile = {
  full_name: string | null;
  country_code: string | null;
  country_calling_code: string | null;
  phone_number: string | null;
  phone_e164: string | null;
  preferred_language: string | null;
};

function isProfileComplete(profile: Profile | null) {
  if (!profile) return false;

  return Boolean(
    profile.full_name?.trim() &&
      profile.country_code?.trim() &&
      profile.country_calling_code?.trim() &&
      profile.phone_number?.trim() &&
      profile.phone_e164?.trim() &&
      profile.preferred_language?.trim()
  );
}

export default function ProfileCompletionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [incomplete, setIncomplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setChecking(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "full_name,country_code,country_calling_code,phone_number,phone_e164,preferred_language"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      setIncomplete(!isProfileComplete(profile));
      setChecking(false);
    }

    checkProfile();

    const handleProfileUpdated = () => {
      setChecking(true);
      checkProfile();
    };

    window.addEventListener("profile-updated", handleProfileUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, [pathname]);

  if (checking || !incomplete || pathname === "/dashboard/profile") {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-completion-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1769e0]/10">
          <UserRound className="h-8 w-8 text-[#1769e0]" />
        </div>

        <div className="mt-6 text-center">
          <h2
            id="profile-completion-title"
            className="text-2xl font-bold tracking-tight text-slate-950"
          >
            Complete your profile
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your profile is incomplete. Please complete your information
            before continuing to use NewVelion.
          </p>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-[#1769e0]" />
            Full name
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-[#1769e0]" />
            Country
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-[#1769e0]" />
            Phone number
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-[#1769e0]" />
            Preferred language
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/seller/settings")}
          className="mt-6 w-full rounded-2xl bg-[#1769e0] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#125bc4]"
        >
          Complete profile
        </button>

        <p className="mt-4 text-center text-xs text-slate-400">
          This message will remain until your profile is completed and verified.
        </p>
      </div>
    </div>
  );
}
