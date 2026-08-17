"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { createIntegration } from "./actions";
import { useToast } from "@/components/ui/Toast";

export default function IntegrationsPage() {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createIntegration(formData);
      showToast("Integration added successfully!", "success");
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Integrations</h1>
          <p className="text-muted text-sm">Connect your store to Velion.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Connect New Store</Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted hover:text-dark text-xl">×</button>
            <h2 className="text-xl font-bold text-dark mb-4">Connect Your Store</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1">Platform</label>
                <select name="platform" className="w-full px-4 py-2.5 border border-border rounded-lg bg-secondary/50" required>
                  <option value="">Select platform</option>
                  <option value="shopify">Shopify</option>
                  <option value="woocommerce">WooCommerce</option>
                  <option value="custom_api">Custom API</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Store URL</label>
                <input type="url" name="store_url" placeholder="https://..." className="w-full px-4 py-2.5 border border-border rounded-lg bg-secondary/50" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">API Key</label>
                <input type="text" name="api_key" placeholder="sk_..." className="w-full px-4 py-2.5 border border-border rounded-lg bg-secondary/50" required />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">API Secret</label>
                <input type="password" name="api_secret" placeholder="••••••••" className="w-full px-4 py-2.5 border border-border rounded-lg bg-secondary/50" required />
              </div>
              <Button type="submit" disabled={loading} className="w-full justify-center mt-4">Save Integration</Button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
