"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TrackingScreen } from "@/components/ui-kit/newvelion-ui";

type TrackingOrder = {
  id?: string;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  updated_at: string | null;
};

const STATUS_STEPS = ["pending", "confirmed", "processing", "packed", "shipped", "in_transit", "delivered"];

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function TrackingPage() {
  const { token } = useParams();
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/tracking/" + encodeURIComponent(String(token)), { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Tracking information unavailable.");
        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        setOrder(payload?.order ?? null);
        setUnavailable(!payload?.order);
      })
      .catch(() => { if (active) setUnavailable(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const currentStep = useMemo(() => {
    if (!order) return -1;
    return STATUS_STEPS.indexOf(order.status);
  }, [order]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-5 py-16">
        <div className="mx-auto max-w-xl animate-pulse space-y-5">
          <div className="h-5 w-36 rounded bg-ink-100" />
          <div className="h-10 w-64 rounded bg-ink-100" />
          <div className="h-24 rounded-xl bg-ink-100" />
        </div>
      </main>
    );
  }

  if (unavailable || !order) {
    return (
      <main className="min-h-screen bg-white px-5 py-16">
        <div className="mx-auto max-w-xl rounded-xl border border-ink-200 p-7">
          <Link href="/marketplace" className="font-semibold text-brand-600">Newvelion</Link>
          <h1 className="mt-7 text-2xl font-semibold text-ink-900">Tracking information unavailable</h1>
          <p className="mt-2 text-sm text-ink-500">Check the tracking link or contact the seller for assistance.</p>
        </div>
      </main>
    );
  }

  const steps = STATUS_STEPS.map((status, index) => ({
    label: humanize(status),
    done: currentStep >= 0 ? index <= currentStep : status === order.status,
  }));

  return (
    <TrackingScreen
      shellNav={[
        { label: "Marketplace", href: "/marketplace" },
        { label: "Home", href: "/" },
      ]}
      shellRight={<Link href="/login" className="text-sm font-medium text-ink-700 hover:text-brand-600">Log in</Link>}
      reference={order.id ? "Order #" + order.id.slice(0, 8).toUpperCase() : "Delivery tracking"}
      headline={humanize(order.status)}
      steps={steps}
      events={[{
        when: order.updated_at ? new Date(order.updated_at).toLocaleString() : "Current status",
        text: "Order status: " + humanize(order.status),
      }]}
      trackingAction={order.tracking_url ? (
        <a href={order.tracking_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700">
          Open carrier tracking
        </a>
      ) : null}
    />
  );
}
