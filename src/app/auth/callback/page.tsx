"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // Obtém o fragmento da URL (tudo depois do #)
      const hash = window.location.hash;
      if (!hash) {
        router.push("/login?error=No authentication token found");
        return;
      }

      // Converte o fragmento em parâmetros
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken) {
        // Define a sessão no Supabase via cliente
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });

        if (!error) {
          router.push("/dashboard/seller");
          return;
        }
      }

      router.push("/login?error=Authentication failed");
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="text-light-text">Completing login...</div>
    </div>
  );
}
