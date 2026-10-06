-- Pricing mode runtime guards for checkout and integrations

create or replace function private.normalize_integration_product_mapping()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare v_snapshot record; v_product public.products%rowtype;
begin
  select * into v_product from public.products where id=new.newvelion_product_id and ativo=true and supplier_status='approved' and moeda='ZAR';
  if not found then raise exception 'PRODUCT_NOT_AVAILABLE'; end if;
  select * into v_snapshot from private.product_pricing_snapshot(v_product.id);
  new.base_price_zar:=v_snapshot.base_price_zar;
  if new.pricing_mode='inherit' then new.pricing_mode:=v_product.pricing_mode; end if;
  if new.pricing_mode='fixed' then
    if new.sale_price is null then new.sale_price:=v_snapshot.fixed_sale_price_zar; end if;
    if v_product.pricing_mode='fixed' and abs(new.sale_price-v_snapshot.fixed_sale_price_zar)>0.01 then raise exception 'FIXED_PRICE_MISMATCH'; end if;
  end if;
  if new.pricing_mode='custom' and new.sale_price is not null and new.sale_price<new.base_price_zar then raise exception 'SALE_PRICE_BELOW_BASE_PRICE'; end if;
  new.sale_currency:='ZAR';
  return new;
end;
$function$;

drop trigger if exists integration_product_mapping_pricing_guard on public.integration_product_mappings;
create trigger integration_product_mapping_pricing_guard
before insert or update of newvelion_product_id,pricing_mode,sale_price
on public.integration_product_mappings
for each row execute function private.normalize_integration_product_mapping();

drop function if exists public.create_public_checkout_session(text,text,text,text,text,text,text,text,text,text,text);
create function public.create_public_checkout_session(
  p_affiliate_link text,p_full_name text,p_phone text,p_whatsapp text,p_email text,
  p_country text,p_province text,p_city text,p_postal_code text,p_address text,p_address_reference text
)
returns table(session_id uuid,checkout_url text)
language plpgsql security definer set search_path=''
as $function$
declare v_link text:=regexp_replace(regexp_replace(coalesce(p_affiliate_link,''),'^https?://[^/]+',''),'^/+','');
v_link_code text; v_affiliation public.affiliations%rowtype; v_product public.products%rowtype; v_snapshot record; v_session uuid;
begin
  v_link:=split_part(split_part(v_link,'?',1),'#',1); v_link_code:=regexp_replace(v_link,'^go/',''); v_link_code:=regexp_replace(v_link_code,'/+$',''); v_link:='go/'||trim(v_link_code);
  if v_link_code='' then raise exception 'INVALID_AFFILIATE_LINK'; end if;
  select a.* into v_affiliation from public.affiliations a where a.link_unico=v_link and a.ativo=true limit 1;
  if v_affiliation.id is null then raise exception 'INVALID_AFFILIATE_LINK'; end if;
  select p.* into v_product from public.products p where p.id=v_affiliation.product_id and p.ativo=true and p.supplier_status='approved' and p.moeda='ZAR' and p.checkout_url is not null and p.checkout_url~'^https?://' limit 1;
  if v_product.id is null then raise exception 'PRODUCT_UNAVAILABLE_FOR_CHECKOUT'; end if;
  if v_product.pricing_mode<>v_affiliation.pricing_mode then raise exception 'AFFILIATE_OFFER_OUTDATED'; end if;
  select * into v_snapshot from private.product_pricing_snapshot(v_product.id);
  if v_affiliation.pricing_mode='fixed' and abs(v_affiliation.sale_price-v_snapshot.fixed_sale_price_zar)>0.01 then raise exception 'AFFILIATE_OFFER_OUTDATED'; end if;
  if v_affiliation.pricing_mode='custom' and v_affiliation.sale_price<v_snapshot.base_price_zar then raise exception 'AFFILIATE_OFFER_OUTDATED'; end if;
  if nullif(trim(coalesce(p_full_name,'')),'') is null or nullif(trim(coalesce(p_phone,'')),'') is null or upper(trim(coalesce(p_country,'')))<>'ZA' or nullif(trim(coalesce(p_province,'')),'') is null or nullif(trim(coalesce(p_city,'')),'') is null or nullif(trim(coalesce(p_address,'')),'') is null then raise exception 'CUSTOMER_MUST_BE_IN_SOUTH_AFRICA'; end if;
  insert into public.checkout_sessions(
    affiliation_id,product_id,seller_id,affiliate_link,full_name,phone,whatsapp,email,country,province,city,postal_code,address,address_reference,
    amount,currency,checkout_url,status,customer_country_code,supplier_country_code,supplier_cost_currency,supplier_cost_amount,
    supplier_fx_rate_to_zar,supplier_fx_rate_captured_at,supplier_cost_zar,supplier_origin_shipping_cost,supplier_origin_shipping_currency,
    pricing_mode,base_price_zar,seller_margin_zar,commission_snapshot_zar
  )
  values(
    v_affiliation.id,v_product.id,v_affiliation.vendedor_id,v_affiliation.link_unico,trim(p_full_name),trim(p_phone),
    nullif(trim(coalesce(p_whatsapp,'')),''),nullif(trim(coalesce(p_email,'')),''),'ZA',trim(p_province),trim(p_city),
    nullif(trim(coalesce(p_postal_code,'')),''),trim(p_address),nullif(trim(coalesce(p_address_reference,'')),''),
    v_affiliation.sale_price,'ZAR',v_product.checkout_url,'pending','ZA',v_product.supplier_country_code,v_product.supplier_cost_currency,
    v_product.supplier_cost_amount,v_product.supplier_fx_rate_to_zar,v_product.supplier_fx_rate_captured_at,
    case when v_product.supplier_cost_currency='CNY' then v_product.supplier_cost_amount*v_product.supplier_fx_rate_to_zar else v_product.supplier_cost_amount end,
    v_product.supplier_origin_shipping_cost,v_product.supplier_origin_shipping_currency,v_affiliation.pricing_mode,
    v_affiliation.base_price_zar,v_affiliation.seller_margin_zar,v_affiliation.commission_snapshot_zar
  ) returning id into v_session;
  return query select v_session,v_product.checkout_url;
