create or replace function public.create_integration_order(p_platform_id uuid,p_external_order_id text,p_external_seller_id uuid,p_currency text,p_items jsonb,p_customer jsonb,p_shipping_address jsonb,p_shipping_amount numeric default 0,p_metadata jsonb default '{}'::jsonb,p_idempotency_key text default null)
returns table(order_id uuid,order_status text,order_total numeric,order_currency text)
language plpgsql security definer set search_path=''
as $function$
declare
 v_order public.integration_orders%rowtype; v_item jsonb; v_mapping public.integration_product_mappings%rowtype; v_product public.products%rowtype;
 v_quantity integer; v_sale_price numeric; v_subtotal numeric:=0; v_shipping numeric:=greatest(coalesce(p_shipping_amount,0),0); v_total numeric; v_base_price numeric; v_fulfillment public.fulfillment_orders%rowtype; v_supplier_id uuid;
begin
 if not exists(select 1 from public.integration_platforms where id=p_platform_id and status='active') then raise exception 'INVALID_PLATFORM'; end if;
 if nullif(trim(p_external_order_id),'') is null then raise exception 'INVALID_ORDER'; end if;
 if p_currency not in ('ZAR','MZN') then raise exception 'INVALID_CURRENCY'; end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'INVALID_ORDER'; end if;
 select * into v_order from public.integration_orders where platform_id=p_platform_id and (external_order_id=trim(p_external_order_id) or (p_idempotency_key is not null and idempotency_key=p_idempotency_key)) limit 1;
 if v_order.id is not null then return query select v_order.id,v_order.status,v_order.total,v_order.currency; return; end if;
 if not exists(select 1 from public.integration_external_sellers where id=p_external_seller_id and platform_id=p_platform_id and status='active') then raise exception 'INVALID_SELLER'; end if;
 for v_item in select value from jsonb_array_elements(p_items) loop
  v_quantity:=coalesce((v_item->>'quantity')::integer,0); v_sale_price:=coalesce((v_item->>'sale_price')::numeric,-1);
  if v_quantity<=0 then raise exception 'INVALID_QUANTITY'; end if;
  if v_sale_price<0 then raise exception 'INVALID_ORDER'; end if;
  select m.* into v_mapping from public.integration_product_mappings m where m.platform_id=p_platform_id and m.external_product_id=trim(coalesce(v_item->>'external_product_id','')) and m.status='active' and (m.external_seller_id is null or m.external_seller_id=p_external_seller_id) order by (m.external_seller_id is not null) desc limit 1;
  if v_mapping.id is null then raise exception 'PRODUCT_NOT_MAPPED'; end if;
  if (v_item ? 'newvelion_product_id') and (v_item->>'newvelion_product_id')::uuid<>v_mapping.newvelion_product_id then raise exception 'PRODUCT_NOT_MAPPED'; end if;
  select * into v_product from public.products p where p.id=v_mapping.newvelion_product_id and p.ativo=true for update;
  if v_product.id is null then raise exception 'PRODUCT_NOT_FOUND'; end if;
  if v_product.supplier_status is distinct from 'approved' then raise exception 'PRODUCT_NOT_FOUND'; end if;
  if v_product.moeda<>p_currency then raise exception 'INVALID_CURRENCY'; end if;
  if v_product.estoque-v_product.reserved_estoque<v_quantity then raise exception 'PRODUCT_OUT_OF_STOCK'; end if;
  v_subtotal:=v_subtotal+(v_sale_price*v_quantity);
 end loop;
 v_total:=v_subtotal+v_shipping;
 insert into public.integration_orders(platform_id,external_order_id,external_seller_id,status,currency,subtotal,shipping_amount,total,customer,shipping_address,metadata,idempotency_key)
 values(p_platform_id,trim(p_external_order_id),p_external_seller_id,'confirmed',p_currency,v_subtotal,v_shipping,v_total,coalesce(p_customer,'{}'::jsonb),coalesce(p_shipping_address,'{}'::jsonb),coalesce(p_metadata,'{}'::jsonb),p_idempotency_key) returning * into v_order;
 insert into public.fulfillment_orders(source_type,source_id,integration_order_id,status,currency,subtotal,shipping_amount,total,customer,shipping_address)
 values('integration',v_order.id,v_order.id,'confirmed',p_currency,v_subtotal,v_shipping,v_total,coalesce(p_customer,'{}'::jsonb),coalesce(p_shipping_address,'{}'::jsonb)) returning * into v_fulfillment;
 for v_item in select value from jsonb_array_elements(p_items) loop
  v_quantity:=(v_item->>'quantity')::integer; v_sale_price:=(v_item->>'sale_price')::numeric;
  select m.* into v_mapping from public.integration_product_mappings m where m.platform_id=p_platform_id and m.external_product_id=trim(v_item->>'external_product_id') and m.status='active' and (m.external_seller_id is null or m.external_seller_id=p_external_seller_id) order by (m.external_seller_id is not null) desc limit 1;
  select * into v_product from public.products p where p.id=v_mapping.newvelion_product_id;
  select case when pr.role='supplier' then pr.id else null end into v_supplier_id from public.profiles pr where pr.id=v_product.created_by;
  v_base_price:=case when v_product.preco_promocional is not null and v_product.preco_promocional>0 then v_product.preco_promocional else v_product.preco end;
  insert into public.integration_order_items(order_id,mapping_id,external_product_id,newvelion_product_id,quantity,sale_price,currency,newvelion_base_price,newvelion_cost_price,product_name,metadata) values(v_order.id,v_mapping.id,trim(v_item->>'external_product_id'),v_product.id,v_quantity,v_sale_price,p_currency,v_base_price,v_product.preco_custo,v_product.nome,coalesce(v_item->'metadata','{}'::jsonb));
  insert into public.fulfillment_order_items(fulfillment_order_id,product_id,supplier_id,quantity,unit_sale_price,unit_cost,product_name,metadata) values(v_fulfillment.id,v_product.id,v_supplier_id,v_quantity,v_sale_price,coalesce(v_product.preco_custo,0),v_product.nome,coalesce(v_item->'metadata','{}'::jsonb));
  update public.products set estoque=estoque-v_quantity,reserved_estoque=reserved_estoque+v_quantity,updated_at=now() where id=v_product.id;
 end loop;
 update public.integration_orders set fulfillment_order_id=v_fulfillment.id,newvelion_base_total=(select coalesce(sum(newvelion_base_price*quantity),0) from public.integration_order_items where order_id=v_order.id),newvelion_cost_total=(select coalesce(sum(newvelion_cost_price*quantity),0) from public.integration_order_items where order_id=v_order.id),external_seller_margin=v_total-(select coalesce(sum(newvelion_base_price*quantity),0) from public.integration_order_items where order_id=v_order.id),newvelion_gross_margin=v_total-(select coalesce(sum(newvelion_cost_price*quantity),0) from public.integration_order_items where order_id=v_order.id),updated_at=now() where id=v_order.id;
 insert into public.fulfillment_events(fulfillment_order_id,status,note,metadata) values(v_fulfillment.id,'confirmed','Order created through Integration API and routed to supplier fulfillment.',jsonb_build_object('integration_order_id',v_order.id,'external_order_id',v_order.external_order_id));
 return query select v_order.id,v_order.status,v_order.total,v_order.currency;
end;
$function$;