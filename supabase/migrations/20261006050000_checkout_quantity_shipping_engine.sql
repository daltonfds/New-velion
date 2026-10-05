alter table public.checkout_sessions add column if not exists quantity integer not null default 1 check(quantity>0);
alter table public.checkout_sessions add column if not exists product_amount numeric not null default 0;
alter table public.checkout_sessions add column if not exists shipping_amount numeric not null default 0;
alter table public.sales add column if not exists quantity integer not null default 1 check(quantity>0);
alter table public.sales add column if not exists product_amount numeric not null default 0;
alter table public.sales add column if not exists shipping_amount numeric not null default 0;

create or replace function private.calculate_sale_financials()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare p public.products%rowtype; s public.platform_settings%rowtype; v_desired numeric; v_max_commission numeric; v_cost numeric; v_base numeric;
begin
 select * into p from public.products where id=new.product_id for share;
 if not found then raise exception 'Product not found'; end if;
 if new.vendedor_id=p.created_by then raise exception 'Self-referral is not allowed'; end if;
 select * into s from public.platform_settings where id=true;
 v_base:=coalesce(nullif(new.product_amount,0),new.valor_venda-coalesce(new.shipping_amount,0));
 new.product_amount:=greatest(v_base,0);
 new.taxa_gateway:=round(new.valor_venda*0.10,2);
 new.taxa_plataforma:=round(new.valor_venda*coalesce(s.transaction_fee_percent,10)/100,2);
 v_cost:=greatest(coalesce(p.preco_custo,0),0)*greatest(new.quantity,1);
 if p.comissao_tipo='percentual' then v_desired:=round(new.product_amount*p.comissao_valor/100,2); else v_desired:=round(p.comissao_valor*greatest(new.quantity,1),2); end if;
 v_max_commission:=greatest(0,new.valor_venda-v_cost-new.taxa_gateway-new.taxa_plataforma);
 new.comissao_vendedor:=least(greatest(v_desired,0),v_max_commission);
 new.ganho_plataforma:=greatest(0,new.valor_venda-new.taxa_gateway-new.comissao_vendedor-v_cost);
 new.valor_garantia:=round(new.comissao_vendedor*0.10,2);
 new.garantia_libera_em:=coalesce(new.garantia_libera_em,new.vendido_em+make_interval(days=>coalesce(s.hold_days,7)));
 return new;
end;
$function$;

create or replace function public.create_public_checkout_session(p_affiliate_link text,p_full_name text,p_phone text,p_whatsapp text,p_email text,p_country text,p_province text,p_city text,p_postal_code text,p_address text,p_address_reference text,p_quantity integer default 1)
returns table(session_id uuid,checkout_url text)
language plpgsql security definer set search_path=''
as $function$
declare v_link text:=regexp_replace(regexp_replace(coalesce(p_affiliate_link,''),'^https?://[^/]+',''),'^/+',''); v_link_code text; v_affiliation public.affiliations%rowtype; v_product public.products%rowtype; v_session uuid; v_product_amount numeric; v_shipping numeric:=0; v_total numeric; v_supplier uuid; v_profile public.supplier_shipping_profiles%rowtype; v_zone public.supplier_shipping_zones%rowtype; v_country_code text; v_city text:=lower(trim(coalesce(p_city,''))); v_metro boolean:=null;
begin
 v_link:=split_part(split_part(v_link,'?',1),'#',1); v_link_code:=regexp_replace(v_link,'^go/',''); v_link_code:=regexp_replace(v_link_code,'/+$',''); v_link:='go/'||trim(v_link_code);
 if v_link_code='' then raise exception 'Invalid affiliate link'; end if;
 if coalesce(p_quantity,0)<=0 or p_quantity>50 then raise exception 'Invalid quantity'; end if;
 select a.* into v_affiliation from public.affiliations a where a.link_unico=v_link and a.ativo=true limit 1;
 if v_affiliation.id is null then raise exception 'Invalid affiliate link'; end if;
 select p.* into v_product from public.products p where p.id=v_affiliation.product_id and p.ativo=true and p.supplier_status='approved' and p.checkout_url is not null and p.checkout_url~'^https?://' limit 1;
 if v_product.id is null then raise exception 'Product is unavailable for checkout'; end if;
 if nullif(trim(coalesce(p_full_name,'')),'') is null or nullif(trim(coalesce(p_phone,'')),'') is null or nullif(trim(coalesce(p_country,'')),'') is null or nullif(trim(coalesce(p_province,'')),'') is null or nullif(trim(coalesce(p_city,'')),'') is null or nullif(trim(coalesce(p_address,'')),'') is null then raise exception 'Required customer delivery fields are missing'; end if;
 v_product_amount:=v_affiliation.sale_price*p_quantity;
 select id into v_supplier from public.profiles where id=v_product.created_by and role='supplier';
 if v_supplier is not null then
  select * into v_profile from public.supplier_shipping_profiles where user_id=v_supplier and enabled=true limit 1;
  v_country_code:=case when lower(trim(p_country)) in('south africa','za','zaf') then 'ZA' when lower(trim(p_country)) in('mozambique','mz','moz') then 'MZ' else upper(left(trim(p_country),2)) end;
  if v_country_code='ZA' and v_city in('johannesburg','johannesburg cbd','sandton','pretoria','centurion','cape town','bellville','durban','umhlanga','gqeberha','port elizabeth','bloemfontein') then v_metro:=true;
  elsif v_country_code='MZ' and v_city in('maputo','matola','beira','nampula') then v_metro:=true;
  elsif v_country_code in('ZA','MZ') then v_metro:=false; end if;
  select * into v_zone from public.supplier_shipping_zones z where z.supplier_id=v_supplier and z.active=true and v_country_code=any(z.country_codes) and (z.metro is null or z.metro=v_metro) order by case when z.metro is not null then 0 else 1 end,z.created_at limit 1;
  if v_zone.id is not null then v_shipping:=round(v_zone.base_rate+(v_zone.per_kg_rate*greatest(coalesce(v_product.peso_kg,0),0)*p_quantity),2); elsif v_profile.user_id is not null then v_shipping:=coalesce(v_profile.default_rate,0); end if;
  if v_profile.free_shipping_threshold is not null and v_product_amount>=v_profile.free_shipping_threshold then v_shipping:=0; end if;
 end if;
 v_total:=v_product_amount+v_shipping;
 insert into public.checkout_sessions(affiliation_id,product_id,seller_id,affiliate_link,full_name,phone,whatsapp,email,country,province,city,postal_code,address,address_reference,quantity,product_amount,shipping_amount,amount,currency,checkout_url,status)
 values(v_affiliation.id,v_product.id,v_affiliation.vendedor_id,v_affiliation.link_unico,trim(p_full_name),trim(p_phone),nullif(trim(coalesce(p_whatsapp,'')),''),nullif(trim(coalesce(p_email,'')),''),trim(p_country),trim(p_province),trim(p_city),nullif(trim(coalesce(p_postal_code,'')),''),trim(p_address),nullif(trim(coalesce(p_address_reference,'')),''),p_quantity,v_product_amount,v_shipping,v_total,v_product.moeda,v_product.checkout_url,'pending') returning id into v_session;
 return query select v_session,v_product.checkout_url;
