-- Integration API -> core fulfillment bridge.

alter table public.fulfillment_orders
  add column if not exists integration_order_id uuid references public.integration_orders(id) on delete cascade,
  add column if not exists sale_id uuid references public.sales(id) on delete cascade,
  add column if not exists supplier_id uuid references public.profiles(id) on delete set null;

alter table public.integration_orders
  add column if not exists fulfillment_order_id uuid references public.fulfillment_orders(id) on delete set null,
  add column if not exists newvelion_base_total numeric not null default 0,
  add column if not exists newvelion_cost_total numeric not null default 0,
  add column if not exists external_seller_margin numeric not null default 0,
  add column if not exists newvelion_gross_margin numeric not null default 0;

alter table public.integration_order_items
  add column if not exists external_seller_margin numeric not null default 0,
  add column if not exists newvelion_gross_margin numeric not null default 0;

create or replace function public.create_integration_fulfillment(p_integration_order_id uuid)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_order public.integration_orders%rowtype; v_fulfillment public.fulfillment_orders%rowtype; v_item public.integration_order_items%rowtype; v_supplier_id uuid;
begin
 select * into v_order from public.integration_orders where id=p_integration_order_id for update;
 if not found then raise exception 'INTEGRATION_ORDER_NOT_FOUND'; end if;
 if v_order.fulfillment_order_id is not null then return v_order.fulfillment_order_id; end if;
 insert into public.fulfillment_orders(source_type,source_id,integration_order_id,status,currency,subtotal,shipping_amount,total,customer,shipping_address)
 values('integration',v_order.id,v_order.id,v_order.status,v_order.currency,v_order.subtotal,v_order.shipping_amount,v_order.total,v_order.customer,v_order.shipping_address)
 returning * into v_fulfillment;
 for v_item in select * from public.integration_order_items where order_id=v_order.id order by created_at,id loop
   select case when pr.role='supplier' then pr.id else null end into v_supplier_id
   from public.products p left join public.profiles pr on pr.id=p.created_by where p.id=v_item.newvelion_product_id;
   insert into public.fulfillment_order_items(fulfillment_order_id,product_id,supplier_id,quantity,unit_sale_price,unit_cost,product_name,metadata)
   values(v_fulfillment.id,v_item.newvelion_product_id,v_supplier_id,v_item.quantity,v_item.sale_price,coalesce(v_item.newvelion_cost_price,0),v_item.product_name,v_item.metadata);
 end loop;
 update public.integration_orders set fulfillment_order_id=v_fulfillment.id,updated_at=now() where id=v_order.id;
 insert into public.fulfillment_events(fulfillment_order_id,status,note,metadata)
 values(v_fulfillment.id,v_fulfillment.status,'Fulfillment created from Integration API order.',jsonb_build_object('source','integration_api','integration_order_id',v_order.id,'external_order_id',v_order.external_order_id));
 return v_fulfillment.id;
end; $$;

