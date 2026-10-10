-- Align seller commission fee, guarantee reserve, wallet ledger, split previews and automatic release.
-- This migration mirrors the definitions already applied to production Supabase on 2026-10-10.
-- Fee and guarantee are each 10% of the seller's gross commission, not the gross sale amount.

create or replace function private.calculate_sale_financials()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  p public.products%rowtype;
  s public.platform_settings%rowtype;
  a public.affiliations%rowtype;
  v_commission_rate numeric;
  v_desired numeric;
  v_qty integer;
begin
  select * into p from public.products where id = new.product_id for share;
  if not found then raise exception 'Product not found'; end if;
  if new.vendedor_id = p.created_by then raise exception 'Self-referral is not allowed'; end if;

  select * into s from public.platform_settings where id = true;
  v_qty := greatest(coalesce(new.quantity, 1), 1);

  new.product_amount := greatest(coalesce(new.product_amount, new.valor_venda - coalesce(new.shipping_amount, 0)), 0);

  -- Keep the gateway's recorded fee separate from NewVelion's seller-commission fee.
  new.taxa_gateway := round(new.valor_venda * 0.10, 2);

  if new.affiliation_id is not null then
    select * into a from public.affiliations where id = new.affiliation_id for share;
    if a.id is null then raise exception 'AFFILIATION_NOT_FOUND'; end if;
    if a.vendedor_id <> new.vendedor_id or a.product_id <> new.product_id then
      raise exception 'AFFILIATION_MISMATCH';
    end if;

    new.pricing_mode := a.pricing_mode;
    new.base_price_zar := coalesce(a.base_price_zar, 0);
    new.seller_margin_zar := greatest(round(new.valor_venda - new.base_price_zar, 2), 0);

    v_commission_rate := greatest(coalesce(p.supplier_commission_rate,
      case when p.comissao_tipo = 'percentual' then p.comissao_valor else 0 end), 0);
    if v_commission_rate > 100 then raise exception 'INVALID_SUPPLIER_COMMISSION_RATE'; end if;

    if p.comissao_tipo = 'fixo' and coalesce(p.supplier_commission_rate, 0) = 0
       and a.pricing_mode = 'fixed' then
      v_desired := greatest(coalesce(p.comissao_valor, 0) * v_qty, 0);
    else
      v_desired := round(new.product_amount * v_commission_rate / 100, 2);
    end if;
    new.commission_snapshot_zar := v_desired;
  elsif new.pricing_mode = 'custom' then
    v_commission_rate := greatest(coalesce(p.supplier_commission_rate,
      case when p.comissao_tipo = 'percentual' then p.comissao_valor else 0 end), 0);
    if v_commission_rate > 100 then raise exception 'INVALID_SUPPLIER_COMMISSION_RATE'; end if;
    v_desired := round(new.product_amount * v_commission_rate / 100, 2);
    new.commission_snapshot_zar := v_desired;
  else
    if p.comissao_tipo = 'percentual' then
      v_desired := round(new.product_amount * p.comissao_valor / 100, 2);
    else
      v_desired := round(p.comissao_valor * v_qty, 2);
    end if;
    new.commission_snapshot_zar := v_desired;
  end if;

  new.comissao_vendedor := greatest(v_desired, 0);

  -- Both NewVelion's checkout fee and the seven-day guarantee are 10% of seller commission.
  new.taxa_plataforma := round(new.comissao_vendedor * 0.10, 2);
  new.valor_garantia := round(new.comissao_vendedor * 0.10, 2);
  new.garantia_libera_em := coalesce(
    new.garantia_libera_em,
    new.vendido_em + make_interval(days => coalesce(s.hold_days, 7))
  );

  -- Preserve the existing product-margin calculation and add the seller-commission platform fee.
  new.ganho_plataforma := greatest(
    0,
    new.valor_venda - new.taxa_gateway - new.comissao_vendedor - coalesce(new.supplier_cost_zar, 0)
  ) + new.taxa_plataforma;

  return new;