end;
$function$;

create or replace function public.approve_checkout_session(p_session_id uuid)
returns table(sale_id uuid) language plpgsql security definer set search_path=''
as $function$
declare s public.checkout_sessions%rowtype; new_sale_id uuid;
begin
 if not (select private.is_admin_user()) then raise exception 'Forbidden'; end if;
 select * into s from public.checkout_sessions where id=p_session_id for update;
 if not found then raise exception 'Checkout session not found'; end if;
 if s.status='approved' then select id into new_sale_id from public.sales where gateway_ref='newvelion_checkout:'||s.id limit 1; return query select new_sale_id; return; end if;
 if s.status<>'paid_pending_review' or s.payment_comparison_status<>'matched' then raise exception 'Payment must be registered and matched before approval'; end if;
 insert into public.sales(vendedor_id,product_id,quantity,product_amount,shipping_amount,valor_venda,gateway_ref,vendido_em)
 values(s.seller_id,s.product_id,greatest(s.quantity,1),s.product_amount,s.shipping_amount,s.amount,'newvelion_checkout:'||s.id,coalesce(s.external_payment_paid_at,now())) returning id into new_sale_id;
 update public.checkout_sessions set status='approved',updated_at=now() where id=s.id;
 perform public.create_sale_fulfillment(new_sale_id);
 return query select new_sale_id;
end;
$function$;

create or replace function public.create_sale_fulfillment(p_sale_id uuid)
returns uuid language plpgsql security definer set search_path=''
as $function$
declare v_sale public.sales%rowtype; v_product public.products%rowtype; v_fulfillment public.fulfillment_orders%rowtype; v_supplier_id uuid; v_qty integer;
begin
 select * into v_sale from public.sales where id=p_sale_id for update; if not found then raise exception 'SALE_NOT_FOUND'; end if;
 select * into v_fulfillment from public.fulfillment_orders where sale_id=v_sale.id limit 1; if v_fulfillment.id is not null then return v_fulfillment.id; end if;
 select * into v_product from public.products where id=v_sale.product_id for update; if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;
 v_qty:=greatest(coalesce(v_sale.quantity,1),1);
 if v_product.estoque-v_product.reserved_estoque<v_qty then raise exception 'PRODUCT_OUT_OF_STOCK'; end if;
 select case when pr.role='supplier' then pr.id else null end into v_supplier_id from public.profiles pr where pr.id=v_product.created_by;
 update public.products set estoque=estoque-v_qty,reserved_estoque=reserved_estoque+v_qty,updated_at=now() where id=v_product.id;
 insert into public.fulfillment_orders(source_type,source_id,sale_id,status,currency,subtotal,shipping_amount,total,supplier_id) values('sale',v_sale.id,v_sale.id,'confirmed',v_product.moeda,v_sale.product_amount,v_sale.shipping_amount,v_sale.valor_venda,v_supplier_id) returning * into v_fulfillment;
 insert into public.fulfillment_order_items(fulfillment_order_id,product_id,supplier_id,quantity,unit_sale_price,unit_cost,product_name) values(v_fulfillment.id,v_product.id,v_supplier_id,v_qty,v_sale.product_amount/nullif(v_qty,0),coalesce(v_product.preco_custo,0),v_product.nome);
 insert into public.fulfillment_events(fulfillment_order_id,status,note,metadata) values(v_fulfillment.id,'confirmed','Stock reserved for sale.',jsonb_build_object('sale_id',v_sale.id,'product_id',v_product.id,'quantity',v_qty));
 return v_fulfillment.id;
end;
$function$;