create or replace function public.set_fulfillment_status(
 p_fulfillment_order_id uuid,p_status text,p_tracking_number text default null,p_carrier text default null,p_tracking_url text default null,p_note text default null,p_actor_id uuid default null
)
returns table(fulfillment_order_id uuid,source_type text,integration_order_id uuid,platform_id uuid,external_order_id text,status text,tracking_number text,carrier text,tracking_url text)
language plpgsql security definer set search_path=''
as $$
declare v_order public.fulfillment_orders%rowtype; v_updated public.fulfillment_orders%rowtype; v_platform_id uuid; v_external_order_id text;
begin
 if p_status not in ('pending','confirmed','processing','packed','shipped','in_transit','delivered','cancelled','failed','returned') then raise exception 'INVALID_FULFILLMENT_STATUS'; end if;
 select * into v_order from public.fulfillment_orders where id=p_fulfillment_order_id for update;
 if not found then raise exception 'FULFILLMENT_NOT_FOUND'; end if;
 if v_order.status='delivered' and p_status not in ('delivered','returned') then raise exception 'FULFILLMENT_STATUS_CONFLICT'; end if;
 update public.fulfillment_orders
 set status=p_status,
     tracking_number=coalesce(nullif(trim(p_tracking_number),''),tracking_number),
     carrier=coalesce(nullif(trim(p_carrier),''),carrier),
     tracking_url=coalesce(nullif(trim(p_tracking_url),''),tracking_url),
     fulfilled_at=case when p_status='delivered' then coalesce(fulfilled_at,now()) else fulfilled_at end,
     updated_at=now()
 where id=v_order.id returning * into v_updated;
 insert into public.fulfillment_events(fulfillment_order_id,status,note,metadata,created_by)
 values(v_updated.id,p_status,nullif(trim(p_note),''),jsonb_build_object('tracking_number',v_updated.tracking_number,'carrier',v_updated.carrier,'tracking_url',v_updated.tracking_url),p_actor_id);
 if v_updated.integration_order_id is not null then
   update public.integration_orders
   set status=p_status,tracking_number=v_updated.tracking_number,carrier=v_updated.carrier,tracking_url=v_updated.tracking_url,updated_at=now()
   where id=v_updated.integration_order_id
   returning platform_id,external_order_id into v_platform_id,v_external_order_id;
 end if;
 return query select v_updated.id,v_updated.source_type,v_updated.integration_order_id,v_platform_id,v_external_order_id,v_updated.status,v_updated.tracking_number,v_updated.carrier,v_updated.tracking_url;
end; $$;

create function public.create_integration_order_v2(
 p_platform_id uuid,p_external_order_id text,p_external_seller_id uuid,p_currency text,p_items jsonb,p_customer jsonb,p_shipping_address jsonb,p_shipping_amount numeric default 0,p_metadata jsonb default '{}'::jsonb,p_idempotency_key text default null
)
returns table(order_id uuid,order_status text,order_total numeric,order_currency text)
language plpgsql security definer set search_path=''
as $$
declare
 v_order public.integration_orders%rowtype;
 v_item jsonb;
 v_mapping public.integration_product_mappings%rowtype;
 v_product public.products%rowtype;
 v_quantity integer;
 v_sale_price numeric;
 v_subtotal numeric:=0;
 v_base_total numeric:=0;
 v_cost_total numeric:=0;
 v_shipping numeric:=greatest(coalesce(p_shipping_amount,0),0);
 v_total numeric;
 v_base_price numeric;
 v_cost_price numeric;
