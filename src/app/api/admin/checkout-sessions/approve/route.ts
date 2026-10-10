import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dispatchNotification } from "@/lib/notifications/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server is not configured." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const sessionId =
      typeof body === "object" &&
      body !== null &&
      "session_id" in body
        ? String((body as { session_id?: unknown }).session_id || "").trim()
        : "";

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id is required." },
        { status: 400 }
      );
    }

    const authenticatedClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: { persistSession: false },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const { data, error } = await authenticatedClient.rpc(
      "approve_checkout_session",
      {
        p_session_id: sessionId,
      }
    );

    if (error) {
      console.error("Checkout approval failed:", error);

      return NextResponse.json(
        { error: error.message || "Could not approve checkout session." },
        { status: 409 }
      );
    }

    const saleId = Array.isArray(data)
      ? data[0]?.sale_id
      : data?.sale_id;

    if (!saleId) return NextResponse.json({ error: "Checkout approval did not return a sale." }, { status: 500 });

    // Only provision/link a customer after the approval RPC has created the sale.
    const { data: checkout, error: checkoutError } = await admin.from("checkout_sessions")
      .select("id,customer_id,full_name,email,phone,province,city,postal_code,address,address_reference")
      .eq("id", sessionId).maybeSingle();
    if (checkoutError || !checkout) return NextResponse.json({ error: "Sale approved, but customer details could not be loaded. Retry approval." }, { status: 500 });
    const email = String(checkout.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Sale approved, but a valid customer email is missing." }, { status: 409 });

    let customerId: string | null = checkout.customer_id || null;
    let existingUser: { id: string; email?: string } | null = null;
    if (!customerId) {
      for (let page = 1; page <= 20; page += 1) {
        const { data: usersPage, error: usersError } = await admin.auth.admin.listUsers({ page, perPage: 500 });
        if (usersError) return NextResponse.json({ error: "Sale approved, but customer lookup failed. Retry approval." }, { status: 500 });
        existingUser = usersPage.users.find((candidate) => candidate.email?.toLowerCase() === email) || null;
        if (existingUser || usersPage.users.length < 500) break;
      }
      if (existingUser) customerId = existingUser.id;
      else {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://veliongroup.online";
        const { data: invitation, error: invitationError } = await admin.auth.admin.inviteUserByEmail(email, {
          data: { full_name: checkout.full_name, role: "customer" },
          redirectTo: siteUrl.replace(/\/$/, "") + "/login",
        });
        if (invitationError || !invitation.user) {
          console.error("Customer invitation failed after sale approval:", invitationError);
          return NextResponse.json({ error: "Sale approved, but the customer invitation failed. Check Supabase email/SMTP settings and retry approval." }, { status: 500 });
        }
        customerId = invitation.user.id;
      }
    }
    if (!customerId) return NextResponse.json({ error: "Sale approved, but customer account setup is incomplete. Retry approval." }, { status: 500 });

    const { data: customerProfile, error: customerProfileLookupError } = await admin.from("profiles")
      .select("role").eq("id", customerId).maybeSingle();
    if (customerProfileLookupError) return NextResponse.json({ error: "Sale approved, but profile lookup failed. Retry approval." }, { status: 500 });
    if (customerProfile && customerProfile.role !== "customer") return NextResponse.json({ error: "Sale approved, but this email belongs to a non-customer account. Use a customer email to complete account linking." }, { status: 409 });

    const { error: profileUpsertError } = await admin.from("profiles").upsert({
      id: customerId, full_name: checkout.full_name, role: "customer", status: "active",
    }, { onConflict: "id" });
    if (profileUpsertError) return NextResponse.json({ error: "Sale approved, but customer profile setup failed. Retry approval." }, { status: 500 });

    const { error: sessionLinkError } = await admin.from("checkout_sessions")
      .update({ customer_id: customerId, updated_at: new Date().toISOString() }).eq("id", sessionId);
    if (sessionLinkError) return NextResponse.json({ error: "Sale approved, but checkout account linking failed. Retry approval." }, { status: 500 });
    const { error: saleLinkError } = await admin.from("sales").update({ customer_id: customerId }).eq("id", saleId);
    if (saleLinkError) return NextResponse.json({ error: "Sale approved, but sale account linking failed. Retry approval." }, { status: 500 });

    const { data: defaultAddress, error: addressLookupError } = await admin.from("customer_addresses")
      .select("id").eq("user_id", customerId).eq("is_default", true).maybeSingle();
    if (addressLookupError) return NextResponse.json({ error: "Sale approved, but address lookup failed. Retry approval." }, { status: 500 });
    if (!defaultAddress) {
      const { error: addressInsertError } = await admin.from("customer_addresses").insert({
        user_id: customerId, label: "Delivery address", full_name: checkout.full_name, phone: checkout.phone,
        province: checkout.province, city: checkout.city, postal_code: checkout.postal_code,
        address: checkout.address, address_reference: checkout.address_reference, is_default: true,
      });
      if (addressInsertError) return NextResponse.json({ error: "Sale approved, but delivery details could not be saved. Retry approval." }, { status: 500 });
    }

    if (saleId) {
      const { data: notification } = await admin
        .from("notifications")
        .select("id")
        .eq("event_key", `sale_confirmed:${saleId}`)
        .maybeSingle();

      if (notification?.id) {
        try {
          await dispatchNotification(notification.id);
        } catch (notificationError) {
          console.error(
            "Sale notification dispatch failed:",
            notificationError
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      sale_id: saleId,
    });
  } catch (error) {
    console.error("Admin checkout approval error:", error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
