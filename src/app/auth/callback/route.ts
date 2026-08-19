import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  
  // Se tiver o parâmetro 'code', processa o login normalmente
  if (code) {
    const supabase = createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard/seller`);
    }
  }

  // Caso o token venha no fragmento (URL com #access_token=)
  // Precisamos reconstruir a URL com os parâmetros do fragmento para processar
  const hash = requestUrl.hash;
  if (hash && hash.includes("access_token=")) {
    // Extrai os parâmetros do fragmento
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = params.get("expires_in");
    const providerToken = params.get("provider_token");
    const providerRefreshToken = params.get("provider_refresh_token");

    if (accessToken) {
      const supabase = createServerClient();
      // Define a sessão manualmente com os tokens recebidos
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      });
      
      if (!error) {
        return NextResponse.redirect(`${origin}/dashboard/seller`);
      }
    }
  }

  // Se tudo falhar, redireciona para o login com erro
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`);
}
