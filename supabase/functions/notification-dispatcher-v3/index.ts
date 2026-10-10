import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres";
import webpush from "npm:web-push";

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { max: 1, prepare: false });
const resend = Deno.env.get("RESEND_API_KEY");

async function authorized(req: Request) {
  const token = req.headers.get("x-newvelion-dispatch") || "";
  if (!token) return false;
  const r = await sql.unsafe("select decrypted_secret from vault.decrypted_secrets where name='newvelion_notification_dispatch' limit 1");
  return r[0]?.decrypted_secret === token;
}

const esc = (v: unknown) =>
  String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function money(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";
}

async function sendEmail(n: any, to: string) {
  if (!resend) throw Error("RESEND_API_KEY is not configured.");

  const data = n.data || {};
  const isSale = n.type === "sale_confirmed";
  const isWithdrawal = n.type === "withdrawal_approved" || n.type === "withdrawal_rejected" || n.type === "withdrawal_paid";
  const product = data.product_name || data.product || "—";
  const amount = data.amount;
  const commission = data.commission;
  const status = isSale ? "Paid" : n.type === "withdrawal_approved" ? "Approved" : n.type === "withdrawal_rejected" ? "Rejected" : n.type === "withdrawal_paid" ? "Paid" : "—";
  const saleId = data.sale_id || "—";
  const requestedAmount = data.amount;
  const netAmount = data.net_amount;
  const walletCurrency = data.wallet_currency || "—";
  const payoutCurrency = data.payout_currency || "—";
  const exchangeRate = data.exchange_rate;
  const convertedAmount = data.converted_amount;
  const withdrawalId = data.withdrawal_id || "—";
  const withdrawalDate = n.created_at || "—";

  const details = isSale
    ? `
      <div style="margin:28px 0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="padding:14px 18px;background:#f8fafc;font-weight:700;color:#16294F">Sale details</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Product</td><td style="padding:13px 18px;color:#16294F;font-weight:600;text-align:right;border-top:1px solid #e5e7eb">${esc(product)}</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Sale amount</td><td style="padding:13px 18px;color:#16294F;font-weight:600;text-align:right;border-top:1px solid #e5e7eb">${money(amount)}</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Commission</td><td style="padding:13px 18px;color:#16294F;font-weight:600;text-align:right;border-top:1px solid #e5e7eb">${money(commission)}</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Status</td><td style="padding:13px 18px;color:#16803c;font-weight:700;text-align:right;border-top:1px solid #e5e7eb">${status}</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Sale ID</td><td style="padding:13px 18px;color:#16294F;font-family:monospace;font-size:12px;text-align:right;border-top:1px solid #e5e7eb">${esc(saleId)}</td></tr>
        </table>
      </div>`
    : isWithdrawal
    ? `
      <div style="margin:28px 0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="padding:14px 18px;background:#f8fafc;font-weight:700;color:#16294F">Withdrawal details</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Requested amount</td><td style="padding:13px 18px;color:#16294F;font-weight:600;text-align:right;border-top:1px solid #e5e7eb">${money(requestedAmount)} ${esc(walletCurrency)}</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Net amount received</td><td style="padding:13px 18px;color:#16294F;font-weight:700;text-align:right;border-top:1px solid #e5e7eb">${money(netAmount)} ${esc(walletCurrency)}</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Wallet currency</td><td style="padding:13px 18px;color:#16294F;font-weight:600;text-align:right;border-top:1px solid #e5e7eb">${esc(walletCurrency)}</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Payment currency</td><td style="padding:13px 18px;color:#16294F;font-weight:600;text-align:right;border-top:1px solid #e5e7eb">${esc(payoutCurrency)}</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Exchange rate</td><td style="padding:13px 18px;color:#16294F;font-weight:600;text-align:right;border-top:1px solid #e5e7eb">${esc(exchangeRate)}</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Converted amount</td><td style="padding:13px 18px;color:#16294F;font-weight:600;text-align:right;border-top:1px solid #e5e7eb">${money(convertedAmount)} ${esc(payoutCurrency)}</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Sent to wallet</td><td style="padding:13px 18px;color:#16294F;font-weight:600;text-align:right;border-top:1px solid #e5e7eb">M-Pesa</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Withdrawal ID</td><td style="padding:13px 18px;color:#16294F;font-family:monospace;font-size:12px;text-align:right;border-top:1px solid #e5e7eb">${esc(withdrawalId)}</td></tr>
          <tr><td style="padding:13px 18px;color:#64748b;border-top:1px solid #e5e7eb">Date</td><td style="padding:13px 18px;color:#16294F;font-weight:600;text-align:right;border-top:1px solid #e5e7eb">${esc(withdrawalDate)}</td></tr>
        </table>
      </div>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#16294F">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px">
      <div style="font-size:22px;font-weight:800;color:#16294F">Newvelion</div>
      <div style="font-size:11px;color:#8A8570;letter-spacing:1.5px;margin-top:3px">COMMERCE INFRASTRUCTURE</div>
      <div style="height:1px;background:#e5e7eb;margin:24px 0"></div>
      <h1 style="font-size:24px;line-height:1.3;margin:0 0 12px;color:#16294F">${esc(n.title)}</h1>
      <p style="font-size:15px;line-height:1.7;color:#475569;margin:0">${esc(n.message)}</p>
      ${details}
      <p style="font-size:13px;line-height:1.6;color:#64748b;margin:24px 0 0">You can view your sales and commissions from your Newvelion dashboard.</p>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:12px;color:#94a3b8">Newvelion — Commerce infrastructure</div>
    </div>
  </div>
</body>
</html>`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + resend, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Newvelion <notifications@veliongroup.online>",
      to: [to],
      subject: isSale ? `Confirmed R${money(amount)} sale` : n.type === "withdrawal_approved" ? `Approved R${money(data.requested_amount ?? data.amount ?? data.net_amount ?? 0)} withdrawal` : n.type === "withdrawal_rejected" ? `Rejected R${money(data.requested_amount ?? data.amount ?? data.net_amount ?? 0)} withdrawal` : n.type === "withdrawal_paid" ? `Paid R${money(data.requested_amount ?? data.amount ?? data.net_amount ?? 0)} withdrawal` : n.title,
      html
    })
  });

  const p = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(p.message || "Resend failed");
  return p.id || null;
}

