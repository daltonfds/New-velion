-- Unify the primary integration order path with fulfillment reservation semantics.
-- Stock remains on-hand in products. Fulfillment reserves it exactly once.
CREATE OR REPLACE FUNCTION public.create_integration_order(p_platform_id uuid, p_external_order_id text, p_external_seller_id uuid, p_currency text, p_items jsonb, p_customer jsonb, p_shipping_address jsonb, p_shipping_amount numeric DEFAULT 0, p_metadata jsonb DEFAULT '{}'::jsonb, p_idempotency_key text DEFAULT NULL::text)
 RETURNS TABLE(order_id uuid, order_status text, order_total numeric, order_currency text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_order public.integration_orders%rowtype;
  v_item jsonb;
  v_mapping public.integration_product_mappings%rowtype;
  v_product public.products%rowtype;
  v_quantity integer;
  v_sale_price numeric;
  v_base_price numeric;
  v_item_margin numeric;
  v_subtotal numeric:=0;
  v_shipping numeric:=greatest(coalesce(p_shipping_amount,0),0);
  v_total numeric;
  v_mode text;
  v_cost_zar numeric;
  v_supplier_cost numeric:=0;
  v_seller_margin numeric:=0;
  v_base_total numeric:=0;
begin
  if not exists(select 1 from public.integration_platforms where id=p_platform_id and status='active') then raise exception 'INVALID_PLATFORM'; end if;
  if nullif(trim(p_external_order_id),'') is null then raise exception 'INVALID_ORDER'; end if;
  if p_currency<>'ZAR' then raise exception 'CUSTOMER_CURRENCY_MUST_BE_ZAR'; end if;
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'INVALID_ORDER'; end if;

  select * into v_order from public.integration_orders
  where platform_id=p_platform_id and (
    external_order_id=trim(p_external_order_id)
    or (p_idempotency_key is not null and idempotency_key=p_idempotency_key)
  ) limit 1;
  if v_order.id is not null then return query select v_order.id,v_order.status,v_order.total,v_order.currency; return; end if;

  if not exists(select 1 from public.integration_external_sellers where id=p_external_seller_id and platform_id=p_platform_id and status='active')
    then raise exception 'INVALID_SELLER'; end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_quantity:=coalesce((v_item->>'quantity')::integer,0);
    v_sale_price:=coalesce((v_item->>'sale_price')::numeric,-1);
    if v_quantity<=0 or v_sale_price<=0 then raise exception 'INVALID_ORDER'; end if;

    select m.* into v_mapping
    from public.integration_product_mappings m
    where m.platform_id=p_platform_id
      and m.external_product_id=trim(coalesce(v_item->>'external_product_id',''))
      and m.status='active'
      and (m.external_seller_id is null or m.external_seller_id=p_external_seller_id)
    order by (m.external_seller_id is not null) desc limit 1;
    if v_mapping.id is null then raise exception 'PRODUCT_NOT_MAPPED'; end if;

    select * into v_product from public.products p
    where p.id=v_mapping.newvelion_product_id and p.ativo=true and p.supplier_status='approved' and p.moeda='ZAR'
    for update;
    if v_product.id is null then raise exception 'PRODUCT_NOT_FOUND'; end if;
    if (coalesce(v_product.estoque,0)-coalesce(v_product.reserved_estoque,0))<v_quantity then raise exception 'PRODUCT_OUT_OF_STOCK'; end if;

    v_mode:=case when v_mapping.pricing_mode='inherit' then v_product.pricing_mode else v_mapping.pricing_mode end;
    select base_price_zar into v_base_price from private.product_pricing_snapshot(v_product.id);

    if v_mode='fixed' then
      if v_mapping.sale_price is not null then
        if abs(v_sale_price-v_mapping.sale_price)>0.01 then raise exception 'FIXED_PRICE_MISMATCH'; end if;
      else
        select fixed_sale_price_zar into v_base_price from private.product_pricing_snapshot(v_product.id);
        if abs(v_sale_price-v_base_price)>0.01 then raise exception 'FIXED_PRICE_MISMATCH'; end if;
        select base_price_zar into v_base_price from private.product_pricing_snapshot(v_product.id);
      end if;
      v_item_margin:=greatest(v_sale_price-v_base_price,0);
    elsif v_mode='custom' then
      if v_sale_price<v_base_price then raise exception 'SALE_PRICE_BELOW_BASE_PRICE'; end if;
      v_item_margin:=round(v_sale_price-v_base_price,2);
    else
      raise exception 'INVALID_PRICING_MODE';
    end if;

    v_subtotal:=v_subtotal+(v_sale_price*v_quantity);
    v_base_total:=v_base_total+(v_base_price*v_quantity);
    v_seller_margin:=v_seller_margin+(v_item_margin*v_quantity);

    v_cost_zar:=case
      when v_product.supplier_cost_currency='CNY' and coalesce(v_product.supplier_fx_rate_to_zar,0)>0
        then coalesce(v_product.supplier_cost_amount,0)*v_product.supplier_fx_rate_to_zar
      when v_product.supplier_cost_currency='ZAR' then coalesce(v_product.supplier_cost_amount,0)
      else coalesce(v_product.preco_custo,0)
    end;
    v_supplier_cost:=v_supplier_cost+(v_cost_zar*v_quantity);


  end loop;

  v_total:=v_subtotal+v_shipping;

  insert into public.integration_orders(
    platform_id,external_order_id,external_seller_id,status,currency,subtotal,shipping_amount,total,customer,shipping_address,metadata,idempotency_key,
    newvelion_base_total,newvelion_cost_total,external_seller_margin,newvelion_gross_margin,supplier_cost_total,
    supplier_cost_currency,supplier_fx_rate_to_zar,supplier_fx_rate_captured_at,customer_country_code
  )
  values(
    p_platform_id,trim(p_external_order_id),p_external_seller_id,'confirmed','ZAR',v_subtotal,v_shipping,v_total,
    coalesce(p_customer,'{}'::jsonb),coalesce(p_shipping_address,'{}'::jsonb),coalesce(p_metadata,'{}'::jsonb),p_idempotency_key,
    v_base_total,v_supplier_cost,v_seller_margin,greatest(v_subtotal-v_supplier_cost-v_seller_margin,0),v_supplier_cost,'ZAR',1,'now','ZA'
  )
  returning * into v_order;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_quantity:=(v_item->>'quantity')::integer;
    v_sale_price:=(v_item->>'sale_price')::numeric;
    select m.* into v_mapping from public.integration_product_mappings m
    where m.platform_id=p_platform_id and m.external_product_id=trim(coalesce(v_item->>'external_product_id',''))
      and m.status='active' and (m.external_seller_id is null or m.external_seller_id=p_external_seller_id)
    order by (m.external_seller_id is not null) desc limit 1;
    select * into v_product from public.products p where p.id=v_mapping.newvelion_product_id;
    select base_price_zar into v_base_price from private.product_pricing_snapshot(v_product.id);
    v_mode:=case when v_mapping.pricing_mode='inherit' then v_product.pricing_mode else v_mapping.pricing_mode end;

    insert into public.integration_order_items(
      order_id,mapping_id,external_product_id,newvelion_product_id,quantity,sale_price,currency,newvelion_base_price,
      newvelion_cost_price,product_name,metadata,pricing_mode,base_price_zar,seller_margin_zar
    )
    values(
      v_order.id,v_mapping.id,trim(v_item->>'external_product_id'),v_product.id,v_quantity,v_sale_price,'ZAR',v_base_price,
      v_product.preco_custo,v_product.nome,coalesce(v_item->'metadata','{}'::jsonb),v_mode,v_base_price,
      greatest(round(v_sale_price-v_base_price,2),0)
    );
  end loop;

  perform public.create_integration_fulfillment(v_order.id);

  return query select v_order.id,v_order.status,v_order.total,v_order.currency;
end;
$function$;


revoke execute on function public.create_integration_order(uuid, text, uuid, text, jsonb, jsonb, jsonb, numeric, jsonb, text)
  from public, anon, authenticated;
grant execute on function public.create_integration_order(uuid, text, uuid, text, jsonb, jsonb, jsonb, numeric, jsonb, text)
  to service_role;
