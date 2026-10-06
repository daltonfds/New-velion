-- NewVelion checkout/order engine v2.
-- Snapshots supplier cost/FX at checkout, then atomically creates sale + ledger + fulfillment.
-- Customer is always ZA and customer-facing currency is always ZAR.

alter table public.checkout_sessions
  add column if not exists supplier_country_code text,
  add column if not exists supplier_cost_currency text,
  add column if not exists supplier_cost_amount numeric,
  add column if not exists supplier_fx_rate_to_zar numeric,
  add column if not exists supplier_fx_rate_captured_at timestamptz,
  add column if not exists supplier_cost_zar numeric,
  add column if not exists supplier_origin_shipping_cost numeric,
  add column if not exists supplier_origin_shipping_currency text;

alter table public.sales
  add column if not exists supplier_country_code text,
  add column if not exists supplier_cost_currency text,
  add column if not exists supplier_cost_amount numeric,
  add column if not exists supplier_fx_rate_to_zar numeric,
  add column if not exists supplier_fx_rate_captured_at timestamptz,
  add column if not exists supplier_cost_zar numeric,
  add column if not exists supplier_origin_shipping_cost numeric,
  add column if not exists supplier_origin_shipping_currency text;

create or replace function private.calculate_sale_financials()
returns trigger
language plpgsql
security definer
set search_path=''
as $function$
declare
  p public.products%rowtype;
  s public.platform_settings%rowtype;
  v_desired numeric;
  v_max_commission numeric;
  v_cost_zar numeric;
  v_base numeric;
  v_qty integer;
begin
  select * into p from public.products where id=new.product_id for share;
  if not found then raise exception 'Product not found'; end if;
  if new.vendedor_id=p.created_by then raise exception 'Self-referral is not allowed'; end if;

  select * into s from public.platform_settings where id=true;
  v_qty:=greatest(coalesce(new.quantity,1),1);

  v_base:=coalesce(nullif(new.product_amount,0),new.valor_venda-coalesce(new.shipping_amount,0));
  new.product_amount:=greatest(v_base,0);
  new.taxa_gateway:=round(new.valor_venda*0.10,2);
  new.taxa_plataforma:=round(new.valor_venda*coalesce(s.transaction_fee_percent,10)/100,2);

  v_cost_zar:=coalesce(new.supplier_cost_zar, greatest(coalesce(p.preco_custo,0),0)*v_qty);
  v_cost_zar:=greatest(v_cost_zar,0);

  if p.comissao_tipo='percentual' then
    v_desired:=round(new.product_amount*p.comissao_valor/100,2);
  else
    v_desired:=round(p.comissao_valor*v_qty,2);
  end if;

  v_max_commission:=greatest(0,new.valor_venda-v_cost_zar-new.taxa_gateway-new.taxa_plataforma);
  new.comissao_vendedor:=least(greatest(v_desired,0),v_max_commission);
  new.ganho_plataforma:=greatest(0,new.valor_venda-new.taxa_gateway-new.comissao_vendedor-v_cost_zar);
  new.valor_garantia:=round(new.comissao_vendedor*0.10,2);
  new.garantia_libera_em:=coalesce(
    new.garantia_libera_em,
    new.vendido_em+make_interval(days=>coalesce(s.hold_days,7))
  );
  return new;
end;
$function$;

create or replace function public.create_public_checkout_session(
 p_affiliate_link text,p_full_name text,p_phone text,p_whatsapp text,p_email text,
 p_country text,p_province text,p_city text,p_postal_code text,p_address text,
 p_address_reference text,p_quantity integer default 1
)
returns table(session_id uuid, checkout_url text)
language plpgsql
security definer
set search_path=''
as $function$
declare
 v_link text:=regexp_replace(regexp_replace(coalesce(p_affiliate_link,''),'^https?://[^/]+',''),'^/+','');
 v_link_code text;
 v_affiliation public.affiliations%rowtype;
 v_product public.products%rowtype;
 v_session uuid;
 v_product_amount numeric;
 v_shipping numeric:=0;
 v_total numeric;
 v_supplier uuid;
 v_supplier_country text;
 v_supplier_currency text;
 v_supplier_cost numeric;
 v_fx numeric;
 v_supplier_cost_zar numeric;
 v_fx_captured_at timestamptz;
 v_origin_shipping numeric;
 v_origin_shipping_currency text;
 v_profile public.supplier_shipping_profiles%rowtype;
 v_zone public.supplier_shipping_zones%rowtype;
 v_country_code text;
 v_city text:=lower(trim(coalesce(p_city,'')));
 v_metro boolean:=null;
