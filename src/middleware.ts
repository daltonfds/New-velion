import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const url = new URL(request.url);

  // 1. Se NÃO estiver logado e tentar acessar o dashboard, vai para o login
  if (!session && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Se estiver logado, verificações de segurança
  if (session) {
    const { data: { user } } = await supabase.auth.getUser();

    // 2.1 Verificar se o e-mail do usuário foi confirmado
    // Se NÃO tiver confirmado e NÃO estiver na página de verificação, redireciona
    if (!user?.email_confirmed_at && url.pathname !== "/verify-email") {
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }

    // 2.2 Verificar se o papel (role) permite acesso ao Admin
    if (url.pathname.startsWith("/dashboard/admin")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      
      // Se não for admin, manda para o painel do Seller
      if (!profile || profile.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard/seller", request.url));
      }
    }

    // 2.3 Se estiver logado e tentar acessar o login, vai para o dashboard
    if (url.pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard/seller", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/verify-email"],
};