begin
 if not exists(select 1 from public.integration_platforms where id=p_platform_id and status='active') then raise exception 'INVALID_PLATFORM'; end if;
 if nullif(trim(p_external_order_id),'') is null then raise exception 'INVALID_ORDER'; end if;
 if p_currency not in ('ZAR','MZN') then raise exception 'INVALID_CURRENCY'; end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'INVALID_ORDER'; end if;
 select * into v_order from public.integration_orders
 where platform_id=p_platform_id
   and (external_order_id=trim(p_external_order_id) or (p_idempotency_key is not null and idempotency_key=p_idempotency_key))
 limit 1;
 if v_order.id is not null then return query select v_order.id,v_order.status,v_order.total,v_order.currency; return; end if;
 if not exists(select 1 from public.integration_external_sellers where id=p_external_seller_id and platform_id=p_platform_id and status='active') then raise exception 'INVALID_SELLER'; end if;
 for v_item in select value from jsonb_array_elements(p_items) loop
   v_quantity:=coalesce((v_item->>'quantity')::integer,0);
   v_sale_price:=coalesce((v_item->>'sale_price')::numeric,-1);
   if v_quantity<=0 then raise exception 'INVALID_QUANTITY'; end if;
   if v_sale_price<0 then raise exception 'INVALID_ORDER'; end if;
   select m.* into v_mapping
   from public.integration_product_mappings m
   where m.platform_id=p_platform_id
     and m.external_product_id=trim(coalesce(v_item->>'external_product_id',''))
     and m.status='active'
     and (m.external_seller_id is null or m.external_seller_id=p_external_seller_id)
   order by (m.external_seller_id is not null) desc
   limit 1;
   if v_mapping.id is null then raise exception 'PRODUCT_NOT_MAPPED'; end if;
   if (v_item ? 'newvelion_product_id') and (v_item->>'newvelion_product_id')::uuid<>v_mapping.newvelion_product_id then raise exception 'PRODUCT_NOT_MAPPED'; end if;
   select * into v_product from public.products p where p.id=v_mapping.newvelion_product_id and p.ativo=true for update;
   if v_product.id is null then raise exception 'PRODUCT_NOT_FOUND'; end if;
   if v_product.moeda<>p_currency then raise exception 'INVALID_CURRENCY'; end if;
   if v_product.estoque<v_quantity then raise exception 'PRODUCT_OUT_OF_STOCK'; end if;
   v_base_price:=case when v_product.preco_promocional is not null and v_product.preco_promocional>0 then v_product.preco_promocional else v_product.preco end;
   v_cost_price:=greatest(coalesce(v_product.preco_custo,0),0);
   v_subtotal:=v_subtotal+(v_sale_price*v_quantity);
   v_base_total:=v_base_total+(v_base_price*v_quantity);
   v_cost_total:=v_cost_total+(v_cost_price*v_quantity);
   update public.products set estoque=estoque-v_quantity,updated_at=now() where id=v_product.id;
 end loop;
 v_total:=v_subtotal+v_shipping;
 insert into public.integration_orders(
   platform_id,external_order_id,external_seller_id,status,currency,subtotal,shipping_amount,total,customer,shipping_address,metadata,idempotency_key,
   newvelion_base_total,newvelion_cost_total,external_seller_margin,newvelion_gross_margin
 )
 values(
   p_platform_id,trim(p_external_order_id),p_external_seller_id,'confirmed',p_currency,v_subtotal,v_shipping,v_total,
   coalesce(p_customer,'{}'::jsonb),coalesce(p_shipping_address,'{}'::jsonb),coalesce(p_metadata,'{}'::jsonb),p_idempotency_key,
   v_base_total,v_cost_total,v_subtotal-v_base_total,v_base_total-v_cost_total
 )
 returning * into v_order;
 for v_item in select value from jsonb_array_elements(p_items) loop
   v_quantity:=(v_item->>'quantity')::integer;
   v_sale_price:=(v_item->>'sale_price')::numeric;
   select m.* into v_mapping from public.integration_product_mappings m
   where m.platform_id=p_platform_id and m.external_product_id=trim(coalesce(v_item->>'external_product_id',''))
     and m.status='active' and (m.external_seller_id is null or m.external_seller_id=p_external_seller_id)
   order by (m.external_seller_id is not null) desc limit 1;
   select * into v_product from public.products where id=v_mapping.newvelion_product_id;
   v_base_price:=case when v_product.preco_promocional is not null and v_product.preco_promocional>0 then v_product.preco_promocional else v_product.preco end;
   v_cost_price:=greatest(coalesce(v_product.preco_custo,0),0);
   insert into public.integration_order_items(
     order_id,mapping_id,external_product_id,newvelion_product_id,quantity,sale_price,currency,newvelion_base_price,newvelion_cost_price,product_name,metadata,
     external_seller_margin,newvelion_gross_margin
   )
   values(
     v_order.id,v_mapping.id,trim(v_item->>'external_product_id'),v_product.id,v_quantity,v_sale_price,p_currency,v_base_price,v_cost_price,v_product.nome,coalesce(v_item->'metadata','{}'::jsonb),
     (v_sale_price-v_base_price)*v_quantity,(v_base_price-v_cost_price)*v_quantity
   );
 end loop;
 perform public.create_integration_fulfillment(v_order.id);
 return query select v_order.id,v_order.status,v_order.total,v_order.currency;
end; $$;
