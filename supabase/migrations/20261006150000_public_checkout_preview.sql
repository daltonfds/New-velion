-- Public checkout preview used by the delivery page.
-- It exposes only the active offer/product summary and calculated ZA delivery amount.

create or replace function public.preview_public_checkout(
  p_affiliate_link text,
  p_quantity integer default 1,
  p_city text default ''
)
returns table(
  product_id uuid,
  product_name text,
  product_description text,
  product_image text,
  unit_price numeric,
  quantity integer,
  subtotal numeric,
  shipping numeric,
  total numeric,
  currency text
)
language plpgsql
stable
security definer
set search_path=''
as $function$
declare
  v_link text := regexp_replace(regexp_replace(coalesce(p_affiliate_link,''),'^https?://[^/]+',''),'^/+','');
  v_code text;
  a public.affiliations%rowtype;
  p public.products%rowtype;
  v_supplier uuid;
  v_sc text;
  v_shipping numeric := 0;
  v_amount numeric;
  v_city text := lower(trim(coalesce(p_city,'')));
  v_metro boolean := false;
  v_profile public.supplier_shipping_profiles%rowtype;
  v_zone public.supplier_shipping_zones%rowtype;
begin
  v_link := split_part(split_part(v_link,'?',1),'#',1);
  v_code := regexp_replace(regexp_replace(v_link,'^go/',''),'/+$','');
  v_link := 'go/'||trim(v_code);

  if v_code='' then raise exception 'INVALID_AFFILIATE_LINK'; end if;
  if coalesce(p_quantity,0)<=0 or p_quantity>50 then raise exception 'INVALID_QUANTITY'; end if;

  select a0.* into a
  from public.affiliations a0
  where a0.link_unico=v_link and a0.ativo=true
  limit 1;

  if a.id is null then raise exception 'INVALID_AFFILIATE_LINK'; end if;

  select pr.* into p
  from public.products pr
  where pr.id=a.product_id
    and pr.ativo=true
    and pr.supplier_status='approved'
    and pr.moeda='ZAR'
    and pr.checkout_url is not null
    and pr.checkout_url~'^https?://'
  limit 1;

  if p.id is null then raise exception 'PRODUCT_UNAVAILABLE_FOR_CHECKOUT'; end if;

  if coalesce(p.estoque,0)-coalesce(p.reserved_estoque,0)<p_quantity then
    raise exception 'PRODUCT_OUT_OF_STOCK';
  end if;

  v_amount:=round(a.sale_price*p_quantity,2);

  select id into v_supplier
  from public.profiles
  where id=p.created_by and role='supplier';

  select upper(country_code) into v_sc
  from public.supplier_profiles
  where user_id=v_supplier
  limit 1;

  v_sc:=coalesce(v_sc,upper(p.supplier_country_code));

  if v_sc is not null and v_sc not in ('ZA','CN') then
    raise exception 'SUPPLIER_COUNTRY_NOT_SUPPORTED';
  end if;

  if v_supplier is not null then
    select * into v_profile
    from public.supplier_shipping_profiles
    where user_id=v_supplier and enabled=true
    limit 1;

    if v_city in (
      'johannesburg','johannesburg cbd','sandton','pretoria','centurion',
      'cape town','bellville','durban','umhlanga','gqeberha',
      'port elizabeth','bloemfontein'
    ) then
      v_metro:=true;
    end if;

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
        (v_zone.per_kg_rate*greatest(coalesce(p.peso_kg,0),0)*p_quantity),
        2
      );
    elsif v_profile.user_id is not null then
      v_shipping:=coalesce(v_profile.default_rate,0);
    end if;

    if v_profile.free_shipping_threshold is not null
       and v_amount>=v_profile.free_shipping_threshold then
      v_shipping:=0;
    end if;
  end if;

  return query
  select
    p.id,
    p.nome,
    p.descricao,
    case when array_length(p.fotos,1)>0 then p.fotos[1] else null end,
    a.sale_price,
    p_quantity,
    v_amount,
    v_shipping,
    round(v_amount+v_shipping,2),
    'ZAR';
end;
$function$;

revoke execute on function public.preview_public_checkout(text,integer,text)
  from public,anon,authenticated;

grant execute on function public.preview_public_checkout(text,integer,text)
  to anon,authenticated;