async function sendPush(n: any, subs: any[]) {
  const vapidRows = await sql.unsafe(
    "select name,decrypted_secret from vault.decrypted_secrets where name in ('newvelion_vapid_public_key','newvelion_vapid_private_key')"
  );
  const vapid = Object.fromEntries(vapidRows.map((row: any) => [row.name, row.decrypted_secret]));
  const pub = vapid.newvelion_vapid_public_key || Deno.env.get("VAPID_PUBLIC_KEY");
  const priv = vapid.newvelion_vapid_private_key || Deno.env.get("VAPID_PRIVATE_KEY");
  if (!pub || !priv) throw Error("VAPID keys are not configured.");

  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") || "mailto:notifications@veliongroup.online",
    pub,
    priv
  );

  let ok = false;
  for (const x of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: x.endpoint, keys: { p256dh: x.p256dh, auth: x.auth } },
        JSON.stringify({
          title: n.title,
          body: n.message,
          url: n.data?.target_url || (
            n.data?.recipient_role === "admin" ? "/dashboard/admin" :
            n.data?.recipient_role === "supplier" ? "/dashboard/supplier/orders" :
            n.type === "withdrawal_requested" ? "/dashboard/admin/withdrawals" :
            "/dashboard/seller"
          ),
          notificationId: n.id
        }),
        { TTL: 3600, urgency: "high" }
      );
      ok = true;
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await sql.unsafe("delete from public.push_subscriptions where id=$1", [x.id]);
      }
    }
  }
  if (!ok) throw Error("No push subscription accepted the notification.");
}

Deno.serve(async req => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    if (!await authorized(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const b = await req.json();
    const id = String(b?.notification_id || "").trim();
    if (!id) throw Error("notification_id is required");

    const nr = await sql.unsafe(
      "select id,user_id,type,title,message,event_key,data from public.notifications where id=$1 limit 1",
      [id]
    );
    const n = nr[0];
    if (!n) throw Error("Notification not found.");

    const ur = await sql.unsafe("select email from auth.users where id=$1 limit 1", [n.user_id]);
    const email = ur[0]?.email;

    const sr = await sql.unsafe(
      "select email_notifications,sales_notifications from public.account_settings where user_id=$1 limit 1",
      [n.user_id]
    );
    const set = sr[0] || {};

    const subs = await sql.unsafe(
      "select id,endpoint,p256dh,auth from public.push_subscriptions where user_id=$1",
      [n.user_id]
    );

    const sale = ["sale_confirmed", "supplier_sale_confirmed", "admin_sale_confirmed"].includes(n.type);
    const sales = set.sales_notifications !== false;
    const applySalesPreference = sale && !["admin", "supplier"].includes(String(n.data?.recipient_role || ""));
    const res: any = { email: "skipped", push: "skipped" };

    if (set.email_notifications !== false && (!applySalesPreference || sales) && email) {
      const e = await sql.unsafe(
        "select status from public.notification_deliveries where notification_id=$1 and channel='email' limit 1",
        [id]
      );

      if (e[0]?.status !== "sent") {
        await sql.unsafe(
          "insert into public.notification_deliveries(notification_id,channel,status,updated_at) values($1,'email','pending',now()) on conflict(notification_id,channel) do update set status='pending',updated_at=now()",
          [id]
        );

        try {
          const pid = await sendEmail(n, email);
          await sql.unsafe(
            "update public.notification_deliveries set status='sent',provider_id=$2,sent_at=now(),updated_at=now(),last_error=null where notification_id=$1 and channel='email'",
            [id, pid]
          );
          res.email = "sent";
        } catch (e) {
          await sql.unsafe(
            "update public.notification_deliveries set status='failed',last_error=$2,updated_at=now() where notification_id=$1 and channel='email'",
            [id, e instanceof Error ? e.message : "Email failed"]
          );
          res.email = "failed";
        }
      } else {
        res.email = "sent";
      }
    }

    if (subs.length && (!applySalesPreference || sales)) {
      const p = await sql.unsafe(
        "select status from public.notification_deliveries where notification_id=$1 and channel='push' limit 1",
        [id]
      );

      if (p[0]?.status !== "sent") {
        await sql.unsafe(
          "insert into public.notification_deliveries(notification_id,channel,status,updated_at) values($1,'push','pending',now()) on conflict(notification_id,channel) do update set status='pending',updated_at=now()",
          [id]
        );

        try {
          await sendPush(n, subs);
          await sql.unsafe(
            "update public.notification_deliveries set status='sent',sent_at=now(),updated_at=now(),last_error=null where notification_id=$1 and channel='push'",
            [id]
          );
          res.push = "sent";
        } catch (e) {
          await sql.unsafe(
            "update public.notification_deliveries set status='failed',last_error=$2,updated_at=now() where notification_id=$1 and channel='push'",
            [id, e instanceof Error ? e.message : "Push failed"]
          );
          res.push = "failed";
        }
      } else {
        res.push = "sent";
      }
    }

    return Response.json({ success: true, notification_id: id, result: res });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Dispatch failed" },
      { status: 500 }
    );
  } finally {
    // Keep the pooled SQL client alive for subsequent requests in this Edge Function isolate.
  }
});
