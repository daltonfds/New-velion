"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Consent = { necessary: true; analytics: boolean; savedAt: string };
const CONSENT_KEY = "newvelion-cookie-consent-v1";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) setVisible(true);
      else {
        const parsed = JSON.parse(stored) as Partial<Consent>;
        setAnalytics(parsed.analytics === true);
      }
    } catch {
      setVisible(true);
    }

    const openPreferences = () => {
      setPreferencesOpen(true);
      setVisible(true);
    };
    window.addEventListener("newvelion:open-cookie-settings", openPreferences);
    return () => window.removeEventListener("newvelion:open-cookie-settings", openPreferences);
  }, []);

  function saveConsent(allowAnalytics: boolean) {
    const consent: Consent = {
      necessary: true,
      analytics: allowAnalytics,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch {
      // The banner still closes if browser storage is disabled.
    }
    setAnalytics(allowAnalytics);
    setVisible(false);
    setPreferencesOpen(false);
  }

  if (!visible) return null;

  return (
    <section
      aria-label="Cookie preferences"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[120] border-t border-slate-200 bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.12)]"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-base font-bold text-[#001B44]">Your privacy matters</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Newvelion uses essential storage for security and core features. With your permission, optional analytics may help us understand platform usage. You can reject optional cookies or change your choice later.
          </p>
          <div className="mt-2 flex flex-wrap gap-4 text-sm font-semibold text-[#003B95]">
            <Link href="/cookies" className="underline underline-offset-2">Cookie Policy</Link>
            <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>
          </div>
          {preferencesOpen && (
            <label className="mt-4 flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[#006CE5]"
              />
              <span>
                <span className="block font-semibold">Optional analytics</span>
                <span className="mt-1 block text-slate-500">Allow analytics technologies only where they are implemented and subject to this preference. Essential storage remains active.</span>
              </span>
            </label>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {preferencesOpen ? (
            <button type="button" onClick={() => saveConsent(analytics)} className="rounded-lg bg-[#003B95] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#001B44]">
              Save preferences
            </button>
          ) : (
            <button type="button" onClick={() => setPreferencesOpen(true)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Manage
            </button>
          )}
          <button type="button" onClick={() => saveConsent(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Reject optional
          </button>
          <button type="button" onClick={() => saveConsent(true)} className="rounded-lg bg-[#006CE5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#003B95]">
            Accept all
          </button>
        </div>
      </div>
    </section>
  );
}
