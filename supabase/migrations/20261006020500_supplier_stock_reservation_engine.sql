create or replace function public.create_sale_fulfillment(p_sale_id uuid)
returns uuid language plpgsql security definer set search_path=''
as $function$
declare v_sale public.sales%rowtype; v_product public.products%rowtype; v_fulfillment public.fulfillment_orders%rowtype; v_supplier_id uuid;
begin
 select * into v_sale from public.sales where id=p_sale_id for update;
 if not found then raise exception 'SALE_NOT_FOUND'; end if;
 select * into v_fulfillment from public.fulfillment_orders where sale_id=v_sale.id limit 1;
 if v_fulfillment.id is not null then return v_fulfillment.id; end if;
 select * into v_product from public.products where id=v_sale.product_id for update;
 if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;
 if v_product.estoque<1 then raise exception 'PRODUCT_OUT_OF_STOCK'; end if;
 select case when pr.role='supplier' then pr.id else null end into v_supplier_id from public.profiles pr where pr.id=v_product.created_by;
 update public.products set estoque=estoque-1,reserved_estoque=reserved_estoque+1,updated_at=now() where id=v_product.id;
 insert into public.fulfillment_orders(source_type,source_id,sale_id,status,currency,subtotal,shipping_amount,total,supplier_id)
 values('sale',v_sale.id,v_sale.id,'confirmed',v_product.moeda,v_sale.valor_venda,0,v_sale.valor_venda,v_supplier_id)
 returning * into v_fulfillment;
 insert into public.fulfillment_order_items(fulfillment_order_id,product_id,supplier_id,quantity,unit_sale_price,unit_cost,product_name)
 values(v_fulfillment.id,v_product.id,v_supplier_id,1,v_sale.valor_venda,coalesce(v_product.preco_custo,0),v_product.nome);
 insert into public.fulfillment_events(fulfillment_order_id,status,note,metadata)
 values(v_fulfillment.id,'confirmed','Stock reserved for sale.',jsonb_build_object('sale_id',v_sale.id,'product_id',v_product.id));
 return v_fulfillment.id;
end;
$function$;

create or replace function public.create_integration_fulfillment(p_integration_order_id uuid)
returns uuid language plpgsql security definer set search_path=''
as $function$
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
   update public.products set reserved_estoque=reserved_estoque+v_item.quantity,updated_at=now() where id=v_item.newvelion_product_id;
 end loop;
 update public.integration_orders set fulfillment_order_id=v_fulfillment.id,updated_at=now() where id=v_order.id;
 insert into public.fulfillment_events(fulfillment_order_id,status,note,metadata)
 values(v_fulfillment.id,v_fulfillment.status,'Fulfillment created from Integration API order.',jsonb_build_object('source','integration_api','integration_order_id',v_order.id,'external_order_id',v_order.external_order_id));
 return v_fulfillment.id;
end;
$function$;

create or replace function public.set_fulfillment_status(
 p_fulfillment_order_id uuid,p_status text,p_tracking_number text default null,p_carrier text default null,
 p_tracking_url text default null,p_note text default null,p_actor_id uuid default null
)
returns table(fulfillment_order_id uuid,source_type text,integration_order_id uuid,platform_id uuid,external_order_id text,status text,tracking_number text,carrier text,tracking_url text)
language plpgsql security definer set search_path=''
as $function$
declare v_order public.fulfillment_orders%rowtype; v_updated public.fulfillment_orders%rowtype; v_platform_id uuid; v_external_order_id text; v_item record; v_released boolean:=false;
begin
 if p_status not in ('pending','confirmed','processing','packed','shipped','in_transit','delivered','cancelled','failed','returned') then raise exception 'INVALID_FULFILLMENT_STATUS'; end if;
 select * into v_order from public.fulfillment_orders where id=p_fulfillment_order_id for update;
 if not found then raise exception 'FULFILLMENT_NOT_FOUND'; end if;
 if v_order.status='delivered' and p_status not in ('delivered','returned') then raise exception 'FULFILLMENT_STATUS_CONFLICT'; end if;
 if v_order.status in ('pending','confirmed','processing','packed') and p_status in ('shipped','in_transit','delivered') then
   for v_item in select * from public.fulfillment_order_items where fulfillment_order_id=v_order.id loop
     update public.products set reserved_estoque=greatest(0,reserved_estoque-v_item.quantity),updated_at=now() where id=v_item.product_id;
   end loop;
   v_released:=true;
 elsif v_order.status in ('pending','confirmed','processing','packed') and p_status in ('cancelled','failed','returned') then
   for v_item in select * from public.fulfillment_order_items where fulfillment_order_id=v_order.id loop
     update public.products set estoque=estoque+v_item.quantity,reserved_estoque=greatest(0,reserved_estoque-v_item.quantity),updated_at=now() where id=v_item.product_id;
   end loop;
 end if;
 update public.fulfillment_orders set status=p_status,tracking_number=coalesce(nullif(trim(p_tracking_number),''),tracking_number),carrier=coalesce(nullif(trim(p_carrier),''),carrier),tracking_url=coalesce(nullif(trim(p_tracking_url),''),tracking_url),fulfilled_at=case when p_status='delivered' then coalesce(fulfilled_at,now()) else fulfilled_at end,updated_at=now()
 where id=v_order.id returning * into v_updated;
 insert into public.fulfillment_events(fulfillment_order_id,status,note,metadata,created_by)
 values(v_updated.id,p_status,nullif(trim(p_note),''),jsonb_build_object('tracking_number',v_updated.tracking_number,'carrier',v_updated.carrier,'tracking_url',v_updated.tracking_url,'stock_released',v_released),p_actor_id);
 if v_updated.integration_order_id is not null then
   update public.integration_orders set status=p_status,tracking_number=v_updated.tracking_number,carrier=v_updated.carrier,tracking_url=v_updated.tracking_url,updated_at=now()
   where id=v_updated.integration_order_id returning platform_id,external_order_id into v_platform_id,v_external_order_id;
 end if;
 return query select v_updated.id,v_updated.source_type,v_updated.integration_order_id,v_platform_id,v_external_order_id,v_updated.status,v_updated.tracking_number,v_updated.carrier,v_updated.tracking_url;
end;
$function$;