begin
 v_link:=split_part(split_part(v_link,'?',1),'#',1);
 v_link_code:=regexp_replace(v_link,'^go/','');
 v_link_code:=regexp_replace(v_link_code,'/+$','');
 v_link:='go/'||trim(v_link_code);

 if v_link_code='' then raise exception 'Invalid affiliate link'; end if;
 if coalesce(p_quantity,0)<=0 or p_quantity>50 then raise exception 'Invalid quantity'; end if;

 select a.* into v_affiliation
 from public.affiliations a
 where a.link_unico=v_link and a.ativo=true
 limit 1;
 if v_affiliation.id is null then raise exception 'Invalid affiliate link'; end if;

 select p.* into v_product
 from public.products p
 where p.id=v_affiliation.product_id
   and p.ativo=true
   and p.supplier_status='approved'
   and p.moeda='ZAR'
   and p.checkout_url is not null
   and p.checkout_url~'^https?://'
 limit 1;
 if v_product.id is null then raise exception 'Product is unavailable for checkout'; end if;

 if coalesce(v_product.estoque,0)-coalesce(v_product.reserved_estoque,0)<p_quantity
 then raise exception 'Product out of stock'; end if;

 if upper(trim(coalesce(p_country,''))) not in ('ZA','SOUTH AFRICA','ZAF')
 then raise exception 'CUSTOMER_COUNTRY_MUST_BE_ZA'; end if;

 if nullif(trim(coalesce(p_full_name,'')),'') is null
   or nullif(trim(coalesce(p_phone,'')),'') is null
   or nullif(trim(coalesce(p_province,'')),'') is null
   or nullif(trim(coalesce(p_city,'')),'') is null
   or nullif(trim(coalesce(p_address,'')),'') is null
 then raise exception 'Required customer delivery fields are missing'; end if;

 v_product_amount:=round(v_affiliation.sale_price*p_quantity,2);

 select id into v_supplier
 from public.profiles
 where id=v_product.created_by and role='supplier';

 if v_supplier is not null then
   select upper(sp.country_code) into v_supplier_country
   from public.supplier_profiles sp
   where sp.user_id=v_supplier
   limit 1;
 else
   v_supplier_country:=upper(v_product.supplier_country_code);
 end if;

 v_supplier_country:=coalesce(v_supplier_country,upper(v_product.supplier_country_code));
 if v_supplier_country is not null and v_supplier_country not in ('ZA','CN')
 then raise exception 'SUPPLIER_COUNTRY_NOT_SUPPORTED'; end if;

 v_supplier_currency:=coalesce(
   v_product.supplier_cost_currency,
   case when v_supplier_country='CN' then 'CNY' else 'ZAR' end
 );
 v_supplier_cost:=greatest(
   coalesce(v_product.supplier_cost_amount,v_product.preco_custo,0),0
 );

 if v_supplier_currency='CNY' then
   v_fx:=v_product.supplier_fx_rate_to_zar;
   v_fx_captured_at:=v_product.supplier_fx_rate_captured_at;
   if v_fx is null or v_fx<=0 then raise exception 'SUPPLIER_FX_RATE_REQUIRED'; end if;
 else
   v_fx:=1;
   v_fx_captured_at:=coalesce(v_product.supplier_fx_rate_captured_at,now());
 end if;

 v_supplier_cost_zar:=round(v_supplier_cost*v_fx*p_quantity,2);
 v_origin_shipping:=greatest(coalesce(v_product.supplier_origin_shipping_cost,0),0)*p_quantity;
 v_origin_shipping_currency:=coalesce(
   v_product.supplier_origin_shipping_currency,
   v_supplier_currency
 );

 if v_supplier is not null then
   select * into v_profile
   from public.supplier_shipping_profiles
   where user_id=v_supplier and enabled=true
   limit 1;

   v_country_code:='ZA';
   if v_city in(
     'johannesburg','johannesburg cbd','sandton','pretoria','centurion',
     'cape town','bellville','durban','umhlanga','gqeberha',
     'port elizabeth','bloemfontein'
   ) then v_metro:=true; else v_metro:=false; end if;

   select * into v_zone
   from public.supplier_shipping_zones z
   where z.supplier_id=v_supplier
     and z.active=true
     and 'ZA'=any(z.country_codes)
     and (z.metro is null or z.metro=v_metro)
   order by case when z.metro is not null then 0 else 1 end,z.created_at
   limit 1;

   if v_zone.id is not null then
     v_shipping:=round(
       v_zone.base_rate+
       (v_zone.per_kg_rate*greatest(coalesce(v_product.peso_kg,0),0)*p_quantity),2
     );
   elsif v_profile.user_id is not null then
     v_shipping:=coalesce(v_profile.default_rate,0);
   end if;

   if v_profile.free_shipping_threshold is not null
      and v_product_amount>=v_profile.free_shipping_threshold
   then v_shipping:=0; end if;
 end if;

 v_total:=round(v_product_amount+v_shipping,2);

 insert into public.checkout_sessions(
   affiliation_id,product_id,seller_id,affiliate_link,full_name,phone,whatsapp,email,
   country,province,city,postal_code,address,address_reference,
   quantity,product_amount,shipping_amount,amount,currency,checkout_url,status,
   customer_country_code,supplier_country_code,supplier_cost_currency,
   supplier_cost_amount,supplier_fx_rate_to_zar,supplier_fx_rate_captured_at,
   supplier_cost_zar,supplier_origin_shipping_cost,supplier_origin_shipping_currency
 ) values(
   v_affiliation.id,v_product.id,v_affiliation.vendedor_id,v_affiliation.link_unico,
   trim(p_full_name),trim(p_phone),nullif(trim(coalesce(p_whatsapp,'')),''),
   nullif(trim(coalesce(p_email,'')),''),'ZA',trim(p_province),trim(p_city),
   nullif(trim(coalesce(p_postal_code,'')),''),trim(p_address),
   nullif(trim(coalesce(p_address_reference,'')),''),
   p_quantity,v_product_amount,v_shipping,v_total,'ZAR',v_product.checkout_url,'pending',
   'ZA',v_supplier_country,v_supplier_currency,v_supplier_cost,v_fx,v_fx_captured_at,
   v_supplier_cost_zar,v_origin_shipping,v_origin_shipping_currency
 ) returning id into v_session;

 return query select v_session,v_product.checkout_url;
