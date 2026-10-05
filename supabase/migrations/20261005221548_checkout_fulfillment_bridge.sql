-- Core fulfillment foundation for checkout and integration orders.

create table if not exists public.fulfillment_orders (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('integration','sale')),
  source_id uuid not null,
  integration_order_id uuid references public.integration_orders(id) on delete cascade,
  sale_id uuid references public.sales(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('pending','confirmed','processing','packed','shipped','in_transit','delivered','cancelled','failed','returned')),
  supplier_id uuid references public.profiles(id) on delete set null,
  currency text not null check (currency in ('ZAR','MZN')),
  subtotal numeric not null default 0 check (subtotal >= 0),
  shipping_amount numeric not null default 0 check (shipping_amount >= 0),
  total numeric not null default 0 check (total >= 0),
  customer jsonb not null default '{}'::jsonb,
  shipping_address jsonb not null default '{}'::jsonb,
  tracking_number text,
  carrier text,
  tracking_url text,
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists fulfillment_orders_integration_unique_idx on public.fulfillment_orders(integration_order_id) where integration_order_id is not null;
create unique index if not exists fulfillment_orders_sale_unique_idx on public.fulfillment_orders(sale_id) where sale_id is not null;
create index if not exists fulfillment_orders_status_created_idx on public.fulfillment_orders(status, created_at desc);
create index if not exists fulfillment_orders_supplier_status_idx on public.fulfillment_orders(supplier_id, status, created_at desc);

create table if not exists public.fulfillment_order_items (
  id uuid primary key default gen_random_uuid(),
  fulfillment_order_id uuid not null references public.fulfillment_orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  supplier_id uuid references public.profiles(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_sale_price numeric not null default 0 check (unit_sale_price >= 0),
  unit_cost numeric not null default 0 check (unit_cost >= 0),
  product_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists fulfillment_order_items_order_idx on public.fulfillment_order_items(fulfillment_order_id);
create index if not exists fulfillment_order_items_supplier_idx on public.fulfillment_order_items(supplier_id, created_at desc);

create table if not exists public.fulfillment_events (
  id uuid primary key default gen_random_uuid(),
  fulfillment_order_id uuid not null references public.fulfillment_orders(id) on delete cascade,
  status text not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists fulfillment_events_order_created_idx on public.fulfillment_events(fulfillment_order_id, created_at desc);

alter table public.fulfillment_orders enable row level security;
alter table public.fulfillment_order_items enable row level security;
alter table public.fulfillment_events enable row level security;

create or replace function public.fulfillment_touch_updated_at()
returns trigger language plpgsql security invoker set search_path=''
as $$ begin new.updated_at=now(); return new; end; $$;

drop trigger if exists fulfillment_orders_touch_updated_at on public.fulfillment_orders;
create trigger fulfillment_orders_touch_updated_at before update on public.fulfillment_orders
for each row execute function public.fulfillment_touch_updated_at();

create or replace function public.create_sale_fulfillment(p_sale_id uuid)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_sale public.sales%rowtype; v_product public.products%rowtype; v_fulfillment public.fulfillment_orders%rowtype; v_supplier_id uuid;
begin
 select * into v_sale from public.sales where id=p_sale_id for update;
 if not found then raise exception 'SALE_NOT_FOUND'; end if;
 select * into v_fulfillment from public.fulfillment_orders where sale_id=v_sale.id limit 1;
 if v_fulfillment.id is not null then return v_fulfillment.id; end if;
 select * into v_product from public.products where id=v_sale.product_id;
 if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;
 select case when pr.role='supplier' then pr.id else null end into v_supplier_id from public.profiles pr where pr.id=v_product.created_by;
 insert into public.fulfillment_orders(source_type,source_id,sale_id,status,currency,subtotal,shipping_amount,total,supplier_id)
 values('sale',v_sale.id,v_sale.id,'confirmed',v_product.moeda,v_sale.valor_venda,0,v_sale.valor_venda,v_supplier_id)
 returning * into v_fulfillment;
 insert into public.fulfillment_order_items(fulfillment_order_id,product_id,supplier_id,quantity,unit_sale_price,unit_cost,product_name)
 values(v_fulfillment.id,v_product.id,v_supplier_id,1,v_sale.valor_venda,coalesce(v_product.preco_custo,0),v_product.nome);
 insert into public.fulfillment_events(fulfillment_order_id,status,note,metadata)
 values(v_fulfillment.id,'confirmed','Fulfillment created from an approved NewVelion sale.',jsonb_build_object('source','checkout','sale_id',v_sale.id));
 return v_fulfillment.id;
end; $$;

create or replace function public.approve_checkout_session(p_session_id uuid)
returns table(sale_id uuid) language plpgsql security definer set search_path=''
as $$
declare s public.checkout_sessions%rowtype; new_sale_id uuid;
begin
 if not (select private.is_admin_user()) then raise exception 'Forbidden'; end if;
 select * into s from public.checkout_sessions where id=p_session_id for update;
 if not found then raise exception 'Checkout session not found'; end if;
 if s.status='approved' then
   select id into new_sale_id from public.sales where gateway_ref='newvelion_checkout:'||s.id limit 1;
   return query select new_sale_id; return;
 end if;
 if s.status<>'paid_pending_review' or s.payment_comparison_status<>'matched' then
   raise exception 'Payment must be registered and matched before approval';
 end if;
 insert into public.sales(vendedor_id,product_id,valor_venda,gateway_ref,vendido_em)
 values(s.seller_id,s.product_id,s.amount,'newvelion_checkout:'||s.id,coalesce(s.external_payment_paid_at,now()))
 returning id into new_sale_id;
 update public.checkout_sessions set status='approved',updated_at=now() where id=s.id;
 perform public.create_sale_fulfillment(new_sale_id);
 return query select new_sale_id;
end; $$;
