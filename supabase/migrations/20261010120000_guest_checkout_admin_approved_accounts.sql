-- Guest checkout: customer accounts are provisioned only after admin approval.
-- Keeps the existing pricing, stock, shipping and checkout snapshot logic.
create or replace function public.create_customer_checkout_session(p_product_id uuid,p_full_name text,p_phone text,p_province text,p_city text,p_postal_code text,p_address text,p_address_reference text,p_email text,p_quantity integer default 1)
returns table(session_id uuid,checkout_url text)
language plpgsql security definer set search_path=''
as $$
declare
 v_uid uuid:=auth.uid(); p public.products%rowtype; v_supplier uuid; v_sc text; v_cc text; v_cost numeric; v_fx numeric; v_fx_at timestamptz; v_cost_zar numeric; v_origin_native numeric; v_origin_cc text; v_origin_zar numeric; v_shipping numeric:=0; v_unit numeric; v_amount numeric; v_total numeric; v_profile public.supplier_shipping_profiles%rowtype; v_zone public.supplier_shipping_zones%rowtype; v_city text:=lower(trim(coalesce(p_city,''))); v_metro boolean:=false; sid uuid;
begin
 if v_uid is not null and not exists(select 1 from public.profiles where id=v_uid and role='customer' and status='active') then raise exception 'CUSTOMER_ACCOUNT_REQUIRED'; end if;
 if p_quantity is null or p_quantity<1 or p_quantity>50 then raise exception 'INVALID_QUANTITY'; end if;
 select * into p from public.products where id=p_product_id and ativo=true and supplier_status='approved' and moeda='ZAR' and checkout_url is not null and checkout_url~'^https?://' limit 1;
 if p.id is null then raise exception 'PRODUCT_UNAVAILABLE_FOR_CHECKOUT'; end if;
 if coalesce(p.estoque,0)-coalesce(p.reserved_estoque,0)<p_quantity then raise exception 'PRODUCT_OUT_OF_STOCK'; end if;
 if nullif(trim(coalesce(p_full_name,'')),'') is null or nullif(trim(coalesce(p_phone,'')),'') is null or nullif(trim(coalesce(p_province,'')),'') is null or nullif(trim(coalesce(p_city,'')),'') is null or nullif(trim(coalesce(p_address,'')),'') is null then raise exception 'REQUIRED_CUSTOMER_FIELDS'; end if;
 v_unit:=round(coalesce(nullif(p.preco_promocional,0),p.preco),2); v_amount:=round(v_unit*p_quantity,2);
 select id into v_supplier from public.profiles where id=p.created_by and role='supplier';
 select upper(country_code) into v_sc from public.supplier_profiles where user_id=v_supplier limit 1; v_sc:=coalesce(v_sc,upper(p.supplier_country_code));
 if v_sc is not null and v_sc not in('ZA','CN') then raise exception 'SUPPLIER_COUNTRY_NOT_SUPPORTED'; end if;
 v_cc:=coalesce(p.supplier_cost_currency,case when v_sc='CN' then 'CNY' else 'ZAR' end); v_cost:=greatest(coalesce(p.supplier_cost_amount,p.preco_custo,0),0);
 if v_cc='CNY' then v_fx:=p.supplier_fx_rate_to_zar; v_fx_at:=p.supplier_fx_rate_captured_at; if v_fx is null or v_fx<=0 then raise exception 'SUPPLIER_FX_RATE_REQUIRED'; end if; else v_fx:=1; v_fx_at:=coalesce(p.supplier_fx_rate_captured_at,now()); end if;
 v_cost_zar:=round(v_cost*v_fx*p_quantity,2); v_origin_native:=greatest(coalesce(p.supplier_origin_shipping_cost,0),0); v_origin_cc:=coalesce(p.supplier_origin_shipping_currency,v_cc); v_origin_zar:=round(v_origin_native*case when v_origin_cc='CNY' then v_fx else 1 end*p_quantity,2);
 if v_supplier is not null then
   select * into v_profile from public.supplier_shipping_profiles where user_id=v_supplier and enabled=true limit 1;
   if v_city in('johannesburg','johannesburg cbd','sandton','pretoria','centurion','cape town','bellville','durban','umhlanga','gqeberha','port elizabeth','bloemfontein') then v_metro:=true; end if;
   select * into v_zone from public.supplier_shipping_zones z where z.supplier_id=v_supplier and z.active=true and 'ZA'=any(z.country_codes) and (z.metro is null or z.metro=v_metro) order by case when z.metro is not null then 0 else 1 end,z.created_at limit 1;
   if v_zone.id is not null then v_shipping:=round(v_zone.base_rate+(v_zone.per_kg_rate*greatest(coalesce(p.peso_kg,0),0)*p_quantity),2); elsif v_profile.user_id is not null then v_shipping:=coalesce(v_profile.default_rate,0); end if;
   if v_profile.free_shipping_threshold is not null and v_amount>=v_profile.free_shipping_threshold then v_shipping:=0; end if;
 end if;
 v_total:=round(v_amount+v_shipping,2);
 insert into public.checkout_sessions(customer_id,affiliation_id,product_id,seller_id,affiliate_link,full_name,phone,whatsapp,email,country,province,city,postal_code,address,address_reference,quantity,product_amount,shipping_amount,amount,currency,checkout_url,status,customer_country_code,supplier_country_code,supplier_cost_currency,supplier_cost_amount,supplier_fx_rate_to_zar,supplier_fx_rate_captured_at,supplier_cost_zar,supplier_origin_shipping_cost,supplier_origin_shipping_currency,pricing_mode,base_price_zar,seller_margin_zar,commission_snapshot_zar)
 values(v_uid,null,p.id,null,null,trim(p_full_name),trim(p_phone),null,nullif(trim(coalesce(p_email,'')),''),'ZA',trim(p_province),trim(p_city),nullif(trim(coalesce(p_postal_code,'')),''),trim(p_address),nullif(trim(coalesce(p_address_reference,'')),''),p_quantity,v_amount,v_shipping,v_total,'ZAR',p.checkout_url,'pending','ZA',v_sc,v_cc,v_cost,v_fx,v_fx_at,round(v_cost_zar+v_origin_zar,2),v_origin_native,v_origin_cc,p.pricing_mode,coalesce(p.custom_pricing_floor_zar,p.supplier_min_selling_price,p.supplier_suggested_price,p.preco_custo,0),0,0)
 returning id into sid;
 return query select sid,p.checkout_url;
end; $$;

revoke all on function public.create_customer_checkout_session(uuid,text,text,text,text,text,text,text,text,integer) from public, authenticated;
grant execute on function public.create_customer_checkout_session(uuid,text,text,text,text,text,text,text,text,integer) to anon, authenticated;