end;
$function$;

create or replace function public.create_sale_fulfillment(p_sale_id uuid)
returns uuid
language plpgsql
security definer
set search_path=''
as $function$
declare
 v_sale public.sales%rowtype;
 v_product public.products%rowtype;
 v_fulfillment public.fulfillment_orders%rowtype;
 v_supplier_id uuid;
 v_supplier_currency text;
 v_cost_amount numeric;
 v_fx numeric;
 v_cost_zar numeric;
 v_qty integer;
begin
 select * into v_sale from public.sales where id=p_sale_id for update;
 if not found then raise exception 'SALE_NOT_FOUND'; end if;

 select * into v_fulfillment from public.fulfillment_orders where sale_id=v_sale.id limit 1;
 if v_fulfillment.id is not null then return v_fulfillment.id; end if;

 select * into v_product from public.products where id=v_sale.product_id for update;
 if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;

 v_qty:=greatest(coalesce(v_sale.quantity,1),1);
 if coalesce(v_product.estoque,0)-coalesce(v_product.reserved_estoque,0)<v_qty
 then raise exception 'PRODUCT_OUT_OF_STOCK'; end if;

 select pr.id into v_supplier_id
 from public.profiles pr
 where pr.id=v_product.created_by and pr.role='supplier';

 v_supplier_currency:=coalesce(
   v_sale.supplier_cost_currency,
   v_product.supplier_cost_currency,
   case when v_sale.supplier_country_code='CN' or v_product.supplier_country_code='CN'
        then 'CNY' else 'ZAR' end
 );
 v_cost_amount:=greatest(
   coalesce(v_sale.supplier_cost_amount,v_product.supplier_cost_amount,v_product.preco_custo,0),0
 );
 v_fx:=case when v_supplier_currency='CNY'
   then coalesce(v_sale.supplier_fx_rate_to_zar,v_product.supplier_fx_rate_to_zar)
   else 1 end;

 if v_supplier_currency='CNY' and (v_fx is null or v_fx<=0)
 then raise exception 'SUPPLIER_FX_RATE_REQUIRED'; end if;

 v_cost_zar:=coalesce(
   v_sale.supplier_cost_zar,
   round(v_cost_amount*v_fx*v_qty,2)
 );

 update public.products
 set estoque=estoque-v_qty,reserved_estoque=reserved_estoque+v_qty,updated_at=now()
 where id=v_product.id;

 insert into public.fulfillment_orders(
   source_type,source_id,sale_id,status,currency,subtotal,shipping_amount,total,supplier_id,
   supplier_cost_currency,supplier_cost_total,supplier_fx_rate_to_zar,
   supplier_fx_rate_captured_at
 ) values(
   'sale',v_sale.id,v_sale.id,'confirmed','ZAR',v_sale.product_amount,
   coalesce(v_sale.shipping_amount,0),v_sale.valor_venda,v_supplier_id,
   v_supplier_currency,v_cost_amount,v_fx,
   coalesce(v_sale.supplier_fx_rate_captured_at,now())
 ) returning * into v_fulfillment;

 insert into public.fulfillment_order_items(
   fulfillment_order_id,product_id,supplier_id,quantity,unit_sale_price,unit_cost,
   product_name,supplier_cost_currency,supplier_fx_rate_to_zar,supplier_cost_zar
 ) values(
   v_fulfillment.id,v_product.id,v_supplier_id,v_qty,
   v_sale.product_amount/greatest(v_qty,1),v_cost_amount,v_product.nome,
   v_supplier_currency,v_fx,v_cost_zar
 );

 insert into public.fulfillment_events(
   fulfillment_order_id,status,note,metadata
 ) values(
   v_fulfillment.id,'confirmed','Payment confirmed; stock reserved for fulfillment.',
   jsonb_build_object(
     'source','checkout','sale_id',v_sale.id,'customer_country','ZA',
     'currency','ZAR','supplier_cost_currency',v_supplier_currency,
     'supplier_cost_amount',v_cost_amount,'supplier_fx_rate_to_zar',v_fx,
     'supplier_cost_zar',v_cost_zar
   )
 );

 return v_fulfillment.id;
