alter table public.affiliations add column if not exists sale_price numeric;
update public.affiliations a set sale_price=coalesce(p.preco_promocional,p.preco) from public.products p where p.id=a.product_id and a.sale_price is null;
alter table public.affiliations alter column sale_price set not null;
alter table public.affiliations add constraint affiliations_sale_price_check check(sale_price>0);

create or replace function public.create_affiliation_with_price(p_product_id uuid,p_sale_price numeric)
returns table(affiliation_id uuid,affiliate_link text,sale_price numeric,created boolean)
language plpgsql security definer set search_path=''
as $function$
declare v_user uuid:=auth.uid(); v_product public.products%rowtype; v_aff public.affiliations%rowtype; v_created boolean:=false;
begin
 if v_user is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
 if not exists(select 1 from public.profiles where id=v_user and role='seller' and status='active') then raise exception 'SELLER_ACCESS_REQUIRED'; end if;
 if p_sale_price is null or p_sale_price<=0 then raise exception 'INVALID_SALE_PRICE'; end if;
 select * into v_product from public.products where id=p_product_id and ativo=true and supplier_status='approved' for share;
 if not found then raise exception 'PRODUCT_NOT_AVAILABLE'; end if;
 if v_product.supplier_min_selling_price is not null and p_sale_price<v_product.supplier_min_selling_price then raise exception 'SALE_PRICE_BELOW_MINIMUM'; end if;
 select * into v_aff from public.affiliations where vendedor_id=v_user and product_id=p_product_id limit 1 for update;
 if v_aff.id is not null then update public.affiliations set sale_price=p_sale_price,ativo=true where id=v_aff.id returning * into v_aff;
 else insert into public.affiliations(vendedor_id,product_id,sale_price,ativo) values(v_user,p_product_id,p_sale_price,true) returning * into v_aff; v_created:=true; end if;
 return query select v_aff.id,v_aff.link_unico,v_aff.sale_price,v_created;
end;
$function$;

drop function if exists public.resolve_affiliate_product_with_slug(text);
create function public.resolve_affiliate_product_with_slug(p_link_unico text)
returns table(product_id uuid,affiliate_id uuid,slug text,sale_price numeric)
language sql security definer set search_path='public'
as $function$
 select a.product_id,a.id,p.slug,a.sale_price from public.affiliations a join public.products p on p.id=a.product_id
 where a.link_unico=p_link_unico and a.ativo=true and p.ativo=true and p.supplier_status='approved' limit 1;
$function$;

create or replace function public.create_public_checkout_session(p_affiliate_link text,p_full_name text,p_phone text,p_whatsapp text,p_email text,p_country text,p_province text,p_city text,p_postal_code text,p_address text,p_address_reference text)
returns table(session_id uuid,checkout_url text)
language plpgsql security definer set search_path=''
as $function$
declare v_link text:=regexp_replace(regexp_replace(coalesce(p_affiliate_link,''),'^https?://[^/]+',''),'^/+',''); v_link_code text; v_affiliation public.affiliations%rowtype; v_product public.products%rowtype; v_session uuid; v_amount numeric;
begin
 v_link:=split_part(split_part(v_link,'?',1),'#',1); v_link_code:=regexp_replace(v_link,'^go/',''); v_link_code:=regexp_replace(v_link_code,'/+$',''); v_link:='go/'||trim(v_link_code);
 if v_link_code='' then raise exception 'Invalid affiliate link'; end if;
 select a.* into v_affiliation from public.affiliations a where a.link_unico=v_link and a.ativo=true limit 1;
 if v_affiliation.id is null then raise exception 'Invalid affiliate link'; end if;
 select p.* into v_product from public.products p where p.id=v_affiliation.product_id and p.ativo=true and p.supplier_status='approved' and p.checkout_url is not null and p.checkout_url~'^https?://' limit 1;
 if v_product.id is null then raise exception 'Product is unavailable for checkout'; end if;
 if nullif(trim(coalesce(p_full_name,'')),'') is null or nullif(trim(coalesce(p_phone,'')),'') is null or nullif(trim(coalesce(p_country,'')),'') is null or nullif(trim(coalesce(p_province,'')),'') is null or nullif(trim(coalesce(p_city,'')),'') is null or nullif(trim(coalesce(p_address,'')),'') is null then raise exception 'Required customer delivery fields are missing'; end if;
 v_amount:=v_affiliation.sale_price;
 insert into public.checkout_sessions(affiliation_id,product_id,seller_id,affiliate_link,full_name,phone,whatsapp,email,country,province,city,postal_code,address,address_reference,amount,currency,checkout_url,status)
 values(v_affiliation.id,v_product.id,v_affiliation.vendedor_id,v_affiliation.link_unico,trim(p_full_name),trim(p_phone),nullif(trim(coalesce(p_whatsapp,'')),''),nullif(trim(coalesce(p_email,'')),''),trim(p_country),trim(p_province),trim(p_city),nullif(trim(coalesce(p_postal_code,'')),''),trim(p_address),nullif(trim(coalesce(p_address_reference,'')),''),v_amount,v_product.moeda,v_product.checkout_url,'pending')
 returning id into v_session;
 return query select v_session,v_product.checkout_url;
end;
$function$;