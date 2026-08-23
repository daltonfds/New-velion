"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Add, Check, Store } from "lucide-react";

export default function SellerIntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [platform, setPlatform] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("integrations").select("*").eq("seller_id", session.user.id);
      if (data) setIntegrations(data);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("platform", platform);
    formData.append("store_url", storeUrl);
    formData.append("api_key", apiKey);
    formData.append("api_secret", apiSecret);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from("integrations").insert({
        seller_id: session.user.id,
        platform,
        store_url: storeUrl,
        api_key: apiKey,
        api_secret: apiSecret,
        is_active: true,
      });
      alert("Integration added!");
      setPlatform(""); setStoreUrl(""); setApiKey(""); setApiSecret("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-light-border">
          <h3 className="font-semibold mb-4">Add Integration</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="text-xs text-light-muted">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-3 border rounded-lg">
              <option value="">Select</option>
              <option>Shopify</option>
              <option>WooCommerce</option>
              <option>Wix</option>
            </select>
            <label className="text-xs text-light-muted">Store URL</label>
            <input value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} className="w-full p-3 border rounded-lg" />
            <label className="text-xs text-light-muted">API Key</label>
            <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full p-3 border rounded-lg" />
            <label className="text-xs text-light-muted">API Secret</label>
            <input value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} className="w-full p-3 border rounded-lg" />
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-full">Add Integration</button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-xl border border-light-border">
          <h3 className="font-semibold mb-4">Active Integrations</h3>
          {integrations.length === 0 ? <p className="text-sm text-light-muted">No integrations yet.</p> : integrations.map((i: any) => (
            <div key={i.id} className="flex justify-between py-2 border-b border-light-border">
              <p>{i.platform}</p>
              <p className="text-sm text-success">Active</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