end;
$function$;

create or replace function private.post_sale_to_ledger()
returns trigger
language plpgsql
security definer
set search_path=''
as $function$
declare
 v_product public.products%rowtype;
 v_supplier_id uuid;
 v_supplier_amount numeric;
 v_supplier_currency text;
begin
 insert into public.wallet_entries(vendedor_id,sale_id,tipo,valor,estado,currency)
 values
   (new.vendedor_id,new.id,'comissao',greatest(new.comissao_vendedor-new.valor_garantia,0),'disponivel','ZAR'),
   (new.vendedor_id,new.id,'garantia_retida',greatest(new.valor_garantia,0),'retido','ZAR');

 select p.* into v_product from public.products p where p.id=new.product_id;
 if found then
   select pr.id into v_supplier_id
   from public.profiles pr
   where pr.id=p.created_by and pr.role='supplier';

   v_supplier_currency:=coalesce(
     new.supplier_cost_currency,p.supplier_cost_currency,
     case when new.supplier_country_code='CN' or p.supplier_country_code='CN'
          then 'CNY' else 'ZAR' end
   );
   v_supplier_amount:=greatest(
     coalesce(new.supplier_cost_amount,p.supplier_cost_amount,p.preco_custo,0),0
   )*greatest(coalesce(new.quantity,1),1);

   if v_supplier_id is not null and v_supplier_amount>0 then
     insert into public.wallet_entries(
       vendedor_id,sale_id,tipo,valor,estado,currency
     ) values(
       v_supplier_id,new.id,'supplier_earning',v_supplier_amount,'retido',
       v_supplier_currency
     )
     on conflict(sale_id,vendedor_id,tipo) do update
       set valor=excluded.valor,currency=excluded.currency;
   end if;
 end if;
 return new;
