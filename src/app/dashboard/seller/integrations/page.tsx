import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { createServerClient } from "@/lib/supabase/server";

// Buscar integrações do banco de dados
async function getIntegrations() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("seller_id", user.id);

  if (error) return [];
  return data || [];
}

export default async function IntegrationsPage() {
  const integrations = await getIntegrations();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Integrations</h1>
          <p className="text-muted text-sm">Connect your store to Velion for automatic order processing.</p>
        </div>
        <Button>+ Connect New Store</Button>
      </div>

      <div className="space-y-4">
        {integrations.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-border shadow-sm text-center">
            <div className="text-4xl mb-4">🔌</div>
            <h3 className="text-lg font-medium text-dark">No integrations yet</h3>
            <p className="text-muted text-sm mb-6">Connect your Shopify, WooCommerce, or custom store to start processing orders via Velion.</p>
            <Button variant="outline">+ Add Integration</Button>
          </div>
        ) : (
          integrations.map((integration: any) => (
            <div key={integration.id} className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-xl">
                  {integration.platform === 'shopify' ? '🛒' : integration.platform === 'woocommerce' ? '🛍️' : '⚙️'}
                </div>
                <div>
                  <h4 className="font-semibold text-dark capitalize">{integration.platform.replace('_', ' ')}</h4>
                  <p className="text-sm text-muted">{integration.store_url || 'Connected via API'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${integration.is_active ? 'bg-success' : 'bg-error'}`} />
                    <span className="text-xs text-muted">{integration.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="text-xs px-4 py-2">View Webhooks</Button>
                <Button className="bg-error/10 text-error hover:bg-error/20 text-xs px-4 py-2">Disconnect</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
