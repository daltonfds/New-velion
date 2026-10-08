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
  v_commission_rate numeric;
  v_seller_gross numeric;
  v_supplier_gross numeric;
  v_supplier_fee numeric;
  v_seller_fee numeric;
  v_retention numeric;
  v_seller_available numeric;
  v_platform_revenue numeric;
begin
  if p_sale_amount is null or p_sale_amount <= 0 then raise exception 'Sale amount must be greater than zero'; end if;
  if p_supplier_cost is null or p_supplier_cost <= 0 then raise exception 'Supplier product price must be configured before this product can be sold'; end if;
  if p_pricing_model not in ('fixed','flexible') then raise exception 'Invalid product pricing model'; end if;
  v_commission_rate := coalesce(p_commission_percentage, 0);
  if v_commission_rate < 0 or v_commission_rate > 100 then raise exception 'Commission percentage must be between 0 and 100'; end if;

  v_seller_gross := round((p_sale_amount * v_commission_rate / 100)::numeric, 2);
  v_supplier_gross := round((p_sale_amount - v_seller_gross)::numeric, 2);
  v_supplier_fee := round((v_supplier_gross * 0.10)::numeric, 2);
  v_seller_fee := round((v_seller_gross * 0.10)::numeric, 2);
  v_retention := round((v_seller_gross * 0.10)::numeric, 2);
  v_seller_available := round((v_seller_gross - v_seller_fee - v_retention)::numeric, 2);
  v_platform_revenue := round((v_supplier_fee + v_seller_fee)::numeric, 2);

  if v_supplier_gross - v_supplier_fee + v_seller_available + v_retention <> round(p_sale_amount,2) then raise exception 'Financial split does not reconcile to sale amount'; end if;

  return jsonb_build_object(
    'sale_amount', round(p_sale_amount,2),
    'supplier_cost', round(p_supplier_cost,2),
    'minimum_price', round(p_sale_amount,2),
    'commission_percentage', v_commission_rate,
    'affiliate_commission', v_seller_gross,
    'seller_gross_profit', v_seller_gross,
    'seller_fee', v_seller_fee,
    'seller_available', v_seller_available,
    'retention', v_retention,
    'retention_days', 7,
    'supplier_gross', v_supplier_gross,
    'supplier_fee', v_supplier_fee,
    'supplier_net', round((v_supplier_gross - v_supplier_fee)::numeric, 2),
    'platform_revenue', v_platform_revenue,
    'seller_percentage', v_commission_rate,
    'supplier_percentage', round((100 - v_commission_rate)::numeric, 2),
    'retention_percentage_of_seller', 10,
    'seller_fee_percentage', 10,
    'supplier_fee_percentage', 10
  );
end;
$function$;