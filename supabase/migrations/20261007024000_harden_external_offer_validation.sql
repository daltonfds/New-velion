-- Harden external seller offer validation and idempotent reuse

create unique index if not exists integration_external_offers_active_scope_key
on public.integration_external_offers(platform_id, external_seller_id, mapping_id, pricing_mode, sale_price)
where status='active';

-- The database remains the source of truth for fixed/custom pricing.
-- Existing offers are reused when the same active seller/mapping/pricing/price
-- combination is requested, preventing duplicate active offers.

create or replace function public.create_external_seller_offer(
 p_platform_id uuid,p_external_seller_id uuid,p_newvelion_product_id uuid,p_mapping_id uuid,p_pricing_mode text,p_sale_price numeric
)
returns table(offer_id uuid,offer_token text,pricing_mode text,sale_price numeric,base_price_zar numeric,seller_margin_zar numeric,commission_snapshot_zar numeric,currency text,sales_url text)
language plpgsql security definer set search_path=''
as $function$
declare
 p public.products%rowtype;
 m public.integration_product_mappings%rowtype;
 s public.integration_external_sellers%rowtype;
 v_fixed numeric;
 v_base numeric;
 v_commission numeric;
 v_margin numeric;
 v_mode text:=trim(lower(coalesce(p_pricing_mode,'')));
 o public.integration_external_offers%rowtype;
begin
 if not exists(select 1 from public.integration_platforms where id=p_platform_id and status='active') then raise exception 'INVALID_PLATFORM'; end if;

 select * into s from public.integration_external_sellers where id=p_external_seller_id and platform_id=p_platform_id;
 if not found or s.status<>'active' then raise exception 'INVALID_SELLER'; end if;

 select * into p from public.products where id=p_newvelion_product_id and ativo=true and supplier_status='approved' and moeda='ZAR';
 if not found then raise exception 'PRODUCT_NOT_AVAILABLE'; end if;

 if p_mapping_id is null then raise exception 'PRODUCT_NOT_MAPPED'; end if;

 select * into m from public.integration_product_mappings
 where id=p_mapping_id and platform_id=p_platform_id and newvelion_product_id=p_newvelion_product_id and status='active';
 if not found then raise exception 'PRODUCT_NOT_MAPPED'; end if;

 if m.external_seller_id is not null and m.external_seller_id<>p_external_seller_id then raise exception 'MAPPING_SELLER_MISMATCH'; end if;

 if v_mode='inherit' then
   v_mode:=coalesce(nullif(trim(lower(m.pricing_mode)),''),trim(lower(coalesce(p.pricing_mode,'fixed'))));
 end if;

 if v_mode not in ('fixed','custom') then raise exception 'INVALID_PRICING_MODE'; end if;

 v_fixed:=case when coalesce(p.preco_promocional,0)>0 then p.preco_promocional else p.preco end;

 if m.base_price_zar is not null and m.base_price_zar>0 then
   v_base:=m.base_price_zar;
 elsif p.custom_pricing_floor_zar is not null then
   v_base:=p.custom_pricing_floor_zar;
 elsif p.supplier_min_selling_price is not null then
   v_base:=p.supplier_min_selling_price;
 else
   v_base:=case
     when p.supplier_cost_currency='CNY' and coalesce(p.supplier_fx_rate_to_zar,0)>0 then coalesce(p.supplier_cost_amount,0)*p.supplier_fx_rate_to_zar
     when p.supplier_cost_currency='ZAR' then coalesce(p.supplier_cost_amount,0)
     else coalesce(p.preco_custo,0)
   end;
   v_base:=v_base+coalesce(p.supplier_origin_shipping_cost,0)*
     case when p.supplier_origin_shipping_currency='CNY' and coalesce(p.supplier_fx_rate_to_zar,0)>0 then p.supplier_fx_rate_to_zar else 1 end;
 end if;

 if coalesce(v_base,0)<0 then raise exception 'PRICING_BASE_NOT_CONFIGURED'; end if;

 if v_mode='fixed' then
   if p_sale_price is null or abs(p_sale_price-v_fixed)>0.01 then raise exception 'FIXED_PRICE_MISMATCH'; end if;
   v_margin:=greatest(round(v_fixed-v_base,2),0);
   v_commission:=case
     when p.comissao_tipo='percentual' then round(v_fixed*p.comissao_valor/100,2)
     when p.comissao_tipo='fixo' then greatest(p.comissao_valor,0)
     else 0
   end;
 else
   if p_sale_price is null or p_sale_price<v_base then raise exception 'SALE_PRICE_BELOW_BASE_PRICE'; end if;
   v_margin:=round(p_sale_price-v_base,2);
   v_commission:=v_margin;
 end if;

 select * into o from public.integration_external_offers
 where platform_id=p_platform_id and external_seller_id=p_external_seller_id and mapping_id=p_mapping_id
   and pricing_mode=v_mode and status='active' and abs(sale_price-p_sale_price)<=0.01
 limit 1;

 if found then
   return query select o.id,o.offer_token,o.pricing_mode,o.sale_price,o.base_price_zar,o.seller_margin_zar,o.commission_snapshot_zar,o.currency,'/oferta/'||o.offer_token;
   return;
 end if;

 begin
   insert into public.integration_external_offers(
     platform_id,external_seller_id,newvelion_product_id,mapping_id,pricing_mode,sale_price,
     base_price_zar,seller_margin_zar,commission_snapshot_zar,currency,status
   )
   values(
     p_platform_id,p_external_seller_id,p_newvelion_product_id,p_mapping_id,v_mode,round(p_sale_price,2),
     round(v_base,2),v_margin,v_commission,'ZAR','active'
   )
   returning * into o;
 exception when unique_violation then
   select * into o from public.integration_external_offers
   where platform_id=p_platform_id and external_seller_id=p_external_seller_id and mapping_id=p_mapping_id
     and pricing_mode=v_mode and status='active' and abs(sale_price-p_sale_price)<=0.01
   limit 1;
   if not found then raise; end if;
 end;

 return query select o.id,o.offer_token,o.pricing_mode,o.sale_price,o.base_price_zar,o.seller_margin_zar,o.commission_snapshot_zar,o.currency,'/oferta/'||o.offer_token;
