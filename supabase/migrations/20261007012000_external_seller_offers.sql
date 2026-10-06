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
  offer_token text not null unique default encode(gen_random_bytes(18),'hex'),
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

create or replace function public.create_external_seller_offer(
 p_platform_id uuid,p_external_seller_id uuid,p_newvelion_product_id uuid,p_mapping_id uuid,p_pricing_mode text,p_sale_price numeric
)
returns table(offer_id uuid,offer_token text,pricing_mode text,sale_price numeric,base_price_zar numeric,seller_margin_zar numeric,commission_snapshot_zar numeric,currency text,sales_url text)
language plpgsql security definer set search_path=''
as $function$
declare p public.products%rowtype; m public.integration_product_mappings%rowtype; s public.integration_external_sellers%rowtype; v_fixed numeric; v_base numeric; v_commission numeric; v_margin numeric; v_mode text:=trim(p_pricing_mode); o public.integration_external_offers%rowtype;
begin
 if not exists(select 1 from public.integration_platforms where id=p_platform_id and status='active') then raise exception 'INVALID_PLATFORM'; end if;
 select * into s from public.integration_external_sellers where id=p_external_seller_id and platform_id=p_platform_id;
 if not found or s.status<>'active' then raise exception 'INVALID_SELLER'; end if;
 select * into p from public.products where id=p_newvelion_product_id and ativo=true and supplier_status='approved' and moeda='ZAR';
 if not found then raise exception 'PRODUCT_NOT_AVAILABLE'; end if;
 if p_mapping_id is not null then
   select * into m from public.integration_product_mappings where id=p_mapping_id and platform_id=p_platform_id and newvelion_product_id=p_newvelion_product_id and status='active';
   if not found then raise exception 'PRODUCT_NOT_MAPPED'; end if;
   if m.external_seller_id is not null and m.external_seller_id<>p_external_seller_id then raise exception 'MAPPING_SELLER_MISMATCH'; end if;
 end if;
 if v_mode not in ('fixed','custom') then raise exception 'INVALID_PRICING_MODE'; end if;
 v_fixed:=case when coalesce(p.preco_promocional,0)>0 then p.preco_promocional else p.preco end;
 if p.custom_pricing_floor_zar is not null then v_base:=p.custom_pricing_floor_zar;
 elsif p.supplier_min_selling_price is not null then v_base:=p.supplier_min_selling_price;
 else
   v_base:=case when p.supplier_cost_currency='CNY' and coalesce(p.supplier_fx_rate_to_zar,0)>0 then coalesce(p.supplier_cost_amount,0)*p.supplier_fx_rate_to_zar when p.supplier_cost_currency='ZAR' then coalesce(p.supplier_cost_amount,0) else coalesce(p.preco_custo,0) end;
   v_base:=v_base+coalesce(p.supplier_origin_shipping_cost,0)*case when p.supplier_origin_shipping_currency='CNY' and coalesce(p.supplier_fx_rate_to_zar,0)>0 then p.supplier_fx_rate_to_zar else 1 end;
 end if;
 if coalesce(v_base,0)<0 then raise exception 'PRICING_BASE_NOT_CONFIGURED'; end if;
 if v_mode='fixed' then
   if p_sale_price is null or abs(p_sale_price-v_fixed)>0.01 then raise exception 'FIXED_PRICE_MISMATCH'; end if;
   v_margin:=greatest(round(v_fixed-v_base,2),0);
   v_commission:=case when p.comissao_tipo='percentual' then round(v_fixed*p.comissao_valor/100,2) when p.comissao_tipo='fixo' then greatest(p.comissao_valor,0) else 0 end;
 else
   if p_sale_price is null or p_sale_price<v_base then raise exception 'SALE_PRICE_BELOW_BASE_PRICE'; end if;
   v_margin:=round(p_sale_price-v_base,2); v_commission:=v_margin;
 end if;
 insert into public.integration_external_offers(platform_id,external_seller_id,newvelion_product_id,mapping_id,pricing_mode,sale_price,base_price_zar,seller_margin_zar,commission_snapshot_zar,currency,status)
 values(p_platform_id,p_external_seller_id,p_newvelion_product_id,p_mapping_id,v_mode,p_sale_price,round(v_base,2),v_margin,v_commission,'ZAR','active') returning * into o;
 return query select o.id,o.offer_token,o.pricing_mode,o.sale_price,o.base_price_zar,o.seller_margin_zar,o.commission_snapshot_zar,o.currency,'/oferta/'||o.offer_token;
end;
$function$;
revoke execute on function public.create_external_seller_offer(uuid,uuid,uuid,uuid,text,numeric) from public,anon,authenticated;
grant execute on function public.create_external_seller_offer(uuid,uuid,uuid,uuid,text,numeric) to service_role;
