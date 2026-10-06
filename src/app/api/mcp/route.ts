import { createClient } from "@supabase/supabase-js";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { fromSupabaseUrl, withOAuthProtectedResource, withSupabase } from "@supabase/server";
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

  server.registerTool("list_fulfillment_orders", {
    title: "List Fulfillment Orders",
    description: "Inspect the supplier fulfillment queue without exposing customer contact details in list results.",
    inputSchema: z.object({ status: z.string().max(40).optional(), limit: z.number().int().min(1).max(100).default(50) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ status, limit }) => {
    let q = supabase.from("fulfillment_orders")
      .select("id,source_type,source_id,sale_id,integration_order_id,status,supplier_id,currency,subtotal,shipping_amount,total,tracking_number,carrier,tracking_url,fulfilled_at,public_tracking_token,created_at,updated_at")
      .order("created_at", { ascending: false }).limit(limit);
    if (status?.trim()) q = q.eq("status", status.trim());
    const { data, error } = await q;
    if (error) return result({ error: error.message });
    return result({ data: data ?? [] });
  });

  server.registerTool("get_fulfillment_order", {
    title: "Get Fulfillment Order",
    description: "Inspect one fulfillment order including customer shipping data when needed for fulfillment.",
    inputSchema: z.object({ fulfillment_order_id: z.string().uuid() }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ fulfillment_order_id }) => {
    const { data: order, error } = await supabase.from("fulfillment_orders")
      .select("id,source_type,source_id,sale_id,integration_order_id,status,supplier_id,currency,subtotal,shipping_amount,total,customer,shipping_address,tracking_number,carrier,tracking_url,fulfilled_at,public_tracking_token,created_at,updated_at,supplier_cost_currency,supplier_cost_total,supplier_origin_shipping_cost,supplier_origin_shipping_currency,supplier_fx_rate_to_zar,supplier_fx_rate_captured_at")
      .eq("id", fulfillment_order_id).maybeSingle();
    if (error) return result({ error: error.message });
    if (!order) return result({ error: "FULFILLMENT_NOT_FOUND" });
    const { data: items, error: itemError } = await supabase.from("fulfillment_order_items")
      .select("id,product_id,supplier_id,quantity,unit_sale_price,unit_cost,product_name,supplier_cost_currency,supplier_fx_rate_to_zar,supplier_cost_zar")
      .eq("fulfillment_order_id", fulfillment_order_id);
    if (itemError) return result({ error: itemError.message });
    return result({ order, items: items ?? [] });
  });

  server.registerTool("get_public_tracking", {
    title: "Get Customer Tracking",
    description: "Resolve a public NewVelion tracking token into customer-safe tracking information.",
    inputSchema: z.object({ tracking_token: z.string().min(16).max(128) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ tracking_token }) => {
    const { data, error } = await supabase.from("fulfillment_orders").select("id,status,tracking_number,carrier,tracking_url,created_at,fulfilled_at").eq("public_tracking_token", tracking_token.trim()).maybeSingle();
    if (error) return result({ error: error.message });
    return result({ data });
  });

  server.registerTool("update_fulfillment_order", {
    title: "Update Fulfillment Order",
    description: "Change a fulfillment status and optionally set carrier/tracking data. This is a write action.",
    inputSchema: z.object({
      fulfillment_order_id: z.string().uuid(),
      status: z.enum(["pending","confirmed","processing","packed","shipped","in_transit","delivered","cancelled","failed","returned"]),
      tracking_number: z.string().max(200).optional(),
      carrier: z.string().max(100).optional(),
      tracking_url: z.string().url().max(500).optional(),
      note: z.string().max(1000).optional(),
    }),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  }, async ({ fulfillment_order_id, status, tracking_number, carrier, tracking_url, note }) => {
    const allowed: Record<string,string[]> = {
      pending:["confirmed","cancelled"], confirmed:["processing","cancelled"], processing:["packed","cancelled"],
      packed:["shipped"], shipped:["in_transit"], in_transit:["delivered","failed"], failed:["processing"],
    };
    const { data: current, error: currentError } = await supabase.from("fulfillment_orders")
      .select("id,status").eq("id", fulfillment_order_id).maybeSingle();
    if (currentError) return result({ error: currentError.message });
    if (!current) return result({ error: "FULFILLMENT_NOT_FOUND" });
    if (current.status !== status && !allowed[current.status]?.includes(status)) {
      return result({ error: "INVALID_FULFILLMENT_STATUS_TRANSITION", from: current.status, to: status });
    }
    const { data, error } = await supabase.rpc("set_fulfillment_status", {
      p_fulfillment_order_id: fulfillment_order_id,
      p_status: status,
      p_tracking_number: tracking_number?.trim() || null,
      p_carrier: carrier?.trim() || null,
      p_tracking_url: tracking_url?.trim() || null,
      p_note: note?.trim() || null,
      p_actor_id: process.env.NEWVELION_MCP_ACTOR_ID?.trim() || null,
    });
    if (error) return result({ error: error.message });
    return result({ data: Array.isArray(data) ? data[0] ?? null : data });
  });

  return server;
});

const handle = withOAuthProtectedResource(
  {
    resourceServer: (request) => new URL("/mcp", request.url).toString(),
    authorizationServer: fromSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || ""),
  },
  withSupabase({ auth: "user" }, async (request, context) => {
    const userId = context.userClaims?.id;
    if (!userId) {
      return Response.json({ error: "Unauthorized MCP request." }, { status: 401 });
    }

    const { data: profile, error } = await context.supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error || profile?.role !== "admin") {
      return Response.json(
        { error: "NewVelion administrator access is required." },
        { status: 403 },
      );
    }

    return handler.fetch(request);
  }),
);

export const GET = handle;
export const POST = handle;
export const DELETE = handle;

export { handler as mcpHandler };
