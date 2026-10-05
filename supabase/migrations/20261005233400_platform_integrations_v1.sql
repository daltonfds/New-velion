-- NewVelion Integration API v1
-- Applied to the connected Supabase project as migration: platform_integrations_v1

create table if not exists public.integration_platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  status text not null default 'active' check (status in ('active','suspended','revoked')),
  api_key text not null unique,
  api_secret_hash text not null,
  webhook_url text,
  webhook_secret_encrypted text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_external_sellers (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.integration_platforms(id) on delete cascade,
  external_seller_id text not null,
  name text not null,
  email text,
  status text not null default 'active' check (status in ('active','suspended','revoked')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(platform_id, external_seller_id)
);

create table if not exists public.integration_product_mappings (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.integration_platforms(id) on delete cascade,
  external_product_id text not null,
  newvelion_product_id uuid not null references public.products(id) on delete restrict,
  external_seller_id uuid references public.integration_external_sellers(id) on delete cascade,
  sale_price numeric check (sale_price is null or sale_price >= 0),
  sale_currency text check (sale_currency is null or sale_currency in ('ZAR','MZN')),
  status text not null default 'active' check (status in ('active','inactive','revoked')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(platform_id, external_product_id, external_seller_id)
);

create unique index if not exists integration_product_mappings_unique_scope_idx
on public.integration_product_mappings(
  platform_id,
  external_product_id,
  coalesce(external_seller_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

create index if not exists integration_product_mappings_platform_product_idx
on public.integration_product_mappings(platform_id, external_product_id);

create table if not exists public.integration_orders (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.integration_platforms(id) on delete restrict,
  external_order_id text not null,
  external_seller_id uuid references public.integration_external_sellers(id) on delete restrict,
  status text not null default 'confirmed'
    check (status in ('pending','confirmed','processing','packed','shipped','in_transit','delivered','cancelled','failed','returned')),
  currency text not null check (currency in ('ZAR','MZN')),
  subtotal numeric not null default 0 check (subtotal >= 0),
  shipping_amount numeric not null default 0 check (shipping_amount >= 0),
  total numeric not null default 0 check (total >= 0),
  customer jsonb not null default '{}'::jsonb,
  shipping_address jsonb not null default '{}'::jsonb,
  tracking_number text,
  carrier text,
  tracking_url text,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(platform_id, external_order_id),
  unique(platform_id, idempotency_key)
);

create index if not exists integration_orders_platform_status_idx
on public.integration_orders(platform_id, status, created_at desc);

create table if not exists public.integration_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.integration_orders(id) on delete cascade,
  mapping_id uuid references public.integration_product_mappings(id) on delete set null,
  external_product_id text not null,
  newvelion_product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  sale_price numeric not null check (sale_price >= 0),
  currency text not null check (currency in ('ZAR','MZN')),
  newvelion_base_price numeric not null default 0,
  newvelion_cost_price numeric,
  product_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists integration_order_items_order_idx
on public.integration_order_items(order_id);

create table if not exists public.integration_webhook_events (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.integration_platforms(id) on delete cascade,
  event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','delivered','failed')),
  attempts integer not null default 0 check (attempts >= 0),
  last_attempt_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  response_status integer,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(platform_id, event_id)
);

create index if not exists integration_webhook_events_retry_idx
on public.integration_webhook_events(status, next_attempt_at);

create table if not exists public.integration_api_logs (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid references public.integration_platforms(id) on delete set null,
  request_id text not null,
  method text not null,
  path text not null,
  status_code integer not null,
  duration_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists integration_api_logs_platform_created_idx
on public.integration_api_logs(platform_id, created_at desc);

create table if not exists public.integration_rate_limit_buckets (
  platform_id uuid primary key references public.integration_platforms(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0)
);

alter table public.integration_platforms enable row level security;
alter table public.integration_external_sellers enable row level security;
alter table public.integration_product_mappings enable row level security;
alter table public.integration_orders enable row level security;
alter table public.integration_order_items enable row level security;
alter table public.integration_webhook_events enable row level security;
alter table public.integration_api_logs enable row level security;
alter table public.integration_rate_limit_buckets enable row level security;

create or replace function public.consume_integration_rate_limit(
  p_platform_id uuid,
  p_limit integer default 120,
  p_window_seconds integer default 60
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_bucket public.integration_rate_limit_buckets%rowtype;
begin
  if p_limit <= 0 or p_window_seconds <= 0 then return false; end if;

  insert into public.integration_rate_limit_buckets(platform_id, window_started_at, request_count)
  values (p_platform_id, v_now, 1)
  on conflict (platform_id) do nothing;

  select * into v_bucket
  from public.integration_rate_limit_buckets
  where platform_id = p_platform_id
  for update;

  if v_bucket.window_started_at <= v_now - make_interval(secs => p_window_seconds) then
    update public.integration_rate_limit_buckets
    set window_started_at = v_now, request_count = 1
    where platform_id = p_platform_id;
    return true;
  end if;

  if v_bucket.request_count >= p_limit then return false; end if;

  update public.integration_rate_limit_buckets
  set request_count = request_count + 1
  where platform_id = p_platform_id;

  return true;
end;
$$;

create or replace function public.create_integration_order(
  p_platform_id uuid,
  p_external_order_id text,
  p_external_seller_id uuid,
  p_currency text,
  p_items jsonb,
  p_customer jsonb,
  p_shipping_address jsonb,
  p_shipping_amount numeric default 0,
  p_metadata jsonb default '{}'::jsonb,
  p_idempotency_key text default null
)
returns table(order_id uuid, order_status text, order_total numeric, order_currency text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.integration_orders%rowtype;
  v_item jsonb;
  v_mapping public.integration_product_mappings%rowtype;
  v_product public.products%rowtype;
  v_quantity integer;
  v_sale_price numeric;
  v_subtotal numeric := 0;
  v_shipping numeric := greatest(coalesce(p_shipping_amount, 0), 0);
  v_total numeric;
  v_base_price numeric;
  v_effective_currency text;
begin
  if not exists (
    select 1 from public.integration_platforms
    where id = p_platform_id and status = 'active'
  ) then raise exception 'INVALID_PLATFORM'; end if;

  if nullif(trim(p_external_order_id), '') is null then raise exception 'INVALID_ORDER'; end if;
  if p_currency not in ('ZAR','MZN') then raise exception 'INVALID_CURRENCY'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'INVALID_ORDER'; end if;

  select * into v_order
  from public.integration_orders
  where platform_id = p_platform_id
    and (external_order_id = trim(p_external_order_id)
      or (p_idempotency_key is not null and idempotency_key = p_idempotency_key))
  limit 1;

  if v_order.id is not null then
    return query select v_order.id, v_order.status, v_order.total, v_order.currency;
    return;
  end if;

  if not exists (
    select 1 from public.integration_external_sellers
    where id = p_external_seller_id
      and platform_id = p_platform_id
      and status = 'active'
  ) then raise exception 'INVALID_SELLER'; end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := coalesce((v_item->>'quantity')::integer, 0);
    v_sale_price := coalesce((v_item->>'sale_price')::numeric, -1);

    if v_quantity <= 0 then raise exception 'INVALID_QUANTITY'; end if;
    if v_sale_price < 0 then raise exception 'INVALID_ORDER'; end if;

    select m.* into v_mapping
    from public.integration_product_mappings m
    where m.platform_id = p_platform_id
      and m.external_product_id = trim(coalesce(v_item->>'external_product_id',''))
      and m.status = 'active'
      and (m.external_seller_id is null or m.external_seller_id = p_external_seller_id)
    order by (m.external_seller_id is not null) desc
    limit 1;

    if v_mapping.id is null then raise exception 'PRODUCT_NOT_MAPPED'; end if;

    if (v_item ? 'newvelion_product_id')
      and (v_item->>'newvelion_product_id')::uuid <> v_mapping.newvelion_product_id
    then raise exception 'PRODUCT_NOT_MAPPED'; end if;

    select * into v_product
    from public.products p
    where p.id = v_mapping.newvelion_product_id
      and p.ativo = true
    for update;

    if v_product.id is null then raise exception 'PRODUCT_NOT_FOUND'; end if;
    if v_product.moeda <> p_currency then raise exception 'INVALID_CURRENCY'; end if;
    if v_product.estoque < v_quantity then raise exception 'PRODUCT_OUT_OF_STOCK'; end if;

    v_effective_currency := coalesce(v_mapping.sale_currency, v_product.moeda);
    if v_effective_currency <> p_currency then raise exception 'INVALID_CURRENCY'; end if;

    v_subtotal := v_subtotal + (v_sale_price * v_quantity);

    update public.products
    set estoque = estoque - v_quantity, updated_at = now()
    where id = v_product.id;
  end loop;

  v_total := v_subtotal + v_shipping;

  insert into public.integration_orders (
    platform_id, external_order_id, external_seller_id, status, currency,
    subtotal, shipping_amount, total, customer, shipping_address, metadata, idempotency_key
  )
  values (
    p_platform_id, trim(p_external_order_id), p_external_seller_id, 'confirmed', p_currency,
    v_subtotal, v_shipping, v_total, coalesce(p_customer, '{}'::jsonb),
    coalesce(p_shipping_address, '{}'::jsonb), coalesce(p_metadata, '{}'::jsonb), p_idempotency_key
  )
  returning * into v_order;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    v_sale_price := (v_item->>'sale_price')::numeric;

    select m.* into v_mapping
    from public.integration_product_mappings m
    where m.platform_id = p_platform_id
      and m.external_product_id = trim(coalesce(v_item->>'external_product_id',''))
      and m.status = 'active'
      and (m.external_seller_id is null or m.external_seller_id = p_external_seller_id)
    order by (m.external_seller_id is not null) desc
    limit 1;

    select * into v_product
    from public.products p where p.id = v_mapping.newvelion_product_id;

    v_base_price := case
      when v_product.preco_promocional is not null and v_product.preco_promocional > 0
        then v_product.preco_promocional
      else v_product.preco
    end;

    insert into public.integration_order_items (
      order_id, mapping_id, external_product_id, newvelion_product_id, quantity,
      sale_price, currency, newvelion_base_price, newvelion_cost_price, product_name, metadata
    )
    values (
      v_order.id, v_mapping.id, trim(v_item->>'external_product_id'), v_product.id,
      v_quantity, v_sale_price, p_currency, v_base_price, v_product.preco_custo,
      v_product.nome, coalesce(v_item->'metadata', '{}'::jsonb)
    );
  end loop;

  return query select v_order.id, v_order.status, v_order.total, v_order.currency;
end;
$$;

revoke execute on function public.create_integration_order(uuid,text,uuid,text,jsonb,jsonb,jsonb,numeric,jsonb,text) from public, anon, authenticated;
grant execute on function public.create_integration_order(uuid,text,uuid,text,jsonb,jsonb,jsonb,numeric,jsonb,text) to service_role;

revoke execute on function public.consume_integration_rate_limit(uuid,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_integration_rate_limit(uuid,integer,integer) to service_role;

create or replace function public.integration_touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists integration_platforms_touch_updated_at on public.integration_platforms;
create trigger integration_platforms_touch_updated_at before update on public.integration_platforms
for each row execute function public.integration_touch_updated_at();

drop trigger if exists integration_external_sellers_touch_updated_at on public.integration_external_sellers;
create trigger integration_external_sellers_touch_updated_at before update on public.integration_external_sellers
for each row execute function public.integration_touch_updated_at();

drop trigger if exists integration_product_mappings_touch_updated_at on public.integration_product_mappings;
create trigger integration_product_mappings_touch_updated_at before update on public.integration_product_mappings
for each row execute function public.integration_touch_updated_at();

drop trigger if exists integration_orders_touch_updated_at on public.integration_orders;
create trigger integration_orders_touch_updated_at before update on public.integration_orders
for each row execute function public.integration_touch_updated_at();

drop trigger if exists integration_webhook_events_touch_updated_at on public.integration_webhook_events;
create trigger integration_webhook_events_touch_updated_at before update on public.integration_webhook_events
for each row execute function public.integration_touch_updated_at();
