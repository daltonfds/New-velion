-- NewVelion pricing modes v1
-- fixed: admin/supplier controls selling price and commission
-- custom: seller/external platform controls selling price above the supplier/NewVelion base

alter table public.products
  add column if not exists pricing_mode text not null default 'fixed',
  add column if not exists custom_pricing_floor_zar numeric;

alter table public.products drop constraint if exists products_pricing_mode_check;
alter table public.products add constraint products_pricing_mode_check check (pricing_mode in ('fixed','custom'));
alter table public.products drop constraint if exists products_custom_pricing_floor_check;
alter table public.products add constraint products_custom_pricing_floor_check check (custom_pricing_floor_zar is null or custom_pricing_floor_zar > 0);

alter table public.affiliations
  add column if not exists pricing_mode text not null default 'fixed',
  add column if not exists base_price_zar numeric,
  add column if not exists seller_margin_zar numeric not null default 0,
  add column if not exists commission_snapshot_zar numeric not null default 0;

alter table public.affiliations drop constraint if exists affiliations_pricing_mode_check;
alter table public.affiliations add constraint affiliations_pricing_mode_check check (pricing_mode in ('fixed','custom'));

alter table public.checkout_sessions
  add column if not exists pricing_mode text not null default 'fixed',
  add column if not exists base_price_zar numeric not null default 0,
  add column if not exists seller_margin_zar numeric not null default 0,
  add column if not exists commission_snapshot_zar numeric not null default 0;

alter table public.sales
  add column if not exists affiliation_id uuid references public.affiliations(id) on delete set null,
  add column if not exists pricing_mode text not null default 'fixed',
  add column if not exists base_price_zar numeric not null default 0,
  add column if not exists seller_margin_zar numeric not null default 0,
  add column if not exists commission_snapshot_zar numeric not null default 0;

alter table public.integration_product_mappings
  add column if not exists pricing_mode text not null default 'inherit',
  add column if not exists base_price_zar numeric;

alter table public.integration_product_mappings drop constraint if exists integration_product_mappings_pricing_mode_check;
alter table public.integration_product_mappings add constraint integration_product_mappings_pricing_mode_check check (pricing_mode in ('inherit','fixed','custom'));

alter table public.integration_order_items
  add column if not exists pricing_mode text not null default 'fixed',
  add column if not exists base_price_zar numeric not null default 0,
  add column if not exists seller_margin_zar numeric not null default 0;

create or replace function private.product_pricing_snapshot(p_product_id uuid)
returns table(pricing_mode text,fixed_sale_price_zar numeric,base_price_zar numeric,commission_zar numeric,commission_type text)
language plpgsql security definer set search_path=''
as $function$
declare p public.products%rowtype; v_base numeric; v_fixed numeric; v_commission numeric;
begin
  select * into p from public.products where id=p_product_id and ativo=true and supplier_status='approved';
  if not found then raise exception 'PRODUCT_NOT_AVAILABLE'; end if;
  if p.moeda <> 'ZAR' then raise exception 'PRODUCT_CURRENCY_MUST_BE_ZAR'; end if;
  v_fixed:=case when coalesce(p.preco_promocional,0)>0 then p.preco_promocional else p.preco end;
  v_base:=coalesce(
    p.custom_pricing_floor_zar,p.supplier_min_selling_price,
    case
      when p.supplier_cost_currency='ZAR' then coalesce(p.supplier_cost_amount,0)
      when p.supplier_cost_currency='CNY' and coalesce(p.supplier_fx_rate_to_zar,0)>0 then coalesce(p.supplier_cost_amount,0)*p.supplier_fx_rate_to_zar
      else coalesce(p.preco_custo,0)
    end + coalesce(p.supplier_origin_shipping_cost,0)*case
      when p.supplier_origin_shipping_currency='CNY' and coalesce(p.supplier_fx_rate_to_zar,0)>0 then p.supplier_fx_rate_to_zar else 1 end
  );
  if p.pricing_mode='custom' and (v_base is null or v_base<=0) then raise exception 'CUSTOM_PRICING_BASE_NOT_CONFIGURED'; end if;
  if v_fixed is null or v_fixed<=0 then raise exception 'FIXED_SALE_PRICE_NOT_CONFIGURED'; end if;
  v_commission:=case when p.comissao_tipo='percentual' then round(v_fixed*p.comissao_valor/100,2) when p.comissao_tipo='fixo' then p.comissao_valor else 0 end;
  return query select p.pricing_mode,v_fixed,coalesce(v_base,0),greatest(coalesce(v_commission,0),0),p.comissao_tipo;
