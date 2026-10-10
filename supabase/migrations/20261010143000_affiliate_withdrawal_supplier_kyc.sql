-- Read the correct KYC state for suppliers who also use the affiliate programme.
CREATE OR REPLACE FUNCTION public.get_platform_affiliate_withdrawal_summary()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid := auth.uid();
  prof public.profiles%rowtype;
  cfg public.payout_methods%rowtype;
  ps public.platform_settings%rowtype;
  earned numeric := 0;
  reserved numeric := 0;
  paid numeric := 0;
  country_code text;
begin
  if v_user is null or not exists(select 1 from public.platform_affiliates pa where pa.user_id=v_user) then
    raise exception 'PLATFORM_AFFILIATE_ACCESS_REQUIRED';
  end if;
  select * into prof from public.profiles p where p.id=v_user;
  country_code := case upper(coalesce(nullif(prof.pais,''),nullif(prof.country_code,''),nullif(prof.country,''),'')) when 'SOUTH AFRICA' then 'ZA' when 'MOZAMBIQUE' then 'MZ' when 'ANGOLA' then 'AO' else upper(coalesce(nullif(prof.pais,''),nullif(prof.country_code,''),nullif(prof.country,''),'')) end;
  select * into cfg from public.payout_methods pm where pm.pais=country_code;
  select * into ps from public.platform_settings limit 1;
  select coalesce(sum(r.amount),0) into earned from public.platform_affiliate_rewards r
    where r.affiliate_user_id=v_user and r.reward_type='referral_bonus' and r.status in ('earned','paid');
  select coalesce(sum(w.valor_solicitado),0) into reserved from public.withdrawals w
    where w.vendedor_id=v_user and coalesce(w.withdrawal_source,'sales')='affiliate' and w.status in ('solicitado','em_processamento');
  select coalesce(sum(w.valor_solicitado),0) into paid from public.withdrawals w
    where w.vendedor_id=v_user and coalesce(w.withdrawal_source,'sales')='affiliate' and w.status='pago';
  return jsonb_build_object(
    'country_code',country_code,'kyc_status',case when prof.role='supplier' then coalesce((select lower(sp.kyc_status) from public.supplier_profiles sp where sp.user_id=v_user),prof.kyc_status) else prof.kyc_status end,
    'available_balance',greatest(earned-reserved-paid,0),'total_rewards',earned,
    'reserved_balance',reserved,'withdrawn_balance',paid,
    'fee_percent',coalesce(ps.withdrawal_fee_percent,cfg.taxa_percentual,0),
    'fee_fixed',coalesce(ps.withdrawal_fee_fixed,cfg.taxa_fixa,0),
    'minimum_withdrawal',coalesce(cfg.valor_minimo_saque,100),
    'min_days',cfg.prazo_min_dias,'max_days',cfg.prazo_max_dias,
    'allowed_methods',coalesce(cfg.metodos,'{}'::jsonb)
  );
end;
$function$
;
revoke all on function public.get_platform_affiliate_withdrawal_summary() from public,anon;
grant execute on function public.get_platform_affiliate_withdrawal_summary() to authenticated;
