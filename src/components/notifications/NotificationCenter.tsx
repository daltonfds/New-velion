"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function relativeTime(value: string) {
  const seconds = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(value).getTime()) / 1000,
    ),
  );

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function detailLabel(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "—";
}

function NotificationDetails({ item }: { item: NotificationItem }) {
  const data = item.data || {};
  const isWithdrawal =
    item.type === "withdrawal_requested" ||
    item.type === "withdrawal_approved" ||
    item.type === "withdrawal_rejected";
  const isSale = ["sale_confirmed", "supplier_sale_confirmed", "admin_sale_confirmed"].includes(item.type);

  if (!isWithdrawal && !isSale) return null;

  const details = isWithdrawal
    ? [
        ["Requested amount", data.requested_amount ?? data.amount, data.wallet_currency],
        ["Net amount received", data.net_amount, data.wallet_currency],
        ["Wallet currency", data.wallet_currency],
        ["Payment currency", data.payout_currency],
        ["Exchange rate", data.exchange_rate],
        ["Converted amount", data.converted_amount, data.payout_currency],
        [
          "Sent to wallet",
          data.wallet_provider
            ? `${data.wallet_provider}${data.wallet_phone ? ` — ${data.wallet_phone}` : ""}`
            : null,
        ],
        ["Withdrawal ID", data.withdrawal_id],
        ["Date", data.processed_at],
      ]
    : [
        ["Product", data.product_name ?? data.product],
        ["Sale amount", data.amount],
        ["Commission", data.commission],
        ["Status", data.status ?? "Paid"],
        ["Sale ID", data.sale_id],
      ];

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#0A0440]">
        {isWithdrawal ? "Withdrawal details" : "Sale details"}
      </p>

      <div className="space-y-1.5">
        {details.map(([label, value, currency]) => (
          <div
            key={String(label)}
            className="flex items-start justify-between gap-3 text-[11px] leading-4"
          >
            <span className="text-slate-500">{String(label)}</span>
            <span className="max-w-[62%] break-words text-right font-medium text-slate-700">
              {detailLabel(value)}
              {currency && value !== null && value !== undefined
                ? ` ${detailLabel(currency)}`
                : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function base64ToUint8Array(value: string) {
  const padding = "=".repeat(
    (4 - (value.length % 4)) % 4,
  );

  const base64 = (value + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = window.atob(base64);

  return Uint8Array.from(
    Array.from(raw).map((char) =>
      char.charCodeAt(0),
    ),
  );
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushError, setPushError] = useState("");
  const router = useRouter();

  const unread = useMemo(
    () =>
      items.filter((notification) => !notification.read_at)
        .length,
    [items],
  );

  useEffect(() => {
    let channel:
      | ReturnType<typeof supabase.channel>
      | null = null;
    let refreshTimer: number | null = null;
    let focusHandler: (() => void) | null = null;

    let cancelled = false;

    async function start() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user || cancelled) return;

      const { data } = await supabase
        .from("notifications")
        .select(
          "id,type,title,message,data,read_at,created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!cancelled) {
        setItems((data || []) as NotificationItem[]);
      }

      const refreshNotifications = async () => {
        const { data: latest, error } = await supabase
          .from("notifications")
          .select("id,type,title,message,data,read_at,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30);
        if (!cancelled && !error) setItems((latest || []) as NotificationItem[]);
      };

      refreshTimer = window.setInterval(() => void refreshNotifications(), 30000);
      focusHandler = () => void refreshNotifications();
      window.addEventListener("focus", focusHandler);

      channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const notification =
              payload.new as NotificationItem;

            setItems((current) => [
              notification,
              ...current.filter(
                (item) => item.id !== notification.id,
              ),
            ]);
          },
        )
        .subscribe();

      if (
        "Notification" in window &&
        window.Notification.permission === "granted"
      ) {
        void enablePush();
      }
    }

    void start();

    return () => {
      cancelled = true;

      if (channel) {
        void supabase.removeChannel(channel);
      }
      if (refreshTimer !== null) window.clearInterval(refreshTimer);
      if (focusHandler) window.removeEventListener("focus", focusHandler);
    };
  }, []);

  async function enablePush() {
    setPushError("");
    try {
    console.log("[Newvelion Push] 1. Starting");

    const hasNotification = "Notification" in window;
    const hasServiceWorker = "serviceWorker" in navigator;
    const hasPushManager = "PushManager" in window;

    console.log("[Newvelion Push] 2. API availability:", {
      Notification: hasNotification,
      ServiceWorker: hasServiceWorker,
      PushManager: hasPushManager,
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      standalone:
        window.matchMedia?.("(display-mode: standalone)")?.matches ?? false,
    });

    if (!hasNotification || !hasServiceWorker || !hasPushManager) {
      console.error("[Newvelion Push] 2. Push APIs unavailable", {
        Notification: hasNotification,
        ServiceWorker: hasServiceWorker,
        PushManager: hasPushManager,
      });
      setPushError("External notifications are not supported by this browser. Try Chrome and allow notifications for this site.");
      return;
    }

    console.log("[Newvelion Push] 2. Push APIs available");

    const publicKey = "BDgJ5VnxCyPsp3ps1B_u5TM2ieZ3iMqf-VRppgZTUxW1w10s1tLEqvKyMLqoW94Hj0XNhexKL3voffy8D69Sgso";
    console.log("[Newvelion Push] 3. VAPID public key configured");

    let permission = window.Notification.permission;
    console.log(
      "[Newvelion Push] 4. Notification permission:",
      permission,
    );

    if (permission !== "granted") {
      permission = await window.Notification.requestPermission();
      console.log(
        "[Newvelion Push] 5. Permission result:",
        permission,
      );
    }

    if (permission !== "granted") {
      console.error(
        "[Newvelion Push] 6. Permission was not granted",
      );
      setPushError("Notification permission was not granted. Allow notifications in your browser settings and try again.");
      return;
    }

    console.log("[Newvelion Push] 6. Permission granted");

    const registration =
      await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    console.log(
      "[Newvelion Push] 7. Service worker registered:",
      registration.scope,
    );

    let subscription =
      await registration.pushManager.getSubscription();

    if (subscription) {
      console.log(
        "[Newvelion Push] 8. Existing push subscription found",
      );
    } else {
      console.log(
        "[Newvelion Push] 8. Creating new push subscription",
      );

      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            base64ToUint8Array(publicKey),
        });

      console.log(
        "[Newvelion Push] 9. New push subscription created",
      );
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      console.error(
        "[Newvelion Push] 10. No authenticated session",
      );
      return;
    }

    console.log(
      "[Newvelion Push] 10. Authenticated session exists",
    );

    const response = await fetch(
      "/api/notifications/push/subscribe",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(subscription.toJSON()),
      },
    );

    const responseText =
      await response.text().catch(() => "");

    console.log(
      "[Newvelion Push] 11. Subscribe API response:",
      response.status,
      responseText,
    );

    if (!response.ok) {
      console.error(
        "[Newvelion Push] 12. Failed to save subscription",
      );
      setPushEnabled(false);
      setPushError("Your device allowed notifications, but Newvelion could not save the subscription. Please retry.");
      return;
    }

    setPushEnabled(true);
    setPushError("");

    console.log(
      "[Newvelion Push] 12. Push subscription saved successfully",
    );
    } catch (error) {
      console.error("[Newvelion Push] Subscription setup failed:", error);
      setPushEnabled(false);
      setPushError(error instanceof Error ? error.message : "Could not activate external notifications. Please try again.");
    }
  }

  async function markRead(id: string) {
    await supabase
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
      })
      .eq("id", id);

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              read_at: new Date().toISOString(),
            }
          : item,
      ),
    );
  }

  async function markAllRead() {
    const ids = items
      .filter((item) => !item.read_at)
      .map((item) => item.id);

    if (!ids.length) return;

    const timestamp = new Date().toISOString();

    await supabase
      .from("notifications")
      .update({ read_at: timestamp })
      .in("id", ids);

    setItems((current) =>
      current.map((item) => ({
        ...item,
        read_at: item.read_at || timestamp,
      })),
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
      >
        <BellIcon />

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#10069F] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[80] w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#0A0440]">
                Notifications
              </p>
              <p className="text-xs text-slate-400">
                Sales and withdrawal updates
              </p>
            </div>

            {unread > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs font-semibold text-[#0A0440]"
              >
                Mark all read
              </button>
            )}
          </div>

          {!pushEnabled && (
            <button
              type="button"
              onClick={() => void enablePush()}
              className="m-3 w-[calc(100%-1.5rem)] rounded-lg border border-[#10069F]/40 bg-[#FCF8ED] px-3 py-2 text-left text-xs font-semibold text-[#705313]"
            >
              Enable external notifications on this device
            </button>
          )}

          <div className="max-h-[500px] overflow-y-auto">
            {pushError && (
              <p role="alert" className="mx-3 mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                {pushError}
              </p>
            )}

            {items.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No notifications yet.
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    void markRead(item.id);
                    const target = typeof item.data?.target_url === "string" ? item.data.target_url : "";
                    setOpen(false);
                    if (target.startsWith("/") && !target.startsWith("//")) router.push(target);
                  }}
                  className={`block w-full border-b border-slate-100 px-4 py-4 text-left ${
                    item.read_at
                      ? "bg-white"
                      : "bg-slate-50"
                  }`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        item.read_at
                          ? "bg-slate-200"
                          : "bg-[#10069F]"
                      }`}
                    />

                    <div>
                      <p className="text-sm font-semibold text-[#0A0440]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.message}
                      </p>

                      <NotificationDetails item={item} />

                      <p className="mt-2 text-[10px] text-slate-400">
                        {relativeTime(item.created_at)} ago
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
