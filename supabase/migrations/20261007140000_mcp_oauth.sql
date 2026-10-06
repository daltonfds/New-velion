create table if not exists public.mcp_oauth_clients (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  client_name text,
  client_uri text,
  redirect_uris jsonb not null,
  grant_types jsonb not null default '["authorization_code","refresh_token"]'::jsonb,
  response_types jsonb not null default '["code"]'::jsonb,
  token_endpoint_auth_method text not null default 'none',
  scope text not null default 'mcp:read mcp:write',
  created_at timestamptz not null default now()
);

create table if not exists public.mcp_oauth_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  client_id text not null references public.mcp_oauth_clients(client_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  redirect_uri text not null,
  code_challenge text not null,
  scope text not null default 'mcp:read mcp:write',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.mcp_oauth_clients enable row level security;
alter table public.mcp_oauth_codes enable row level security;
revoke all on public.mcp_oauth_clients from anon, authenticated;
revoke all on public.mcp_oauth_codes from anon, authenticated;
grant all on public.mcp_oauth_clients to service_role;
grant all on public.mcp_oauth_codes to service_role;
create index if not exists mcp_oauth_codes_expires_idx on public.mcp_oauth_codes(expires_at);
