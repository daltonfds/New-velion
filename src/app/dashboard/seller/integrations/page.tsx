"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VelionLogo from "@/components/ui/VelionLogo";

export default function SellerIntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("integrations").select("*").eq("seller_id", session.user.id);
      if (data) setIntegrations(data);
    };
    load();
  }, []);

  const addIntegration = async (platform: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("integrations").insert({ seller_id: session.user.id, platform, is_active: true });
    alert(`${platform} integration requested!`);
  };

  return (
    <div className="min-h-screen bg-light-bg p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8"><VelionLogo className="w-8 h-8" /><span className="font-display text-xl font-semibold">Integrations</span></div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button onClick={() => addIntegration("Shopify")} className="bg-white p-6 rounded-xl border border-light-border hover:border-primary">🛒 Shopify</button>
          <button onClick={() => addIntegration("WooCommerce")} className="bg-white p-6 rounded-xl border border-light-border hover:border-primary">🛍️ WooCommerce</button>
          <button onClick={() => addIntegration("Wix")} className="bg-white p-6 rounded-xl border border-light-border hover:border-primary">🌐 Wix</button>
        </div>
        <div className="bg-white p-6 rounded-xl border border-light-border">
          <h3 className="font-semibold mb-4">Active Integrations</h3>
          {integrations.length === 0 ? <p className="text-light-muted">No integrations yet.</p> : integrations.map((i: any) => <div key={i.id} className="flex justify-between py-2 border-b border-light-border"><p>{i.platform}</p><p className="text-sm text-success">Active</p></div>)}
        </div>
      </div>
    </div>
  );
}