end;
$function$;

drop function if exists public.create_affiliation_with_price(uuid,numeric);
create function public.create_affiliation_with_price(p_product_id uuid,p_sale_price numeric default null)
returns table(affiliation_id uuid,affiliate_link text,sale_price numeric,pricing_mode text,base_price_zar numeric,seller_margin_zar numeric,commission_zar numeric,created boolean)
language plpgsql security definer set search_path=''
as $function$
declare v_user uuid:=auth.uid(); v_product public.products%rowtype; v_aff public.affiliations%rowtype; v_snapshot record; v_price numeric; v_margin numeric; v_commission numeric; v_created boolean:=false;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if not exists(select 1 from public.profiles where id=v_user and role='seller' and status='active') then raise exception 'SELLER_ACCESS_REQUIRED'; end if;
  select * into v_product from public.products where id=p_product_id and ativo=true and supplier_status='approved';
  if not found then raise exception 'PRODUCT_NOT_AVAILABLE'; end if;
  select * into v_snapshot from private.product_pricing_snapshot(p_product_id);
  if v_product.pricing_mode='fixed' then
    v_price:=v_snapshot.fixed_sale_price_zar;
    if p_sale_price is not null and abs(p_sale_price-v_price)>0.01 then raise exception 'FIXED_PRICING_DOES_NOT_ALLOW_CUSTOM_PRICE'; end if;
    v_margin:=greatest(v_price-v_snapshot.base_price_zar,0); v_commission:=v_snapshot.commission_zar;
  else
    v_price:=p_sale_price;
    if v_price is null or v_price<=0 then raise exception 'SALE_PRICE_REQUIRED_FOR_CUSTOM_PRICING'; end if;
    if v_price<v_snapshot.base_price_zar then raise exception 'SALE_PRICE_BELOW_BASE_PRICE'; end if;
    v_margin:=round(v_price-v_snapshot.base_price_zar,2); v_commission:=v_margin;
  end if;
  select * into v_aff from public.affiliations where vendedor_id=v_user and product_id=p_product_id order by created_at desc limit 1 for update;
  if v_aff.id is not null then
    update public.affiliations set sale_price=v_price,pricing_mode=v_product.pricing_mode,base_price_zar=v_snapshot.base_price_zar,seller_margin_zar=v_margin,commission_snapshot_zar=v_commission,ativo=true where id=v_aff.id returning * into v_aff;
  else
    insert into public.affiliations(vendedor_id,product_id,sale_price,pricing_mode,base_price_zar,seller_margin_zar,commission_snapshot_zar,ativo) values(v_user,p_product_id,v_price,v_product.pricing_mode,v_snapshot.base_price_zar,v_margin,v_commission,true) returning * into v_aff;
    v_created:=true;
  end if;
  return query select v_aff.id,v_aff.link_unico,v_aff.sale_price,v_aff.pricing_mode,v_aff.base_price_zar,v_aff.seller_margin_zar,v_aff.commission_snapshot_zar,v_created;
end;
$function$;
revoke execute on function public.create_affiliation_with_price(uuid,numeric) from public,anon;
grant execute on function public.create_affiliation_with_price(uuid,numeric) to authenticated;

