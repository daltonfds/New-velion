import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const url = new URL(request.url);

  // Se não estiver logado e tentar aceder a qualquer dashboard, vai para o login
  if (!session && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se estiver logado, verifica as permissões de acesso
  if (session) {
    // Buscar o role do utilizador
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const role = profile?.role || "seller";

    // Proteção: Admin só pode aceder a /dashboard/admin
    if (url.pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/seller", request.url));
    }

    // Proteção: Producer só pode aceder a /dashboard/producer
    if (url.pathname.startsWith("/dashboard/producer") && role !== "producer") {
      return NextResponse.redirect(new URL("/dashboard/seller", request.url));
    }

    // Proteção: Seller não pode aceder a /admin ou /producer
    if (role === "seller" && (url.pathname.startsWith("/dashboard/admin") || url.pathname.startsWith("/dashboard/producer"))) {
      return NextResponse.redirect(new URL("/dashboard/seller", request.url));
    }

    // Se estiver logado e tentar aceder ao login, vai para o seu dashboard
    if (url.pathname === "/login") {
      switch (role) {
        case "admin": return NextResponse.redirect(new URL("/dashboard/admin", request.url));
        case "producer": return NextResponse.redirect(new URL("/dashboard/producer", request.url));
        default: return NextResponse.redirect(new URL("/dashboard/seller", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
