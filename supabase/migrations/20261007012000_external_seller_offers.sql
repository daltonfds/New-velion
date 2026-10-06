-- NewVelion external seller offers
create table if not exists public.integration_external_offers (
  id uuid primary key default gen_random_uuid(),
  platform_id uuid not null references public.integration_platforms(id) on delete cascade,
  external_seller_id uuid not null references public.integration_external_sellers(id) on delete cascade,
  newvelion_product_id uuid not null references public.products(id) on delete restrict,
  mapping_id uuid references public.integration_product_mappings(id) on delete set null,
  pricing_mode text not null check (pricing_mode in ('fixed','custom')),
  sale_price numeric not null check (sale_price > 0),
  base_price_zar numeric not null check (base_price_zar >= 0),
  seller_margin_zar numeric not null default 0 check (seller_margin_zar >= 0),
  commission_snapshot_zar numeric not null default 0 check (commission_snapshot_zar >= 0),
  currency text not null default 'ZAR' check (currency = 'ZAR'),
  offer_token text not null unique default encode(gen_random_bytes(18),'base64url'),
  status text not null default 'active' check (status in ('active','paused','revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists integration_external_offers_platform_seller_idx on public.integration_external_offers(platform_id, external_seller_id);
create index if not exists integration_external_offers_product_idx on public.integration_external_offers(newvelion_product_id);
create index if not exists integration_external_offers_token_idx on public.integration_external_offers(offer_token);
alter table public.integration_external_offers enable row level security;
drop policy if exists "integration_external_offers_no_direct_access" on public.integration_external_offers;
create policy "integration_external_offers_no_direct_access" on public.integration_external_offers for all to anon, authenticated using (false) with check (false);
create or replace function private.resolve_external_offer(p_offer_token text)
returns table(offer_id uuid,platform_id uuid,external_seller_id uuid,newvelion_product_id uuid,pricing_mode text,sale_price numeric,base_price_zar numeric,seller_margin_zar numeric,commission_snapshot_zar numeric,currency text)
language sql security definer set search_path=''
as $function$
 select o.id,o.platform_id,o.external_seller_id,o.newvelion_product_id,o.pricing_mode,o.sale_price,o.base_price_zar,o.seller_margin_zar,o.commission_snapshot_zar,o.currency
 from public.integration_external_offers o
 join public.integration_platforms p on p.id=o.platform_id and p.status='active'
 join public.integration_external_sellers s on s.id=o.external_seller_id and s.status='active'
 join public.products pr on pr.id=o.newvelion_product_id and pr.ativo=true and pr.supplier_status='approved' and pr.moeda='ZAR'
 where o.offer_token=trim(p_offer_token) and o.status='active' limit 1;
$function$;
revoke execute on function private.resolve_external_offer(text) from public,anon,authenticated;
grant execute on function private.resolve_external_offer(text) to service_role;