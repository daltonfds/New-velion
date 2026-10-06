-- Checkout stock guard: reject quantities above available stock.
-- Production was updated with the same function definition.
create or replace function public.create_public_checkout_session(
 p_affiliate_link text,p_full_name text,p_phone text,p_whatsapp text,p_email text,
 p_country text,p_province text,p_city text,p_postal_code text,p_address text,
 p_address_reference text,p_quantity integer default 1
) returns table(session_id uuid, checkout_url text)
language plpgsql security definer set search_path=''
as $function$
declare
 v_link text:=regexp_replace(regexp_replace(coalesce(p_affiliate_link,''),'^https?://[^/]+',''),'^/+','');
 v_link_code text; v_affiliation public.affiliations%rowtype; v_product public.products%rowtype;
 v_session uuid; v_product_amount numeric; v_shipping numeric:=0; v_total numeric; v_supplier uuid;
 v_profile public.supplier_shipping_profiles%rowtype; v_zone public.supplier_shipping_zones%rowtype;
 v_country_code text; v_city text:=lower(trim(coalesce(p_city,''))); v_metro boolean:=null;
begin
 v_link:=split_part(split_part(v_link,'?',1),'#',1); v_link_code:=regexp_replace(v_link,'^go/','');
 v_link_code:=regexp_replace(v_link_code,'/+$',''); v_link:='go/'||trim(v_link_code);
 if v_link_code='' then raise exception 'Invalid affiliate link'; end if;
 if coalesce(p_quantity,0)<=0 or p_quantity>50 then raise exception 'Invalid quantity'; end if;
 select a.* into v_affiliation from public.affiliations a where a.link_unico=v_link and a.ativo=true limit 1;
 if v_affiliation.id is null then raise exception 'Invalid affiliate link'; end if;
 select p.* into v_product from public.products p where p.id=v_affiliation.product_id and p.ativo=true
   and p.supplier_status='approved' and p.checkout_url is not null and p.checkout_url~'^https?://' limit 1;
 if v_product.id is null then raise exception 'Product is unavailable for checkout'; end if;
 if coalesce(v_product.estoque,0)-coalesce(v_product.reserved_estoque,0)<p_quantity then raise exception 'Product out of stock'; end if;
 if nullif(trim(coalesce(p_full_name,'')),'') is null or nullif(trim(coalesce(p_phone,'')),'') is null
   or nullif(trim(coalesce(p_country,'')),'') is null or nullif(trim(coalesce(p_province,'')),'') is null
   or nullif(trim(coalesce(p_city,'')),'') is null or nullif(trim(coalesce(p_address,'')),'') is null
   then raise exception 'Required customer delivery fields are missing'; end if;
 v_product_amount:=v_affiliation.sale_price*p_quantity;
 select id into v_supplier from public.profiles where id=v_product.created_by and role='supplier';
 if v_supplier is not null then
  select * into v_profile from public.supplier_shipping_profiles where user_id=v_supplier and enabled=true limit 1;
  v_country_code:=case when lower(trim(p_country)) in('south africa','za','zaf') then 'ZA'
    when lower(trim(p_country)) in('mozambique','mz','moz') then 'MZ' else upper(left(trim(p_country),2)) end;
  if v_country_code='ZA' and v_city in('johannesburg','johannesburg cbd','sandton','pretoria','centurion','cape town','bellville','durban','umhlanga','gqeberha','port elizabeth','bloemfontein') then v_metro:=true;
  elsif v_country_code='MZ' and v_city in('maputo','matola','beira','nampula') then v_metro:=true;
  elsif v_country_code in('ZA','MZ') then v_metro:=false; end if;
  select * into v_zone from public.supplier_shipping_zones z where z.supplier_id=v_supplier and z.active=true
    and v_country_code=any(z.country_codes) and (z.metro is null or z.metro=v_metro)
    order by case when z.metro is not null then 0 else 1 end,z.created_at limit 1;
  if v_zone.id is not null then v_shipping:=round(v_zone.base_rate+(v_zone.per_kg_rate*greatest(coalesce(v_product.peso_kg,0),0)*p_quantity),2);
  elsif v_profile.user_id is not null then v_shipping:=coalesce(v_profile.default_rate,0); end if;
  if v_profile.free_shipping_threshold is not null and v_product_amount>=v_profile.free_shipping_threshold then v_shipping:=0; end if;
 end if;
 v_total:=v_product_amount+v_shipping;
 insert into public.checkout_sessions(affiliation_id,product_id,seller_id,affiliate_link,full_name,phone,whatsapp,email,country,province,city,postal_code,address,address_reference,quantity,product_amount,shipping_amount,amount,currency,checkout_url,status)
 values(v_affiliation.id,v_product.id,v_affiliation.vendedor_id,v_affiliation.link_unico,trim(p_full_name),trim(p_phone),nullif(trim(coalesce(p_whatsapp,'')),''),nullif(trim(coalesce(p_email,'')),''),trim(p_country),trim(p_province),trim(p_city),nullif(trim(coalesce(p_postal_code,'')),''),trim(p_address),nullif(trim(coalesce(p_address_reference,'')),''),p_quantity,v_product_amount,v_shipping,v_total,v_product.moeda,v_product.checkout_url,'pending')
 returning id into v_session;
 return query select v_session,v_product.checkout_url;
end;
$function$;
revoke execute on function public.create_public_checkout_session(text,text,text,text,text,text,text,text,text,text,text,integer) from public,authenticated;
grant execute on function public.create_public_checkout_session(text,text,text,text,text,text,text,text,text,text,text,integer) to anon;
