import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const decision = String(formData.get("decision") || "");
  const authorizationId = String(formData.get("authorization_id") || "");

  if (!authorizationId || !["approve", "deny"].includes(decision)) {
    return NextResponse.json({ error: "Invalid OAuth decision." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore cookie writes that are not available in this request context.
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const returnPath = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(returnPath)}`, request.url),
    );
  }

  const { data: details, error: detailsError } =
    await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  if (detailsError || !details) {
    return NextResponse.json(
      { error: detailsError?.message || "Invalid or expired authorization request." },
      { status: 400 },
    );
  }

  const result =
    decision === "approve"
      ? await supabase.auth.oauth.approveAuthorization(authorizationId)
      : await supabase.auth.oauth.denyAuthorization(authorizationId);

  if (result.error || !result.data?.redirect_url) {
    return NextResponse.json(
      { error: result.error?.message || "Unable to complete OAuth authorization." },
      { status: 400 },
    );
  }

  return NextResponse.redirect(result.data.redirect_url);
}