end;
$function$


create or replace function private.post_sale_to_ledger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_product public.products%rowtype;
  v_supplier_id uuid;
  v_supplier_amount numeric;
  v_supplier_currency text;
  v_seller_net numeric;
begin
  -- Net commission = gross commission - 10% platform fee - 10% guarantee reserve.
  v_seller_net := greatest(new.comissao_vendedor - new.taxa_plataforma - new.valor_garantia, 0);

  insert into public.wallet_entries(vendedor_id, sale_id, tipo, valor, estado, currency)
  values
    (new.vendedor_id, new.id, 'comissao', v_seller_net, 'disponivel', 'ZAR'),
    (new.vendedor_id, new.id, 'garantia_retida', greatest(new.valor_garantia, 0), 'retido', 'ZAR');

  select p.* into v_product from public.products p where p.id = new.product_id;
  if found then
    select pr.id into v_supplier_id
    from public.profiles pr where pr.id = v_product.created_by and pr.role = 'supplier';

    v_supplier_currency := coalesce(
      new.supplier_cost_currency,
      v_product.supplier_cost_currency,
      case when new.supplier_country_code = 'CN' or v_product.supplier_country_code = 'CN' then 'CNY' else 'ZAR' end
    );
    v_supplier_amount := greatest(
      coalesce(new.supplier_cost_amount, v_product.supplier_cost_amount, v_product.preco_custo, 0), 0
    ) * greatest(coalesce(new.quantity, 1), 1);

    if v_supplier_id is not null and v_supplier_amount > 0 then
      insert into public.wallet_entries(vendedor_id, sale_id, tipo, valor, estado, currency)
      values (v_supplier_id, new.id, 'supplier_earning', v_supplier_amount, 'retido', v_supplier_currency)
      on conflict (sale_id, vendedor_id, tipo) where tipo = 'supplier_earning'
      do update set valor = excluded.valor, currency = excluded.currency;
    end if;
  end if;

  return new;
end;
$function$


create or replace function private.release_due_guarantees()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare released integer:=0; r record; h integer;
begin
 select hold_days into h from public.platform_settings where id=true;
 for r in select s.id,s.vendedor_id,s.valor_garantia from public.sales s where s.status='paga' and s.garantia_libera_em<=now() and not exists(select 1 from public.wallet_entries w where w.sale_id=s.id and w.tipo='garantia_liberada') loop
  if r.valor_garantia>0 then
   insert into public.wallet_entries(vendedor_id,sale_id,tipo,valor,estado) values(r.vendedor_id,r.id,'garantia_liberada',r.valor_garantia,'disponivel'),(r.vendedor_id,r.id,'garantia_retida',-r.valor_garantia,'retido');
  end if;
  update public.wallet_entries set estado='disponivel' where sale_id=r.id and tipo='supplier_earning' and estado='retido';
  released:=released+1;
 end loop;
 for r in
   select w.id,w.integration_order_id from public.wallet_entries w join public.fulfillment_orders fo on fo.integration_order_id=w.integration_order_id
   where w.tipo='supplier_earning' and w.estado='retido' and fo.status='delivered' and fo.fulfilled_at<=now()-make_interval(days=>coalesce(h,7))
 loop
   update public.wallet_entries set estado='disponivel' where id=r.id;
   released:=released+1;
 end loop;
 return released;
end;
$function$


create or replace function public.calculate_payjsr_split(p_sale_amount numeric, p_supplier_cost numeric, p_pricing_model text)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
declare
  v_minimum numeric;
  v_seller_gross numeric;
  v_seller_fee numeric;
  v_retention numeric;
  v_seller_available numeric;
