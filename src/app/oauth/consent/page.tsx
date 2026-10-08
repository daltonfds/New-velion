import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ authorization_id?: string }>;

export default async function OAuthConsentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { authorization_id: authorizationId } = await searchParams;

  if (!authorizationId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8">
          <h1 className="text-2xl font-bold text-[#16294F]">Invalid authorization request</h1>
          <p className="mt-2 text-slate-500">The OAuth authorization request is missing its authorization ID.</p>
        </div>
      </main>
    );
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
            // Server Components cannot always mutate cookies. The auth flow remains valid.
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
    redirect(`/login?redirect=${encodeURIComponent(returnPath)}`);
  }

  const { data: authDetails, error } =
    await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  if (error || !authDetails) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8">
          <h1 className="text-2xl font-bold text-[#16294F]">Authorization unavailable</h1>
          <p className="mt-2 text-slate-500">
            {error?.message || "This authorization request is invalid or has expired."}
          </p>
        </div>
      </main>
    );
  }

  if (!("authorization_id" in authDetails)) {
    redirect(authDetails.redirect_url);
  }

  const scopes = authDetails.scope?.trim()
    ? authDetails.scope.split(/\\s+/).filter(Boolean)
    : [];

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-end gap-1" aria-label="Newvelion">
            <span className="h-3 w-2 rounded-sm bg-[#FFB800]" />
            <span className="h-5 w-2 rounded-sm bg-[#FFB800]" />
            <span className="h-7 w-2 rounded-sm bg-[#FFB800]" />
          </div>
          <div className="mt-2 text-xl font-bold text-[#16294F]">Newvelion</div>
        </div>

        <section className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm sm:p-9">
          <div className="rounded-2xl bg-blue-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
              Secure connection
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#16294F]">
              Authorize {authDetails.client.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This application is requesting access to your Newvelion account through a secure OAuth connection.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Account</p>
              <p className="mt-1 font-semibold text-[#16294F]">{user.email}</p>
            </div>

            {scopes.length > 0 && (
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Requested permissions
                </p>
                <ul className="mt-3 space-y-2">
                  {scopes.map((scope) => (
                    <li key={scope} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                      {scope}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs leading-5 text-slate-500">
              Only Newvelion administrator accounts can use the operational MCP tools. You can revoke
              OAuth access later from your account settings.
            </p>
          </div>

          <form action="/api/oauth/decision" method="POST" className="mt-7 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="authorization_id" value={authorizationId} />
            <button
              type="submit"
              name="decision"
              value="deny"
              className="rounded-xl border border-slate-200 px-5 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Deny
            </button>
            <button
              type="submit"
              name="decision"
              value="approve"
              className="rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700"
            >
              Approve connection
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
