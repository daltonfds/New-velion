import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const url = new URL(request.url);

  // Se não estiver logado e tentar acessar o dashboard, vai para o login
  if (!session && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se estiver logado e tentar acessar o login, vai para o dashboard
  if (session && url.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard/seller", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
