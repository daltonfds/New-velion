"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function AffiliateRedirectPage() {
  const params = useParams<{ link: string }>();

  useEffect(() => {
    const referralCode = params?.link;

    if (!referralCode) return;

    const apiUrl = process.env.NEXT_PUBLIC_NEWVELION_API_URL;

    if (!apiUrl) {
      console.error("NEXT_PUBLIC_NEWVELION_API_URL is not configured.");
      return;
    }

    window.location.replace(
      `${apiUrl.replace(/\/$/, "")}/go/${encodeURIComponent(referralCode)}`
    );
  }, [params]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-gray-900">
          Opening product...
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Please wait while we prepare your product page.
        </p>
      </div>
    </main>
  );
}
