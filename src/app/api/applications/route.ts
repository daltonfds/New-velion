import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      fullName,
      email,
      phone,
      country,
      city,
      role,
      sellingMethod,
    } = body;

    if (!fullName || !email || !phone || !role) {
      return NextResponse.json(
        { error: "Full name, email, phone and role are required." },
        { status: 400 }
      );
    }

    if (!["seller", "producer", "supplier"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid application role." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("registration_requests")
      .insert({
        requested_role: role,
        full_name: fullName,
        email,
        phone,
        country: country || null,
        city: city || null,
        selling_method: sellingMethod || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Application creation error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, requestId: data.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Application API error:", error);

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