end;
$function$;

create or replace function public.approve_checkout_session(p_session_id uuid)
returns table(sale_id uuid)
language plpgsql
security definer
set search_path=''
as $function$
declare
 s public.checkout_sessions%rowtype;
 new_sale_id uuid;
begin
 if not (select private.is_admin_user()) then raise exception 'Forbidden'; end if;

 select * into s
 from public.checkout_sessions
 where id=p_session_id
 for update;

 if not found then raise exception 'Checkout session not found'; end if;

 if s.status='approved' then
   select id into new_sale_id
   from public.sales
   where gateway_ref='newvelion_checkout:'||s.id
   limit 1;
   return query select new_sale_id;
   return;
 end if;

 if s.status<>'paid_pending_review'
    or s.payment_comparison_status<>'matched'
 then
   raise exception 'Payment must be registered and matched before approval';
 end if;

 insert into public.sales(
   vendedor_id,product_id,quantity,product_amount,shipping_amount,valor_venda,
   gateway_ref,vendido_em,currency,customer_country_code,
   supplier_country_code,supplier_cost_currency,supplier_cost_amount,
   supplier_fx_rate_to_zar,supplier_fx_rate_captured_at,supplier_cost_zar,
   supplier_origin_shipping_cost,supplier_origin_shipping_currency
 ) values(
   s.seller_id,s.product_id,greatest(s.quantity,1),s.product_amount,
   s.shipping_amount,s.amount,'newvelion_checkout:'||s.id,
   coalesce(s.external_payment_paid_at,now()),'ZAR','ZA',
   s.supplier_country_code,s.supplier_cost_currency,s.supplier_cost_amount,
   s.supplier_fx_rate_to_zar,s.supplier_fx_rate_captured_at,s.supplier_cost_zar,
   s.supplier_origin_shipping_cost,s.supplier_origin_shipping_currency
 )
 returning id into new_sale_id;

 update public.checkout_sessions
 set status='approved',updated_at=now()
 where id=s.id;

 perform public.create_sale_fulfillment(new_sale_id);

 return query select new_sale_id;
end;
$function$;

drop trigger if exists sales_calculate_financials on public.sales;
create trigger sales_calculate_financials
before insert or update of product_id,vendedor_id,quantity,product_amount,shipping_amount,valor_venda,
supplier_cost_zar,supplier_cost_amount,supplier_fx_rate_to_zar
on public.sales
for each row execute function private.calculate_sale_financials();

drop trigger if exists sales_post_to_ledger on public.sales;
create trigger sales_post_to_ledger
after insert on public.sales
for each row execute function private.post_sale_to_ledger();

revoke execute on function public.create_public_checkout_session(text,text,text,text,text,text,text,text,text,text,text,integer) from public,authenticated;
grant execute on function public.create_public_checkout_session(text,text,text,text,text,text,text,text,text,text,text,integer) to anon;

revoke execute on function public.approve_checkout_session(uuid) from public,anon;
grant execute on function public.approve_checkout_session(uuid) to authenticated;
