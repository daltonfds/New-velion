import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=No code received from Google`);
  }

  const supabase = createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=Authentication failed`);
  }

  return NextResponse.redirect(`${origin}/dashboard/seller`);
}
