# NewVelion ChatGPT MCP App

NewVelion exposes a remote Model Context Protocol server for trusted AI clients such as ChatGPT.

## Endpoint

Production MCP endpoint:

`https://<NEWVELION-DOMAIN>/mcp`

The endpoint uses Supabase OAuth 2.1 and is restricted to NewVelion administrator accounts.

## Authentication

The MCP server uses:

- Supabase Auth OAuth 2.1 authorization code flow with PKCE
- OAuth Protected Resource metadata
- Dynamic client registration when enabled in Supabase
- NewVelion admin-role authorization after OAuth authentication

Do not add a static MCP bearer token to production.

## Required server environment

The MCP runtime needs:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_JWKS=
SUPABASE_SERVICE_ROLE_KEY=
NEWVELION_MCP_ACTOR_ID=
```

`SUPABASE_SERVICE_ROLE_KEY` is used only by the existing operational tools after the OAuth caller has passed the admin-role gate. Never expose it to the browser.

## Supabase OAuth setup

In Supabase:

1. Open Authentication > OAuth Server.
2. Enable OAuth 2.1 Server.
3. Set Authorization Path to `/oauth/consent`.
4. Enable Dynamic Client Registration for MCP clients.
5. Use asymmetric JWT signing keys (RS256 or ES256).
6. Confirm the Auth Site URL is the production NewVelion origin.

The consent UI is implemented at:

`/oauth/consent`

## ChatGPT setup

In ChatGPT web:

1. Open the custom MCP/plugin creation flow.
2. Create a custom MCP server.
3. Set the server URL to the production `/mcp` endpoint.
4. Select OAuth authentication.
5. Complete the NewVelion OAuth consent flow.
6. Install the resulting plugin/app in the conversation.

The MCP server supports streaming HTTP through the MCP handler.

## Available tools

### Read

- `get_platform_overview`
- `list_products`
- `list_recent_sales`
- `list_fulfillment_orders`
- `get_fulfillment_order`
- `get_public_tracking`

### Write

- `update_fulfillment_order`

The write tool validates the existing fulfillment lifecycle before calling NewVelion's existing `set_fulfillment_status` RPC.

## Operational safety

The MCP tools must never invent sales, payments, customers, tracking numbers, stock, or financial values.

Customer contact and shipping data are only returned by the single-order fulfillment tool because they can be required for fulfillment operations. List tools intentionally omit customer contact/address data.

Historical financial snapshots remain authoritative; MCP tools do not recalculate sale economics from current product or affiliation values.

## Local verification

Run:

```bash
cd ~/new-velion
npm install
npx tsc --noEmit
```

Then:

```bash
npm run dev
```

Check:

```
http://localhost:3000/mcp
```

A request without an OAuth bearer token should receive an OAuth authentication challenge/metadata response rather than the old static-token response.

For production, use the deployed HTTPS URL rather than a local address.