end;
$function$;
revoke execute on function public.create_public_checkout_session(text,text,text,text,text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.create_public_checkout_session(text,text,text,text,text,text,text,text,text,text,text) to anon,authenticated;

drop function if exists public.approve_checkout_session(uuid);
create function public.approve_checkout_session(p_session_id uuid)
returns table(sale_id uuid)
language plpgsql security definer set search_path=''
as $function$
declare s public.checkout_sessions%rowtype; new_sale_id uuid;
begin
  if not (select private.is_admin_user()) then raise exception 'Forbidden'; end if;
  select * into s from public.checkout_sessions where id=p_session_id for update;
  if not found then raise exception 'Checkout session not found'; end if;
  if s.status='approved' then select id into new_sale_id from public.sales where gateway_ref='newvelion_checkout:'||s.id limit 1; return query select new_sale_id; return; end if;
  if s.status<>'paid_pending_review' or s.payment_comparison_status<>'matched' then raise exception 'Payment must be registered and matched before approval'; end if;
  insert into public.sales(
    affiliation_id,vendedor_id,product_id,quantity,product_amount,shipping_amount,valor_venda,gateway_ref,vendido_em,currency,customer_country_code,
    supplier_country_code,supplier_cost_currency,supplier_cost_amount,supplier_fx_rate_to_zar,supplier_fx_rate_captured_at,supplier_cost_zar,
    supplier_origin_shipping_cost,supplier_origin_shipping_currency,pricing_mode,base_price_zar,seller_margin_zar,commission_snapshot_zar
  )
  values(
    s.affiliation_id,s.seller_id,s.product_id,greatest(s.quantity,1),s.product_amount,s.shipping_amount,s.amount,'newvelion_checkout:'||s.id,
    coalesce(s.external_payment_paid_at,now()),'ZAR','ZA',s.supplier_country_code,s.supplier_cost_currency,s.supplier_cost_amount,
    s.supplier_fx_rate_to_zar,s.supplier_fx_rate_captured_at,s.supplier_cost_zar,s.supplier_origin_shipping_cost,
    s.supplier_origin_shipping_currency,s.pricing_mode,s.base_price_zar,s.seller_margin_zar,s.commission_snapshot_zar
  ) returning id into new_sale_id;
  update public.checkout_sessions set status='approved',updated_at=now() where id=s.id;
  perform public.create_sale_fulfillment(new_sale_id);
  return query select new_sale_id;
end;
$function$;
revoke execute on function public.approve_checkout_session(uuid) from public,anon,authenticated;
grant execute on function public.approve_checkout_session(uuid) to authenticated,service_role;

drop function if exists public.create_integration_order(uuid,text,uuid,text,jsonb,jsonb,jsonb,numeric,jsonb,text);
create function public.create_integration_order(
  p_platform_id uuid,p_external_order_id text,p_external_seller_id uuid,p_currency text,p_items jsonb,p_customer jsonb,
  p_shipping_address jsonb,p_shipping_amount numeric default 0,p_metadata jsonb default '{}'::jsonb,p_idempotency_key text default null
)
returns table(order_id uuid,order_status text,order_total numeric,order_currency text)
language plpgsql security definer set search_path=''
as $function$
declare v_order public.integration_orders%rowtype; v_item jsonb; v_mapping public.integration_product_mappings%rowtype; v_product public.products%rowtype;
v_quantity integer; v_sale_price numeric; v_base_price numeric; v_item_margin numeric; v_subtotal numeric:=0; v_shipping numeric:=greatest(coalesce(p_shipping_amount,0),0);
v_total numeric; v_mode text; v_cost_zar numeric; v_supplier_cost numeric:=0; v_seller_margin numeric:=0; v_base_total numeric:=0;
begin
  if not exists(select 1 from public.integration_platforms where id=p_platform_id and status='active') then raise exception 'INVALID_PLATFORM'; end if;
  if nullif(trim(p_external_order_id),'') is null then raise exception 'INVALID_ORDER'; end if;
  if p_currency<>'ZAR' then raise exception 'CUSTOMER_CURRENCY_MUST_BE_ZAR'; end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'INVALID_ORDER'; end if;
  select * into v_order from public.integration_orders where platform_id=p_platform_id and (external_order_id=trim(p_external_order_id) or (p_idempotency_key is not null and idempotency_key=p_idempotency_key)) limit 1;
  if v_order.id is not null then return query select v_order.id,v_order.status,v_order.total,v_order.currency; return; end if;
  if not exists(select 1 from public.integration_external_sellers where id=p_external_seller_id and platform_id=p_platform_id and status='active') then raise exception 'INVALID_SELLER'; end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_quantity:=coalesce((v_item->>'quantity')::integer,0); v_sale_price:=coalesce((v_item->>'sale_price')::numeric,-1);
    if v_quantity<=0 or v_sale_price<=0 then raise exception 'INVALID_ORDER'; end if;
    select m.* into v_mapping from public.integration_product_mappings m where m.platform_id=p_platform_id and m.external_product_id=trim(coalesce(v_item->>'external_product_id','')) and m.status='active' and (m.external_seller_id is null or m.external_seller_id=p_external_seller_id) order by (m.external_seller_id is not null) desc limit 1;
    if v_mapping.id is null then raise exception 'PRODUCT_NOT_MAPPED'; end if;
    select * into v_product from public.products p where p.id=v_mapping.newvelion_product_id and p.ativo=true and p.supplier_status='approved' and p.moeda='ZAR' for update;
    if v_product.id is null then raise exception 'PRODUCT_NOT_FOUND'; end if;
    if v_product.estoque<v_quantity then raise exception 'PRODUCT_OUT_OF_STOCK'; end if;
    v_mode:=case when v_mapping.pricing_mode='inherit' then v_product.pricing_mode else v_mapping.pricing_mode end;
    select base_price_zar into v_base_price from private.product_pricing_snapshot(v_product.id);
    if v_mode='fixed' then
      if v_mapping.sale_price is not null and abs(v_sale_price-v_mapping.sale_price)>0.01 then raise exception 'FIXED_PRICE_MISMATCH'; end if;
      if v_mapping.sale_price is null then select fixed_sale_price_zar into v_base_price from private.product_pricing_snapshot(v_product.id); if abs(v_sale_price-v_base_price)>0.01 then raise exception 'FIXED_PRICE_MISMATCH'; end if; select base_price_zar into v_base_price from private.product_pricing_snapshot(v_product.id); end if;
      v_item_margin:=greatest(v_sale_price-v_base_price,0);
    elsif v_mode='custom' then
      if v_sale_price<v_base_price then raise exception 'SALE_PRICE_BELOW_BASE_PRICE'; end if;
      v_item_margin:=round(v_sale_price-v_base_price,2);
    else raise exception 'INVALID_PRICING_MODE'; end if;
    v_subtotal:=v_subtotal+v_sale_price*v_quantity; v_base_total:=v_base_total+v_base_price*v_quantity; v_seller_margin:=v_seller_margin+v_item_margin*v_quantity;
    v_cost_zar:=case when v_product.supplier_cost_currency='CNY' and coalesce(v_product.supplier_fx_rate_to_zar,0)>0 then coalesce(v_product.supplier_cost_amount,0)*v_product.supplier_fx_rate_to_zar when v_product.supplier_cost_currency='ZAR' then coalesce(v_product.supplier_cost_amount,0) else coalesce(v_product.preco_custo,0) end;
    v_supplier_cost:=v_supplier_cost+v_cost_zar*v_quantity;
    update public.products set estoque=estoque-v_quantity,updated_at=now() where id=v_product.id;
  end loop;

  v_total:=v_subtotal+v_shipping;
  insert into public.integration_orders(
    platform_id,external_order_id,external_seller_id,status,currency,subtotal,shipping_amount,total,customer,shipping_address,metadata,idempotency_key,
    newvelion_base_total,newvelion_cost_total,external_seller_margin,newvelion_gross_margin,supplier_cost_total,supplier_cost_currency,supplier_fx_rate_to_zar,supplier_fx_rate_captured_at,customer_country_code
  ) values(
    p_platform_id,trim(p_external_order_id),p_external_seller_id,'confirmed','ZAR',v_subtotal,v_shipping,v_total,coalesce(p_customer,'{}'::jsonb),coalesce(p_shipping_address,'{}'::jsonb),coalesce(p_metadata,'{}'::jsonb),p_idempotency_key,
    v_base_total,v_supplier_cost,v_seller_margin,greatest(v_subtotal-v_supplier_cost-v_seller_margin,0),v_supplier_cost,'ZAR',1,now(),'ZA'
  ) returning * into v_order;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_quantity:=(v_item->>'quantity')::integer; v_sale_price:=(v_item->>'sale_price')::numeric;
    select m.* into v_mapping from public.integration_product_mappings m where m.platform_id=p_platform_id and m.external_product_id=trim(coalesce(v_item->>'external_product_id','')) and m.status='active' and (m.external_seller_id is null or m.external_seller_id=p_external_seller_id) order by (m.external_seller_id is not null) desc limit 1;
    select * into v_product from public.products p where p.id=v_mapping.newvelion_product_id;
    select base_price_zar into v_base_price from private.product_pricing_snapshot(v_product.id);
    v_mode:=case when v_mapping.pricing_mode='inherit' then v_product.pricing_mode else v_mapping.pricing_mode end;
    insert into public.integration_order_items(order_id,mapping_id,external_product_id,newvelion_product_id,quantity,sale_price,currency,newvelion_base_price,newvelion_cost_price,product_name,metadata,pricing_mode,base_price_zar,seller_margin_zar)
    values(v_order.id,v_mapping.id,trim(v_item->>'external_product_id'),v_product.id,v_quantity,v_sale_price,'ZAR',v_base_price,v_product.preco_custo,v_product.nome,coalesce(v_item->'metadata','{}'::jsonb),v_mode,v_base_price,greatest(round(v_sale_price-v_base_price,2),0));
  end loop;
  return query select v_order.id,v_order.status,v_order.total,v_order.currency;
end;
$function$;
revoke execute on function public.create_integration_order(uuid,text,uuid,text,jsonb,jsonb,jsonb,numeric,jsonb,text) from public,anon,authenticated;
grant execute on function public.create_integration_order(uuid,text,uuid,text,jsonb,jsonb,jsonb,numeric,jsonb,text) to service_role;
