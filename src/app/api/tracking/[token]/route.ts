import { createClient } from "@supabase/supabase-js";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const cleanToken = token?.trim();

  if (!cleanToken || cleanToken.length < 16 || cleanToken.length > 128) {
    return Response.json({ error: "Invalid tracking token." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return Response.json({ error: "Tracking service unavailable." }, { status: 503 });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc("get_public_fulfillment_tracking", {
    p_token: cleanToken,
  });

  if (error) {
    console.error("Public tracking lookup failed:", error);
    return Response.json({ error: "Tracking service unavailable." }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result) {
    return Response.json({ error: "Tracking order not found." }, { status: 404 });
  }

  return Response.json({ data: result }, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
