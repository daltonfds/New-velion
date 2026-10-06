-- NewVelion: suppliers only ZA/CN; customers/delivery/checkout only ZA/ZAR.
-- Supplier operating currency:
--   ZA => ZAR
--   CN => CNY
-- Customer-facing sale/checkout currency is always ZAR.

alter table public.supplier_profiles
  add column if not exists payout_currency text;

update public.supplier_profiles
set payout_currency = case when upper(country_code)='CN' then 'CNY' else 'ZAR' end
where payout_currency is null;

create or replace function public.enforce_newvelion_supplier_geo()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  new.country_code := upper(nullif(trim(new.country_code),''));
  if new.country_code not in ('ZA','CN') then raise exception 'SUPPLIER_COUNTRY_NOT_SUPPORTED'; end if;
  new.country_name := case new.country_code when 'ZA' then 'South Africa' when 'CN' then 'China' end;
  new.calling_code := case new.country_code when 'ZA' then '+27' when 'CN' then '+86' end;
  new.payout_currency := case new.country_code when 'ZA' then 'ZAR' when 'CN' then 'CNY' end;
  return new;
end;
$$;

drop trigger if exists supplier_geo_policy on public.supplier_profiles;
create trigger supplier_geo_policy
before insert or update of country_code,payout_currency on public.supplier_profiles
for each row execute function public.enforce_newvelion_supplier_geo();

alter table public.products
  add column if not exists supplier_country_code text,
  add column if not exists supplier_cost_currency text,
  add column if not exists supplier_cost_amount numeric,
  add column if not exists supplier_fx_rate_to_zar numeric,
  add column if not exists supplier_fx_rate_captured_at timestamptz,
  add column if not exists supplier_fx_source text,
  add column if not exists supplier_origin_shipping_cost numeric not null default 0,
  add column if not exists supplier_origin_shipping_currency text;

create or replace function public.enforce_newvelion_product_geo_currency()
returns trigger language plpgsql security definer set search_path=''
as $$
declare supplier_country text;
begin
  select upper(sp.country_code) into supplier_country
  from public.supplier_profiles sp where sp.user_id=new.created_by;

  if supplier_country is null then
    select upper(p.country_code) into supplier_country
    from public.profiles p where p.id=new.created_by;
  end if;

  if supplier_country is not null and supplier_country not in ('ZA','CN') then
    raise exception 'SUPPLIER_COUNTRY_NOT_SUPPORTED';
  end if;

  if new.supplier_country_code is null and supplier_country is not null then
    new.supplier_country_code := supplier_country;
  end if;

  if new.supplier_country_code is not null then
    new.supplier_country_code := upper(trim(new.supplier_country_code));
    if new.supplier_country_code not in ('ZA','CN') then
      raise exception 'SUPPLIER_COUNTRY_NOT_SUPPORTED';
    end if;
  end if;

  if new.moeda <> 'ZAR' then
    raise exception 'PRODUCT_SALE_CURRENCY_MUST_BE_ZAR';
  end if;

  if new.supplier_country_code='CN' then
    new.supplier_cost_currency := coalesce(new.supplier_cost_currency,'CNY');
    if new.supplier_cost_currency <> 'CNY' then raise exception 'CHINA_SUPPLIER_COST_MUST_BE_CNY'; end if;
    new.supplier_origin_shipping_currency := coalesce(new.supplier_origin_shipping_currency,'CNY');
  elsif new.supplier_country_code='ZA' then
    new.supplier_cost_currency := coalesce(new.supplier_cost_currency,'ZAR');
    if new.supplier_cost_currency <> 'ZAR' then raise exception 'ZA_SUPPLIER_COST_MUST_BE_ZAR'; end if;
    new.supplier_origin_shipping_currency := coalesce(new.supplier_origin_shipping_currency,'ZAR');
  end if;

  return new;
end;
$$;

drop trigger if exists product_geo_currency_policy on public.products;
create trigger product_geo_currency_policy
before insert or update of moeda,created_by,supplier_country_code,supplier_cost_currency,supplier_fx_rate_to_zar,supplier_origin_shipping_currency
on public.products for each row execute function public.enforce_newvelion_product_geo_currency();

alter table public.checkout_sessions add column if not exists customer_country_code text;
alter table public.sales add column if not exists currency text not null default 'ZAR';
alter table public.sales add column if not exists customer_country_code text;
alter table public.integration_orders add column if not exists customer_country_code text;

