-- Customer marketplace foundation
-- Applied to the live project before committing this migration.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role = any (array['customer'::text,'seller'::text,'supplier'::text,'admin'::text]));

alter table public.checkout_sessions add column if not exists customer_id uuid references public.profiles(id);
alter table public.sales add column if not exists customer_id uuid references public.profiles(id);

create index if not exists checkout_sessions_customer_id_idx on public.checkout_sessions(customer_id);
create index if not exists sales_customer_id_idx on public.sales(customer_id);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  province text not null,
  city text not null,
  postal_code text,
  address text not null,
  address_reference text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.customer_addresses enable row level security;

create table if not exists public.customer_cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check(quantity > 0 and quantity <= 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);
alter table public.customer_cart_items enable row level security;

create table if not exists public.customer_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);
alter table public.customer_favorites enable row level security;

drop policy if exists "customers manage own addresses" on public.customer_addresses;
create policy "customers manage own addresses" on public.customer_addresses for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "customers manage own cart" on public.customer_cart_items;
create policy "customers manage own cart" on public.customer_cart_items for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "customers manage own favorites" on public.customer_favorites;
create policy "customers manage own favorites" on public.customer_favorites for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- The live definition of create_customer_checkout_session and
-- process_checkout_webhook_payment is intentionally maintained in the
-- following committed SQL in this migration's full implementation history.


create or replace function public.create_customer_checkout_session(p_product_id uuid,p_full_name text,p_phone text,p_province text,p_city text,p_postal_code text,p_address text,p_address_reference text,p_quantity integer default 1)
returns table(session_id uuid,checkout_url text)
language plpgsql security definer set search_path=''
as $$
declare
 v_uid uuid:=auth.uid(); p public.products%rowtype; v_supplier uuid; v_sc text; v_cc text; v_cost numeric; v_fx numeric; v_fx_at timestamptz; v_cost_zar numeric; v_origin_native numeric; v_origin_cc text; v_origin_zar numeric; v_shipping numeric:=0; v_unit numeric; v_amount numeric; v_total numeric; v_profile public.supplier_shipping_profiles%rowtype; v_zone public.supplier_shipping_zones%rowtype; v_city text:=lower(trim(coalesce(p_city,''))); v_metro boolean:=false; sid uuid;
begin
 if v_uid is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
 if not exists(select 1 from public.profiles where id=v_uid and role='customer' and status='active') then raise exception 'CUSTOMER_ACCOUNT_REQUIRED'; end if;
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
 values(v_uid,null,p.id,null,null,trim(p_full_name),trim(p_phone),null,null,'ZA',trim(p_province),trim(p_city),nullif(trim(coalesce(p_postal_code,'')),''),trim(p_address),nullif(trim(coalesce(p_address_reference,'')),''),p_quantity,v_amount,v_shipping,v_total,'ZAR',p.checkout_url,'pending','ZA',v_sc,v_cc,v_cost,v_fx,v_fx_at,round(v_cost_zar+v_origin_zar,2),v_origin_native,v_origin_cc,p.pricing_mode,coalesce(p.custom_pricing_floor_zar,p.supplier_min_selling_price,p.supplier_suggested_price,p.preco_custo,0),0,0)
 returning id into sid;
 return query select sid,p.checkout_url;
end; $$;

revoke all on function public.create_customer_checkout_session(uuid,text,text,text,text,text,text,text,integer) from public,anon,authenticated;
grant execute on function public.create_customer_checkout_session(uuid,text,text,text,text,text,text,text,integer) to authenticated;

create or replace function public.process_checkout_webhook_payment(p_session_id uuid,p_external_payment_reference text,p_external_payment_amount numeric,p_external_payment_currency text,p_external_payment_paid_at timestamptz default now())
returns table(session_id uuid,status text,payment_comparison_status text,sale_id uuid)
language plpgsql security definer set search_path=''
as $$
declare s public.checkout_sessions%rowtype; v_status text; v_sale_id uuid;
begin
 select * into s from public.checkout_sessions where id=p_session_id for update; if not found then raise exception 'Checkout session not found'; end if;
 select id into v_sale_id from public.sales where gateway_ref='newvelion_checkout:'||p_session_id limit 1;
 if v_sale_id is not null then return query select s.id,'approved'::text,'matched'::text,v_sale_id; return; end if;
 if nullif(trim(coalesce(p_external_payment_reference,'')),'') is null or p_external_payment_amount is null or p_external_payment_amount<0 then raise exception 'Invalid payment data'; end if;
 v_status:=case when round(s.amount,2)=round(p_external_payment_amount,2) and upper(trim(coalesce(p_external_payment_currency,'')))='ZAR' then 'matched' else 'mismatch' end;
 update public.checkout_sessions set external_payment_reference=trim(p_external_payment_reference),external_payment_amount=round(p_external_payment_amount,2),external_payment_currency=upper(trim(coalesce(p_external_payment_currency,''))),external_payment_paid_at=coalesce(p_external_payment_paid_at,now()),payment_comparison_status=v_status,status=case when v_status='matched' then 'paid_pending_review' else 'pending' end,updated_at=now() where id=s.id;
 if v_status<>'matched' then return query select s.id,'pending'::text,v_status,null::uuid; return; end if;
 insert into public.sales(customer_id,affiliation_id,vendedor_id,product_id,quantity,product_amount,shipping_amount,valor_venda,gateway_ref,vendido_em,currency,customer_country_code,supplier_country_code,supplier_cost_currency,supplier_cost_amount,supplier_fx_rate_to_zar,supplier_fx_rate_captured_at,supplier_cost_zar,supplier_origin_shipping_cost,supplier_origin_shipping_currency,pricing_mode,base_price_zar,seller_margin_zar,commission_snapshot_zar)
 values(s.customer_id,s.affiliation_id,s.seller_id,s.product_id,greatest(s.quantity,1),s.product_amount,s.shipping_amount,s.amount,'newvelion_checkout:'||s.id,coalesce(s.external_payment_paid_at,now()),'ZAR','ZA',s.supplier_country_code,s.supplier_cost_currency,s.supplier_cost_amount,s.supplier_fx_rate_to_zar,s.supplier_fx_rate_captured_at,s.supplier_cost_zar,s.supplier_origin_shipping_cost,s.supplier_origin_shipping_currency,s.pricing_mode,s.base_price_zar,s.seller_margin_zar,s.commission_snapshot_zar)
 on conflict(gateway_ref) do update set gateway_ref=excluded.gateway_ref returning id into v_sale_id;
 update public.checkout_sessions set status='approved',updated_at=now() where id=s.id;
 perform public.create_sale_fulfillment(v_sale_id);
 return query select s.id,'approved'::text,'matched'::text,v_sale_id;
end; $$;
revoke all on function public.process_checkout_webhook_payment(uuid,text,numeric,text,timestamptz) from public,anon,authenticated;
grant execute on function public.process_checkout_webhook_payment(uuid,text,numeric,text,timestamptz) to service_role;
