import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const COUNTRIES: Record<string, { name: string; callingCode: string }> = {
  ZA: { name: "South Africa", callingCode: "+27" },
  MZ: { name: "Mozambique", callingCode: "+258" },
  AO: { name: "Angola", callingCode: "+244" },
};

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Authentication service is not configured." }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: authError } = await admin.auth.getUser(authorization.slice(7));
  if (authError || !user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const fullName = String(body?.fullName || "").trim().replace(/\s+/g, " ");
  const countryCode = String(body?.countryCode || "").trim().toUpperCase();
  const phoneInput = String(body?.phone || "").trim();
  const country = COUNTRIES[countryCode];
  const digits = phoneInput.replace(/\D/g, "");
  if (fullName.length < 2 || fullName.length > 120) return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  if (!country) return NextResponse.json({ error: "Select a supported country." }, { status: 400 });
  if (digits.length < 9 || digits.length > 15) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });

  const { data: profile, error: profileError } = await admin.from("profiles")
    .select("id,role").eq("id", user.id).maybeSingle();
  if (profileError) return NextResponse.json({ error: "Unable to load your account profile." }, { status: 500 });
  if (!profile || profile.role !== "customer") {
    return NextResponse.json({ error: "Only buyer accounts can complete this profile form." }, { status: 403 });
  }

  const normalizedDigits = digits.replace(/^0+/, "");
  const phoneE164 = country.callingCode + normalizedDigits;
  const { error: updateError } = await admin.from("profiles").update({
    full_name: fullName,
    nome_completo: fullName,
    country: country.name,
    country_code: countryCode,
    country_calling_code: country.callingCode,
    phone_number: phoneInput,
    phone_e164: phoneE164,
    pais: countryCode,
    telefone: phoneInput,
  }).eq("id", user.id);
  if (updateError) return NextResponse.json({ error: "Unable to save your profile details." }, { status: 500 });

  const { error: metadataError } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      full_name: fullName,
      country_name: country.name,
      country_code: countryCode,
      country_calling_code: country.callingCode,
      phone_number: phoneInput,
      phone_e164: phoneE164,
    },
  });
  if (metadataError) return NextResponse.json({ error: "Profile saved, but account metadata could not be synchronized." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