end;
$function$;

revoke execute on function public.create_external_seller_offer(uuid,uuid,uuid,uuid,text,numeric) from public,anon,authenticated;
grant execute on function public.create_external_seller_offer(uuid,uuid,uuid,uuid,text,numeric) to service_role;

create or replace function public.create_integration_order_from_offer(
 p_platform_id uuid,p_external_order_id text,p_external_seller_id uuid,p_external_offer_id uuid,p_currency text,p_items jsonb,p_customer jsonb,
 p_shipping_address jsonb,p_shipping_amount numeric,p_metadata jsonb,p_idempotency_key text
)
returns table(order_id uuid,order_status text,order_total numeric,order_currency text)
language plpgsql security definer set search_path=''
as $function$
declare
 o public.integration_external_offers%rowtype;
 m public.integration_product_mappings%rowtype;
 i jsonb;
 v_result record;
 v_customer_country text;
 v_shipping_country text;
begin
 select * into o from public.integration_external_offers
 where id=p_external_offer_id and platform_id=p_platform_id and external_seller_id=p_external_seller_id and status='active' for share;
 if not found then raise exception 'OFFER_NOT_FOUND'; end if;

 if p_currency<>'ZAR' then raise exception 'CUSTOMER_CURRENCY_MUST_BE_ZAR'; end if;

 v_customer_country:=upper(trim(coalesce(p_customer->>'country_code',p_customer->>'country','')));
 v_shipping_country:=upper(trim(coalesce(p_shipping_address->>'country_code',p_shipping_address->>'country','')));
 if v_customer_country<>'ZA' or v_shipping_country<>'ZA' then raise exception 'CUSTOMER_COUNTRY_MUST_BE_ZA'; end if;

 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'INVALID_ORDER'; end if;

 select * into m from public.integration_product_mappings
 where id=o.mapping_id and platform_id=p_platform_id and newvelion_product_id=o.newvelion_product_id and status='active';
 if not found then raise exception 'PRODUCT_NOT_MAPPED'; end if;

 if m.external_seller_id is not null and m.external_seller_id<>p_external_seller_id then raise exception 'MAPPING_SELLER_MISMATCH'; end if;

 for i in select value from jsonb_array_elements(p_items) loop
   if coalesce((i->>'quantity')::integer,0)<=0 then raise exception 'INVALID_QUANTITY'; end if;
   if coalesce((i->>'sale_price')::numeric,0)<=0 then raise exception 'INVALID_ORDER'; end if;
   if abs((i->>'sale_price')::numeric-o.sale_price)>0.01 then raise exception 'OFFER_PRICE_MISMATCH'; end if;
   if trim(coalesce(i->>'external_product_id',''))<>m.external_product_id then raise exception 'OFFER_PRODUCT_MISMATCH'; end if;
   if nullif(trim(coalesce(i->>'newvelion_product_id','')),'') is not null
      and (i->>'newvelion_product_id')::uuid<>o.newvelion_product_id then raise exception 'OFFER_PRODUCT_MISMATCH'; end if;
 end loop;

 select * into v_result from public.create_integration_order(
   p_platform_id,p_external_order_id,p_external_seller_id,p_currency,p_items,p_customer,p_shipping_address,
   p_shipping_amount,p_metadata,p_idempotency_key
 );

 update public.integration_orders set external_offer_id=o.id,customer_country_code='ZA' where id=v_result.order_id;
 update public.integration_order_items set external_offer_id=o.id where order_id=v_result.order_id;

 return query select v_result.order_id,v_result.order_status,v_result.order_total,v_result.order_currency;
end;
$function$;

revoke execute on function public.create_integration_order_from_offer(uuid,text,uuid,uuid,text,jsonb,jsonb,jsonb,numeric,jsonb,text) from public,anon,authenticated;
grant execute on function public.create_integration_order_from_offer(uuid,text,uuid,uuid,text,jsonb,jsonb,jsonb,numeric,jsonb,text) to service_role;