create or replace function private.calculate_sale_financials()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare p public.products%rowtype; s public.platform_settings%rowtype; a public.affiliations%rowtype; v_desired numeric; v_max_commission numeric; v_cost_zar numeric; v_base numeric;
begin
  select * into p from public.products where id=new.product_id for share;
  if not found then raise exception 'Product not found'; end if;
  if new.vendedor_id=p.created_by then raise exception 'Self-referral is not allowed'; end if;
  select * into s from public.platform_settings where id=true;
  v_base:=coalesce(nullif(new.product_amount,0),new.valor_venda-coalesce(new.shipping_amount,0)); new.product_amount:=greatest(v_base,0);
  new.taxa_gateway:=round(new.valor_venda*0.10,2);
  new.taxa_plataforma:=round(new.valor_venda*coalesce(s.transaction_fee_percent,10)/100,2);
  v_cost_zar:=greatest(coalesce(new.supplier_cost_zar,greatest(coalesce(p.preco_custo,0),0)*greatest(coalesce(new.quantity,1),1)),0);
  if new.affiliation_id is not null then
    select * into a from public.affiliations where id=new.affiliation_id for share;
    if a.id is null or a.vendedor_id<>new.vendedor_id or a.product_id<>new.product_id then raise exception 'AFFILIATION_MISMATCH'; end if;
    new.pricing_mode:=a.pricing_mode; new.base_price_zar:=coalesce(a.base_price_zar,0); new.seller_margin_zar:=greatest(round(new.valor_venda-new.base_price_zar,2),0); new.commission_snapshot_zar:=greatest(coalesce(a.commission_snapshot_zar,0),0);
    v_desired:=case when a.pricing_mode='custom' then new.seller_margin_zar else new.commission_snapshot_zar end;
  elsif new.pricing_mode='custom' then v_desired:=greatest(coalesce(new.seller_margin_zar,0),0);
  elsif p.comissao_tipo='percentual' then v_desired:=round(new.product_amount*p.comissao_valor/100,2);
  else v_desired:=round(p.comissao_valor*greatest(coalesce(new.quantity,1),1),2);
  end if;
  v_max_commission:=greatest(0,new.valor_venda-v_cost_zar-new.taxa_gateway-new.taxa_plataforma);
  new.comissao_vendedor:=least(greatest(v_desired,0),v_max_commission);
  new.ganho_plataforma:=greatest(0,new.valor_venda-new.taxa_gateway-new.comissao_vendedor-v_cost_zar);
  new.valor_garantia:=round(new.comissao_vendedor*0.10,2);
  new.garantia_libera_em:=coalesce(new.garantia_libera_em,new.vendido_em+make_interval(days=>coalesce(s.hold_days,7)));
  return new;
end;
$function$;


-- Correct base precedence: explicit floor/minimum wins; supplier cost + origin shipping is the fallback.
create or replace function private.product_pricing_snapshot(p_product_id uuid)
returns table(pricing_mode text,fixed_sale_price_zar numeric,base_price_zar numeric,commission_zar numeric,commission_type text)
language plpgsql security definer set search_path=''
as $function$
declare p public.products%rowtype; v_fixed numeric; v_base numeric; v_cost numeric; v_shipping numeric; v_commission numeric;
begin
 select * into p from public.products where id=p_product_id and ativo=true and supplier_status='approved';
 if not found then raise exception 'PRODUCT_NOT_AVAILABLE'; end if;
 if p.moeda<>'ZAR' then raise exception 'PRODUCT_CURRENCY_MUST_BE_ZAR'; end if;
 v_fixed:=case when coalesce(p.preco_promocional,0)>0 then p.preco_promocional else p.preco end;
 if p.custom_pricing_floor_zar is not null then v_base:=p.custom_pricing_floor_zar;
 elsif p.supplier_min_selling_price is not null then v_base:=p.supplier_min_selling_price;
 else
   v_cost:=case when p.supplier_cost_currency='CNY' and coalesce(p.supplier_fx_rate_to_zar,0)>0 then coalesce(p.supplier_cost_amount,0)*p.supplier_fx_rate_to_zar when p.supplier_cost_currency='ZAR' then coalesce(p.supplier_cost_amount,0) else coalesce(p.preco_custo,0) end;
   v_shipping:=coalesce(p.supplier_origin_shipping_cost,0)*case when p.supplier_origin_shipping_currency='CNY' and coalesce(p.supplier_fx_rate_to_zar,0)>0 then p.supplier_fx_rate_to_zar else 1 end;
   v_base:=v_cost+v_shipping;
 end if;
 if p.pricing_mode='custom' and coalesce(v_base,0)<=0 then raise exception 'CUSTOM_PRICING_BASE_NOT_CONFIGURED'; end if;
 if coalesce(v_fixed,0)<=0 then raise exception 'FIXED_SALE_PRICE_NOT_CONFIGURED'; end if;
 v_commission:=case when p.comissao_tipo='percentual' then round(v_fixed*p.comissao_valor/100,2) when p.comissao_tipo='fixo' then greatest(p.comissao_valor,0) else 0 end;
 return query select p.pricing_mode,v_fixed,greatest(coalesce(v_base,0),0),greatest(coalesce(v_commission,0),0),p.comissao_tipo;
end;
$function$;
