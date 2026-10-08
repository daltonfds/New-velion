update public.platform_settings
set withdrawal_fee_percent = 5,
    withdrawal_fee_fixed = 10,
    updated_at = now();

create or replace function public.calculate_payjsr_split(
  p_sale_amount numeric,
  p_supplier_cost numeric,
  p_pricing_model text,
  p_commission_percentage numeric
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $function$
declare
  v_minimum numeric;
  v_seller_gross numeric;
  v_seller_available numeric;
  v_retention numeric;
  v_supplier_net numeric;
  v_platform_revenue numeric;
begin
  if p_sale_amount is null or p_sale_amount <= 0 then
    raise exception 'Sale amount must be greater than zero';
  end if;
  if p_supplier_cost is null or p_supplier_cost <= 0 then
    raise exception 'Supplier cost must be configured before this product can be sold';
  end if;
  if p_pricing_model not in ('fixed','flexible') then
    raise exception 'Invalid product pricing model';
  end if;
  v_minimum := round((p_supplier_cost / 0.70)::numeric, 2);
  if p_sale_amount < v_minimum then
    raise exception 'Seller price %. Minimum allowed price is %.', p_sale_amount, v_minimum;
  end if;
  v_supplier_net := round((p_sale_amount * 0.70)::numeric, 2);
  v_seller_gross := round((p_sale_amount * 0.10)::numeric, 2);
  v_retention := round((p_sale_amount * 0.10)::numeric, 2);
  v_seller_available := v_seller_gross;
  v_platform_revenue := round((p_sale_amount * 0.10)::numeric, 2);
  if v_supplier_net + v_seller_gross + v_retention + v_platform_revenue <> round(p_sale_amount,2) then
    raise exception 'Financial split does not reconcile to sale amount';
  end if;
  return jsonb_build_object(
    'sale_amount', round(p_sale_amount,2),
    'supplier_cost', round(p_supplier_cost,2),
    'minimum_price', v_minimum,
    'commission_percentage', 10,
    'affiliate_commission', v_seller_gross,
    'seller_fee', v_seller_gross,
    'supplier_gross', v_supplier_net,
    'supplier_fee', 0,
    'supplier_net', v_supplier_net,
    'seller_gross_profit', v_seller_gross,
    'retention', v_retention,
    'retention_days', 7,
    'seller_available', v_seller_available,
    'platform_revenue', v_platform_revenue,
    'seller_percentage', 10,
    'supplier_percentage', 70,
    'retention_percentage', 10,
    'platform_percentage', 10
  );
end;
$function$;