create or replace function public.enforce_checkout_za_zar()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if upper(coalesce(new.country,'')) not in ('ZA','SOUTH AFRICA','ZAF') then
    raise exception 'CUSTOMER_COUNTRY_MUST_BE_ZA';
  end if;
  new.country := 'ZA';
  new.currency := 'ZAR';
  return new;
end;
$$;

drop trigger if exists checkout_za_zar_policy on public.checkout_sessions;
create trigger checkout_za_zar_policy
before insert or update of country,currency on public.checkout_sessions
for each row execute function public.enforce_checkout_za_zar();

create or replace function public.enforce_integration_za_zar()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  if tg_table_name='integration_orders' then
    if new.currency <> 'ZAR' then raise exception 'INTEGRATION_ORDER_CURRENCY_MUST_BE_ZAR'; end if;
    if upper(coalesce(new.shipping_address->>'country','')) not in ('ZA','SOUTH AFRICA','ZAF') then
      raise exception 'INTEGRATION_CUSTOMER_COUNTRY_MUST_BE_ZA';
    end if;
  elsif tg_table_name='integration_product_mappings' then
    if new.sale_currency is not null and new.sale_currency <> 'ZAR' then raise exception 'INTEGRATION_SALE_CURRENCY_MUST_BE_ZAR'; end if;
    new.sale_currency := 'ZAR';
  end if;
  return new;
end;
$$;

drop trigger if exists integration_orders_za_zar_policy on public.integration_orders;
create trigger integration_orders_za_zar_policy
before insert or update of currency,shipping_address on public.integration_orders
for each row execute function public.enforce_integration_za_zar();

drop trigger if exists integration_mappings_za_zar_policy on public.integration_product_mappings;
create trigger integration_mappings_za_zar_policy
before insert or update of sale_currency on public.integration_product_mappings
for each row execute function public.enforce_integration_za_zar();

alter table public.wallet_entries add column if not exists currency text not null default 'ZAR';

create or replace function public.create_sale_fulfillment(p_sale_id uuid)
returns uuid language plpgsql security definer set search_path=''
as $$
declare
 v_sale public.sales%rowtype;
 v_product public.products%rowtype;
 v_fulfillment public.fulfillment_orders%rowtype;
 v_supplier_id uuid;
 v_supplier_currency text;
 v_cost_amount numeric;
 v_fx numeric;
 v_cost_zar numeric;
begin
 select * into v_sale from public.sales where id=p_sale_id for update;
 if not found then raise exception 'SALE_NOT_FOUND'; end if;

 select * into v_fulfillment from public.fulfillment_orders where sale_id=v_sale.id limit 1;
 if v_fulfillment.id is not null then return v_fulfillment.id; end if;

 select * into v_product from public.products where id=v_sale.product_id;
 if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;

 select case when pr.role='supplier' then pr.id else null end
 into v_supplier_id from public.profiles pr where pr.id=v_product.created_by;

 v_supplier_currency := coalesce(v_product.supplier_cost_currency,
   case when v_product.supplier_country_code='CN' then 'CNY' else 'ZAR' end);
 v_cost_amount := coalesce(v_product.supplier_cost_amount,v_product.preco_custo,0);
 v_fx := case when v_supplier_currency='CNY' then v_product.supplier_fx_rate_to_zar else 1 end;

 if v_supplier_currency='CNY' and (v_fx is null or v_fx<=0) then
   raise exception 'SUPPLIER_FX_RATE_REQUIRED';
 end if;

 v_cost_zar := round(v_cost_amount*v_fx,2);

 insert into public.fulfillment_orders(
   source_type,source_id,sale_id,status,currency,subtotal,shipping_amount,total,supplier_id,
   supplier_cost_currency,supplier_cost_total,supplier_fx_rate_to_zar,supplier_fx_rate_captured_at
 ) values(
   'sale',v_sale.id,v_sale.id,'confirmed','ZAR',v_sale.valor_venda,
   coalesce(v_sale.shipping_amount,0),v_sale.valor_venda,v_supplier_id,
   v_supplier_currency,v_cost_amount,v_fx,
   case when v_supplier_currency='CNY' then v_product.supplier_fx_rate_captured_at else now() end
 ) returning * into v_fulfillment;

 insert into public.fulfillment_order_items(
   fulfillment_order_id,product_id,supplier_id,quantity,unit_sale_price,unit_cost,
   product_name,supplier_cost_currency,supplier_fx_rate_to_zar,supplier_cost_zar
 ) values(
   v_fulfillment.id,v_product.id,v_supplier_id,coalesce(v_sale.quantity,1),
   v_sale.valor_venda/greatest(coalesce(v_sale.quantity,1),1),v_cost_amount,v_product.nome,
   v_supplier_currency,v_fx,v_cost_zar
 );

 insert into public.fulfillment_events(fulfillment_order_id,status,note,metadata)
 values(v_fulfillment.id,'confirmed',
   'Fulfillment created from an approved NewVelion sale.',
   jsonb_build_object(
     'source','checkout','sale_id',v_sale.id,'customer_currency','ZAR',
     'supplier_cost_currency',v_supplier_currency,'supplier_cost_amount',v_cost_amount,
     'supplier_fx_rate_to_zar',v_fx
   ));

 return v_fulfillment.id;