begin
  if p_sale_amount is null or p_sale_amount <= 0 then raise exception 'Sale amount must be greater than zero'; end if;
  if p_supplier_cost is null or p_supplier_cost <= 0 then raise exception 'Supplier cost must be configured before this product can be sold'; end if;
  if p_pricing_model not in ('fixed', 'flexible') then raise exception 'Invalid product pricing model'; end if;

  v_minimum := round((p_supplier_cost * 1.10)::numeric, 2);
  if p_sale_amount < v_minimum then
    raise exception 'Seller price %. Minimum allowed price is %.', p_sale_amount, v_minimum;
  end if;

  v_seller_gross := round((p_sale_amount - p_supplier_cost)::numeric, 2);
  v_seller_fee := round((v_seller_gross * 0.10)::numeric, 2);
  v_retention := round((v_seller_gross * 0.10)::numeric, 2);
  v_seller_available := round((v_seller_gross - v_seller_fee - v_retention)::numeric, 2);

  return jsonb_build_object(
    'sale_amount', round(p_sale_amount, 2),
    'supplier_cost', round(p_supplier_cost, 2),
    'minimum_price', v_minimum,
    'seller_fee', v_seller_fee,
    'supplier_gross', p_supplier_cost,
    'supplier_fee', 0,
    'supplier_net', p_supplier_cost,
    'seller_gross_profit', v_seller_gross,
    'retention', v_retention,
    'retention_days', 7,
    'seller_available', v_seller_available,
    'platform_revenue', v_seller_fee,
    'retention_percentage_of_seller', 10,
    'seller_fee_percentage', 10,
    'supplier_fee_percentage', 0
  );
end;
$function$


create or replace function public.calculate_payjsr_split(p_sale_amount numeric, p_supplier_cost numeric, p_pricing_model text, p_commission_percentage numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
declare
  v_commission_rate numeric;
  v_seller_gross numeric;
  v_supplier_gross numeric;
  v_seller_fee numeric;
  v_retention numeric;
  v_seller_available numeric;
begin
  if p_sale_amount is null or p_sale_amount <= 0 then raise exception 'Sale amount must be greater than zero'; end if;
  if p_supplier_cost is null or p_supplier_cost <= 0 then raise exception 'Supplier product price must be configured before this product can be sold'; end if;
  if p_pricing_model not in ('fixed', 'flexible') then raise exception 'Invalid product pricing model'; end if;

  v_commission_rate := coalesce(p_commission_percentage, 0);
  if v_commission_rate < 0 or v_commission_rate > 100 then raise exception 'Commission percentage must be between 0 and 100'; end if;

  v_seller_gross := round((p_sale_amount * v_commission_rate / 100)::numeric, 2);
  v_supplier_gross := round((p_sale_amount - v_seller_gross)::numeric, 2);
  v_seller_fee := round((v_seller_gross * 0.10)::numeric, 2);
  v_retention := round((v_seller_gross * 0.10)::numeric, 2);
  v_seller_available := round((v_seller_gross - v_seller_fee - v_retention)::numeric, 2);

  return jsonb_build_object(
    'sale_amount', round(p_sale_amount, 2),
    'supplier_cost', round(p_supplier_cost, 2),
    'minimum_price', round(p_sale_amount, 2),
    'commission_percentage', v_commission_rate,
    'affiliate_commission', v_seller_gross,
    'seller_gross_profit', v_seller_gross,
    'seller_fee', v_seller_fee,
    'seller_available', v_seller_available,
    'retention', v_retention,
    'retention_days', 7,
    'supplier_gross', v_supplier_gross,
    'supplier_fee', 0,
    'supplier_net', v_supplier_gross,
    'platform_revenue', v_seller_fee,
    'seller_percentage', v_commission_rate,
    'supplier_percentage', round((100 - v_commission_rate)::numeric, 2),
    'retention_percentage_of_seller', 10,
    'seller_fee_percentage', 10,
    'supplier_fee_percentage', 0
  );
end;
$function$


-- Release due guarantees every five minutes. Reusing the job name updates the existing schedule.
do $schedule$
begin
  perform cron.schedule(
    'release-due-sale-guarantees',
    '*/5 * * * *',
    'select private.release_due_guarantees();'
  );
end;
$schedule$;
