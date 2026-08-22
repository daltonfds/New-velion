"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";

export default function DashboardLoadingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        const role = profile?.role || "seller";
        
        if (role === "admin") {
          router.replace("/dashboard/admin");
        } else if (role === "producer") {
          router.replace("/dashboard/producer");
        } else {
          router.replace("/dashboard/seller");
        }
      } else {
        // Se não há sessão, redireciona para o login
        router.replace("/login");
      }
      
      setLoading(false);
    };
    
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6">
          <VelionLogo className="w-28 h-28" />
        </div>
        <p className="text-light-muted text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );
}