end;
$$;


alter table public.wallet_entries add column if not exists currency text not null default 'ZAR';

create or replace function private.post_sale_to_ledger()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare v_product public.products%rowtype; v_supplier_id uuid; v_supplier_amount numeric; v_supplier_currency text;
begin
 insert into public.wallet_entries(vendedor_id,sale_id,tipo,valor,estado,currency)
 values(new.vendedor_id,new.id,'comissao',new.comissao_vendedor-new.valor_garantia,'disponivel','ZAR'),
       (new.vendedor_id,new.id,'garantia_retida',new.valor_garantia,'retido','ZAR');
 select p.* into v_product from public.products p where p.id=new.product_id;
 if found then
  select pr.id into v_supplier_id from public.profiles pr where pr.id=v_product.created_by and pr.role='supplier';
  v_supplier_currency:=coalesce(v_product.supplier_cost_currency,case when v_product.supplier_country_code='CN' then 'CNY' else 'ZAR' end);
  v_supplier_amount:=greatest(coalesce(v_product.supplier_cost_amount,v_product.preco_custo,0),0)*greatest(coalesce(new.quantity,1),1);
  if v_supplier_id is not null and v_supplier_amount>0 then
   insert into public.wallet_entries(vendedor_id,sale_id,tipo,valor,estado,currency)
   values(v_supplier_id,new.id,'supplier_earning',v_supplier_amount,'retido',v_supplier_currency)
   on conflict(sale_id,vendedor_id,tipo) do update set valor=excluded.valor,currency=excluded.currency;
  end if;
 end if;
 return new;
end;
$function$;

create or replace function private.post_integration_order_to_ledger(p_order_id uuid)
returns void language plpgsql security definer set search_path=''
as $function$
declare r record; v_currency text; v_amount numeric;
begin
 for r in
  select io.id integration_order_id,oi.newvelion_product_id,oi.quantity,p.created_by,p.supplier_country_code,p.supplier_cost_currency,p.supplier_cost_amount,p.preco_custo
  from public.integration_orders io join public.integration_order_items oi on oi.order_id=io.id
  join public.products p on p.id=oi.newvelion_product_id
  join public.profiles pr on pr.id=p.created_by and pr.role='supplier'
  where io.id=p_order_id
 loop
  v_currency:=coalesce(r.supplier_cost_currency,case when r.supplier_country_code='CN' then 'CNY' else 'ZAR' end);
  v_amount:=round(coalesce(r.supplier_cost_amount,r.preco_custo,0)*r.quantity,2);
  if r.created_by is not null and v_amount>0 then
   insert into public.wallet_entries(vendedor_id,integration_order_id,tipo,valor,estado,currency)
   values(r.created_by,r.integration_order_id,'supplier_earning',v_amount,'retido',v_currency)
   on conflict (integration_order_id,vendedor_id,tipo) do update set valor=excluded.valor,currency=excluded.currency;
  end if;
 end loop;
end;
$function$;

create or replace function public.enforce_customer_shipping_currency()
returns trigger language plpgsql security definer set search_path=''
as $$ begin new.currency:='ZAR'; return new; end; $$;
drop trigger if exists supplier_shipping_customer_currency_policy on public.supplier_shipping_profiles;
create trigger supplier_shipping_customer_currency_policy before insert or update of currency on public.supplier_shipping_profiles for each row execute function public.enforce_customer_shipping_currency();


revoke execute on function public.enforce_newvelion_supplier_geo() from public,anon,authenticated;
revoke execute on function public.enforce_newvelion_product_geo_currency() from public,anon,authenticated;
revoke execute on function public.enforce_checkout_za_zar() from public,anon,authenticated;
revoke execute on function public.enforce_integration_za_zar() from public,anon,authenticated;
revoke execute on function public.enforce_customer_shipping_currency() from public,anon,authenticated;
revoke execute on function public.capture_supplier_fx_for_integration_item() from public,anon,authenticated;
