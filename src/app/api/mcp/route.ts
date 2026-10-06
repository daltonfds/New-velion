import { createClient } from "@supabase/supabase-js";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("MCP database configuration is missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function result(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

const handler = createMcpHandler(() => {
  const supabase = db();
  const server = new McpServer(
    { name: "newvelion", version: "1.0.0" },
    {
      instructions: "NewVelion operational MCP. Never invent orders, payments, customers, tracking numbers, or financial values.",
      capabilities: { tools: {} },
    },
  );

  server.registerTool("get_platform_overview", {
    title: "Get NewVelion Platform Overview",
    description: "Return a live operational snapshot of products, paid sales, suppliers, and fulfillment statuses.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async () => {
    const [products, sales, fulfillment, suppliers] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }).eq("ativo", true),
      supabase.from("sales").select("id", { count: "exact", head: true }).eq("status", "paga"),
      supabase.from("fulfillment_orders").select("status"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "supplier"),
    ]);
    const byStatus = (fulfillment.data ?? []).reduce<Record<string, number>>((a, r) => {
      a[r.status] = (a[r.status] ?? 0) + 1;
      return a;
    }, {});
    return result({
      active_products: products.count ?? 0,
      paid_sales: sales.count ?? 0,
      suppliers: suppliers.count ?? 0,
      fulfillment_orders: fulfillment.data?.length ?? 0,
      fulfillment_by_status: byStatus,
    });
  });

  server.registerTool("list_products", {
    title: "List NewVelion Products",
    description: "Search the live catalog with pricing, stock, supplier country, approval, and pricing mode.",
    inputSchema: z.object({
      query: z.string().max(120).optional(),
      limit: z.number().int().min(1).max(50).default(20),
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ query, limit }) => {
    let q = supabase.from("products")
      .select("id,nome,slug,preco_venda,preco_promocional,moeda,estoque,reserved_estoque,supplier_country_code,supplier_status,pricing_mode,custom_pricing_floor_zar,supplier_min_selling_price")
      .order("created_at", { ascending: false }).limit(limit);
    if (query?.trim()) q = q.ilike("nome", `%${query.trim()}%`);
    const { data, error } = await q;
    if (error) return result({ error: error.message });
    return result({ data: data ?? [] });
  });

  server.registerTool("list_recent_sales", {
    title: "List Recent Sales",
    description: "Return recent paid sales with pricing and financial snapshots.",
    inputSchema: z.object({ limit: z.number().int().min(1).max(100).default(25) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ limit }) => {
    const { data, error } = await supabase.from("sales")
      .select("id,vendedor_id,product_id,valor_venda,comissao_vendedor,status,gateway_ref,vendido_em,quantity,currency,supplier_country_code,supplier_cost_currency,supplier_cost_amount,supplier_cost_zar,pricing_mode,base_price_zar,seller_margin_zar,commission_snapshot_zar")
      .order("vendido_em", { ascending: false }).limit(limit);
    if (error) return result({ error: error.message });
    return result({ data: data ?? [] });
  });

  return server;
});

async function handle(request: Request) {
  const expected = process.env.NEWVELION_MCP_TOKEN?.trim();
  const received = request.headers.get("authorization") || "";
  if (!expected || received !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized MCP request." }, { status: 401, headers: { "WWW-Authenticate": "Bearer" } });
  }
  return handler.fetch(request);
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
