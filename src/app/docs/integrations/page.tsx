import Link from "next/link";

const code = `curl https://newvelion.com/api/integrations/v1/products \
  -H "Authorization: Bearer nv_live_xxx.nvs_xxx"`;

export default function IntegrationDocsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-14 lg:px-10">
        <div className="mb-12">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            ← NewVelion
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Integration API v1
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Products, stock and fulfillment infrastructure for external sales channels.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            External platforms keep their sellers, storefronts, customers and sale prices.
            NewVelion remains the source of truth for products, stock, fulfillment and tracking.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold">Authentication</h2>
            <p className="mt-2 text-slate-600">
              Use the API key and secret issued by an administrator. Send them as a single
              bearer credential in the format <code>api_key.api_secret</code>.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm text-slate-100">
              {code}
            </pre>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Endpoints</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[110px_1fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold">
                <span>Method</span><span>Endpoint</span>
              </div>
              {[
                ["GET", "/api/integrations/v1/products"],
                ["GET", "/api/integrations/v1/products/:id"],
                ["GET", "/api/integrations/v1/products/:id/stock"],
                ["POST", "/api/integrations/v1/sellers"],
                ["POST", "/api/integrations/v1/products/mapping"],\n                ["POST", "/api/integrations/v1/offers"],\n                ["GET", "/api/integrations/v1/offers/:id"],
                ["POST", "/api/integrations/v1/orders"],
                ["GET", "/api/integrations/v1/orders/:externalOrderId"],
              ].map(([method, endpoint]) => (
                <div key={endpoint} className="grid grid-cols-[110px_1fr] border-b border-slate-100 px-4 py-3 text-sm last:border-0">
                  <span className="font-semibold text-slate-700">{method}</span>
                  <code className="text-slate-600">{endpoint}</code>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Create an order</h2>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm leading-6 text-slate-100">
{JSON.stringify({
  external_order_id: "ORDER-82931",
  external_seller_id: "seller_123",
  currency: "ZAR",
  items: [
    {
      external_product_id: "prod_123",
      newvelion_product_id: "product-uuid",
      quantity: 2,
      sale_price: 500
    }
  ],
  customer: {
    name: "Customer Name",
    phone: "+27...",
    email: "customer@example.com"
  },
  shipping_address: {
    country: "ZA",
    province: "Gauteng",
    city: "Maputo",
    address: "Street 1",
    postal_code: "1100",
    phone: "+27..."
  }
}, null, 2)}
            </pre>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Send <code>Idempotency-Key</code> for safe retries. The database also enforces
              uniqueness by platform and external order ID, so repeated deliveries do not create
              duplicate orders.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Webhooks</h2>
            <p className="mt-2 text-slate-600">
              NewVelion sends events such as <code>order.created</code>,
              <code>order.processing</code>, <code>order.shipped</code>,
              <code>order.delivered</code>, <code>order.cancelled</code> and
              <code>order.returned</code>.
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 p-5 text-sm leading-6 text-slate-600">
              Headers: <code>X-NewVelion-Event</code>, <code>X-NewVelion-Event-Id</code>,
              <code>X-NewVelion-Timestamp</code> and <code>X-NewVelion-Signature</code>.
              The signature is HMAC-SHA256 over <code>timestamp.payload</code>.
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Errors</h2>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm text-slate-100">
{JSON.stringify({
  error: {
    code: "PRODUCT_OUT_OF_STOCK",
    message: "The requested product quantity is out of stock.",
    request_id: "req_123"
  }
}, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Rate limits</h2>
            <p className="mt-2 text-slate-600">
              Integration API requests are limited per platform. The current v1 default is
              120 requests per minute. The limit is enforced in PostgreSQL, not only in memory,
              so it remains consistent across serverless instances.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
