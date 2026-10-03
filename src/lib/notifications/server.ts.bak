import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import * as webpush from "web-push";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function adminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server environment is not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function dispatchNotification(notificationId: string) {
  const supabase = adminClient();

  const { data: notification, error: notificationError } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", notificationId)
    .single();

  if (notificationError || !notification) {
    throw new Error(
      notificationError?.message || "Notification not found.",
    );
  }

  const [
    {
      data: { user },
    },
    { data: settings },
    { data: subscriptions },
  ] = await Promise.all([
    supabase.auth.admin.getUserById(notification.user_id),
    supabase
      .from("account_settings")
      .select("email_notifications,sales_notifications")
      .eq("user_id", notification.user_id)
      .maybeSingle(),
    supabase
      .from("push_subscriptions")
      .select("id,endpoint,p256dh,auth")
      .eq("user_id", notification.user_id),
  ]);

  const emailEnabled = settings?.email_notifications !== false;
  const salesEnabled = settings?.sales_notifications !== false;

  const isSale = notification.type === "sale_confirmed";

  const results = {
    email: "skipped" as "sent" | "failed" | "skipped",
    push: "skipped" as "sent" | "failed" | "skipped",
  };

  /*
   * EMAIL
   */
  if (emailEnabled && (!isSale || salesEnabled) && user?.email) {
    const resendKey = process.env.RESEND_API_KEY;
    const from =
      process.env.RESEND_FROM_EMAIL ||
      "Newvelion <contact@newvelion.com>";

    const { data: delivery } = await supabase
      .from("notification_deliveries")
      .upsert(
        {
          notification_id: notification.id,
          channel: "email",
          status: "pending",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "notification_id,channel",
          ignoreDuplicates: false,
        },
      )
      .select()
      .single();

    if (resendKey && delivery?.status !== "sent") {
      try {
        const resend = new Resend(resendKey);

        const sendResult = await resend.emails.send(
          {
            from,
            to: [user.email],
            subject: notification.title,
            html: `
              <!doctype html>
              <html lang="en">
                <body style="margin:0;background:#f7f8fb;font-family:Arial,Helvetica,sans-serif;color:#16294F">
                  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
                    <div style="background:#ffffff;border:1px solid #e2e8f0;padding:32px">
                      <div style="font-size:22px;font-weight:700;color:#16294F">
                        Newvelion
                      </div>

                      <div style="margin-top:6px;font-size:12px;color:#8A8570;letter-spacing:1px">
                        COMMERCE INFRASTRUCTURE
                      </div>

                      <div style="margin-top:32px">
                        <h1 style="margin:0;font-size:24px;color:#16294F">
                          ${escapeHtml(notification.title)}
                        </h1>

                        <p style="margin-top:16px;font-size:15px;line-height:1.7;color:#475569">
                          ${escapeHtml(notification.message)}
                        </p>
                      </div>

                      <div style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:20px;font-size:12px;color:#94a3b8">
                        Newvelion · Commerce infrastructure
                      </div>
                    </div>
                  </div>
                </body>
              </html>
            `,
          },
          {
            idempotencyKey: `newvelion/${notification.event_key}/email`,
          },
        );

        if (sendResult.error) {
          throw new Error(sendResult.error.message);
        }

        await supabase
          .from("notification_deliveries")
          .update({
            status: "sent",
            provider_id: sendResult.data?.id ?? null,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_error: null,
          })
          .eq("notification_id", notification.id)
          .eq("channel", "email");

        results.email = "sent";
      } catch (error) {
        await supabase
          .from("notification_deliveries")
          .update({
            status: "failed",
            last_error:
              error instanceof Error
                ? error.message
                : "Email delivery failed.",
            updated_at: new Date().toISOString(),
          })
          .eq("notification_id", notification.id)
          .eq("channel", "email");

        results.email = "failed";
        console.error("Notification email failed:", error);
      }
    }
  }

  /*
   * WEB PUSH
   */
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject =
    process.env.VAPID_SUBJECT || "mailto:contact@newvelion.com";

  if (
    subscriptions?.length &&
    vapidPublic &&
    vapidPrivate &&
    (!isSale || salesEnabled)
  ) {
    try {
      webpush.setVapidDetails(
        vapidSubject,
        vapidPublic,
        vapidPrivate,
      );

      let delivered = false;

      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify({
              title: notification.title,
              body: notification.message,
              url: "/dashboard/seller",
              notificationId: notification.id,
            }),
            {
              TTL: 60 * 60,
              urgency: "high",
            },
          );

          delivered = true;
        } catch (error: any) {
          const statusCode = error?.statusCode;

          if (statusCode === 404 || statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", subscription.id);
          } else {
            console.error(
              "Push notification failed:",
              error,
            );
          }
        }
      }

      if (delivered) {
        await supabase
          .from("notification_deliveries")
          .upsert(
            {
              notification_id: notification.id,
              channel: "push",
              status: "sent",
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_error: null,
            },
            {
              onConflict: "notification_id,channel",
            },
          );

        results.push = "sent";
      }
    } catch (error) {
      console.error("Push notification system failed:", error);
      results.push = "failed";
    }
  }

  return results;
}
