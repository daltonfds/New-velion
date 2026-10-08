-- Correct flexible seller pricing: supplier-defined percentage applies to the actual seller sale price.
-- Supplier minimum/floor remains the server-side lower bound.

create or replace function public.create_affiliation_with_price(
  p_product_id uuid,
  p_sale_price numeric default null
)
returns table(affiliation_id uuid,affiliate_link text,sale_price numeric,pricing_mode text,base_price_zar numeric,seller_margin_zar numeric,commission_zar numeric,created boolean)
language plpgsql security definer set search_path=''
as $function$
declare
  v_user uuid:=auth.uid();
  v_product public.products%rowtype;
  v_aff public.affiliations%rowtype;
  v_snapshot record;
  v_price numeric;
  v_margin numeric;
  v_commission_rate numeric;
  v_commission numeric;
  v_created boolean:=false;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  if not exists(select 1 from public.profiles where id=v_user and role='seller' and status='active') then raise exception 'SELLER_ACCESS_REQUIRED'; end if;
  select * into v_product from public.products where id=p_product_id and ativo=true and supplier_status='approved';
  if not found then raise exception 'PRODUCT_NOT_AVAILABLE'; end if;
  select * into v_snapshot from private.product_pricing_snapshot(p_product_id);

  if v_product.pricing_mode='fixed' then
    v_price:=v_snapshot.fixed_sale_price_zar;
    if p_sale_price is not null and abs(p_sale_price-v_price)>0.01 then raise exception 'FIXED_PRICING_DOES_NOT_ALLOW_CUSTOM_PRICE'; end if;
  else
    v_price:=round(p_sale_price,2);
    if v_price is null or v_price<=0 then raise exception 'SALE_PRICE_REQUIRED_FOR_CUSTOM_PRICING'; end if;
    if v_price<v_snapshot.base_price_zar then raise exception 'SALE_PRICE_BELOW_BASE_PRICE'; end if;
  end if;

  v_margin:=greatest(round(v_price-v_snapshot.base_price_zar,2),0);
  v_commission_rate:=greatest(coalesce(v_product.supplier_commission_rate,
    case when v_product.comissao_tipo='percentual' then v_product.comissao_valor else 0 end),0);
  if v_commission_rate>100 then raise exception 'INVALID_SUPPLIER_COMMISSION_RATE'; end if;

  if v_product.comissao_tipo='fixo' and coalesce(v_product.supplier_commission_rate,0)=0 and v_product.pricing_mode='fixed' then
    v_commission:=greatest(coalesce(v_product.comissao_valor,0),0);
  else
    v_commission:=round(v_price*v_commission_rate/100,2);
  end if;

  select * into v_aff from public.affiliations where vendedor_id=v_user and product_id=p_product_id order by created_at desc limit 1 for update;
  if v_aff.id is not null then
    update public.affiliations
    set sale_price=v_price,pricing_mode=v_product.pricing_mode,base_price_zar=v_snapshot.base_price_zar,
        seller_margin_zar=v_margin,commission_snapshot_zar=v_commission,ativo=true
    where id=v_aff.id returning * into v_aff;
  else
    insert into public.affiliations(vendedor_id,product_id,sale_price,pricing_mode,base_price_zar,seller_margin_zar,commission_snapshot_zar,ativo)
    values(v_user,p_product_id,v_price,v_product.pricing_mode,v_snapshot.base_price_zar,v_margin,v_commission,true)
    returning * into v_aff;
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
declare
  p public.products%rowtype;
  s public.platform_settings%rowtype;
  a public.affiliations%rowtype;
  v_commission_rate numeric;
  v_desired numeric;
  v_qty integer;
begin
  select * into p from public.products where id=new.product_id for share;
  if not found then raise exception 'Product not found'; end if;
  if new.vendedor_id=p.created_by then raise exception 'Self-referral is not allowed'; end if;
  select * into s from public.platform_settings where id=true;
  v_qty:=greatest(coalesce(new.quantity,1),1);
  new.product_amount:=greatest(coalesce(new.product_amount,new.valor_venda-coalesce(new.shipping_amount,0)),0);
  new.taxa_gateway:=round(new.valor_venda*0.10,2);
  new.taxa_plataforma:=round(new.valor_venda*coalesce(s.transaction_fee_percent,10)/100,2);

  if new.affiliation_id is not null then
    select * into a from public.affiliations where id=new.affiliation_id for share;
    if a.id is null then raise exception 'AFFILIATION_NOT_FOUND'; end if;
    if a.vendedor_id<>new.vendedor_id or a.product_id<>new.product_id then raise exception 'AFFILIATION_MISMATCH'; end if;
    new.pricing_mode:=a.pricing_mode;
    new.base_price_zar:=coalesce(a.base_price_zar,0);
    new.seller_margin_zar:=greatest(round(new.valor_venda-new.base_price_zar,2),0);
    v_commission_rate:=greatest(coalesce(p.supplier_commission_rate,
      case when p.comissao_tipo='percentual' then p.comissao_valor else 0 end),0);
    if v_commission_rate>100 then raise exception 'INVALID_SUPPLIER_COMMISSION_RATE'; end if;
    if p.comissao_tipo='fixo' and coalesce(p.supplier_commission_rate,0)=0 and a.pricing_mode='fixed' then
      v_desired:=greatest(coalesce(p.comissao_valor,0)*v_qty,0);
    else
      v_desired:=round(new.product_amount*v_commission_rate/100,2);
    end if;
    new.commission_snapshot_zar:=v_desired;
  elsif new.pricing_mode='custom' then
    v_commission_rate:=greatest(coalesce(p.supplier_commission_rate,
      case when p.comissao_tipo='percentual' then p.comissao_valor else 0 end),0);
    if v_commission_rate>100 then raise exception 'INVALID_SUPPLIER_COMMISSION_RATE'; end if;
    v_desired:=round(new.product_amount*v_commission_rate/100,2);
    new.commission_snapshot_zar:=v_desired;
  else
    if p.comissao_tipo='percentual' then v_desired:=round(new.product_amount*p.comissao_valor/100,2);
    else v_desired:=round(p.comissao_valor*v_qty,2); end if;
    new.commission_snapshot_zar:=v_desired;
  end if;

  new.comissao_vendedor:=greatest(v_desired,0);
  new.ganho_plataforma:=greatest(0,new.valor_venda-new.taxa_gateway-new.comissao_vendedor-coalesce(new.supplier_cost_zar,0));
  new.valor_garantia:=round(new.comissao_vendedor*0.10,2);
  new.garantia_libera_em:=coalesce(new.garantia_libera_em,new.vendido_em+make_interval(days=>coalesce(s.hold_days,7)));
  return new;
end;
$function$;