-- Platform affiliates share the platform's existing payout queue and configured fees.
insert into public.payout_methods
  (pais, metodos, taxa_percentual, taxa_fixa, valor_minimo_saque, prazo_min_dias, prazo_max_dias)
values
  ('MZ',
   '{"bank_transfer":{"label":"Bank transfer","fields":["bank","account_number","holder_name"]},"mobile_wallet":{"label":"Mobile wallet","fields":["provider","phone","holder_name"]}}'::jsonb,
   5, 10, 100, 2, 7)
on conflict (pais) do update set metodos = excluded.metodos;

create or replace function private.validate_withdrawal_payload(
  p_user_id uuid, p_amount numeric, p_method text, p_data jsonb
)
returns table(pais text, valor_minimo_saque numeric, prazo_min_dias integer, prazo_max_dias integer, taxa_percentual numeric, taxa_fixa numeric, valor_liquido numeric)
language plpgsql security definer set search_path to 'public','private'
as $function$
declare
  prof public.profiles%rowtype; sp public.supplier_profiles%rowtype; cfg public.payout_methods%rowtype;
  available numeric := 0; holder text; verified_holder text; settings jsonb; selected jsonb; ps record;
  role_name text; reserved numeric := 0; withdrawn numeric := 0; rows_available numeric := 0;
  country_code text; fx numeric := 1; amount_zar numeric;
begin
  select * into prof from public.profiles where id=p_user_id;
  if prof.id is null then raise exception 'Profile not found'; end if;
  role_name := coalesce(prof.role,'');
  country_code := case upper(coalesce(nullif(prof.pais,''),nullif(prof.country_code,''),nullif(prof.country,''),'')) when 'SOUTH AFRICA' then 'ZA' when 'MOZAMBIQUE' then 'MZ' when 'ANGOLA' then 'AO' else upper(coalesce(nullif(prof.pais,''),nullif(prof.country_code,''),nullif(prof.country,''),'')) end;

  if role_name='supplier' then
    select * into sp from public.supplier_profiles where user_id=p_user_id;
    if sp.user_id is null then raise exception 'Supplier profile not found'; end if;
    if lower(coalesce(sp.kyc_status,''))<>'approved' then raise exception 'KYC approval is required'; end if;
    country_code := upper(coalesce(sp.country_code,''));
    if country_code not in ('ZA','CN') then raise exception 'Unsupported supplier payout country'; end if;
    select pm.* into cfg from public.payout_methods pm where pm.pais=country_code;
  else
    if lower(coalesce(prof.kyc_status,''))<>'approved' then raise exception 'KYC approval is required'; end if;
    if role_name not in ('seller','platform_affiliate') then raise exception 'This account type cannot request withdrawals'; end if;
    if country_code not in ('ZA','AO','MZ') then raise exception 'Unsupported payout country'; end if;
    select pm.* into cfg from public.payout_methods pm where pm.pais=country_code;
  end if;

  if cfg.pais is null then raise exception 'Payout configuration not found for your country'; end if;
  if not (cfg.metodos ? p_method) then raise exception 'Payout method is not allowed for this country'; end if;
  select coalesce(a.payout_methods,'{}'::jsonb) into settings from public.account_settings a where a.user_id=p_user_id;
  selected := coalesce(settings->p_method,'{}'::jsonb);
  if p_method='mobile_wallet' then
    if lower(coalesce(p_data->>'provider',''))='m-pesa' then selected:=coalesce(settings->'mpesa','{}'::jsonb);
    elsif lower(coalesce(p_data->>'provider',''))='e-mola' then selected:=coalesce(settings->'emola','{}'::jsonb);
    end if;
  end if;
  if coalesce((selected->>'enabled')::boolean,false) is not true then raise exception 'Selected payout method is not configured in Settings'; end if;

  fx := coalesce(nullif(trim(coalesce(p_data->>'exchange_rate','')),'')::numeric,1);
  if cfg.pais<>'ZA' and (fx is null or fx<=0) then raise exception 'A live exchange rate is required for this withdrawal'; end if;
  if role_name='platform_affiliate' then amount_zar := p_amount; else amount_zar := round(p_amount/fx,2); end if;

  if role_name='supplier' then
    select coalesce(sum(we.valor),0) into rows_available from public.wallet_entries we
      where we.vendedor_id=p_user_id and we.estado='disponivel' and we.tipo in ('supplier_earning','estorno','garantia_liberada');
    select coalesce(sum(abs(we.valor)),0) into reserved from public.wallet_entries we join public.withdrawals w on w.id=we.withdrawal_id
      where we.vendedor_id=p_user_id and we.tipo='saque' and w.status in ('solicitado','em_processamento');
    select coalesce(sum(abs(we.valor)),0) into withdrawn from public.wallet_entries we join public.withdrawals w on w.id=we.withdrawal_id
      where we.vendedor_id=p_user_id and we.tipo='saque' and w.status='pago';
    available := greatest(rows_available-reserved-withdrawn,0);
  elsif role_name='platform_affiliate' then
    select coalesce(sum(r.amount),0) into rows_available from public.platform_affiliate_rewards r
      where r.affiliate_user_id=p_user_id and r.reward_type='referral_bonus' and r.status in ('earned','paid');
    select coalesce(sum(w.valor_solicitado),0) into reserved from public.withdrawals w
      where w.vendedor_id=p_user_id and w.status in ('solicitado','em_processamento');
    select coalesce(sum(w.valor_solicitado),0) into withdrawn from public.withdrawals w
      where w.vendedor_id=p_user_id and w.status='pago';
    available := greatest(rows_available-reserved-withdrawn,0);
  else
    select f.available_balance into available from private.seller_financials(p_user_id,null) f;
  end if;

  if coalesce(available,0)<amount_zar then raise exception 'Insufficient available balance'; end if;
  if p_amount<cfg.valor_minimo_saque then raise exception 'Amount is below the minimum withdrawal'; end if;
  holder := coalesce(selected->>'holder_name',selected->>'titular','');
  verified_holder := case when role_name='supplier' then coalesce(sp.responsible_name,sp.legal_name,sp.company_name,'') else coalesce(prof.nome_completo,prof.full_name,'') end;
  if lower(trim(holder))<>lower(trim(verified_holder)) then raise exception 'Payout holder must match the KYC-approved profile name'; end if;

  if role_name='supplier' and country_code='ZA' and p_method<>'bank_transfer' then raise exception 'South African suppliers support bank transfer / EFT only for payouts'; end if;
  if role_name='supplier' and country_code='CN' then
    if p_method='bank_transfer' and (nullif(trim(coalesce(selected->>'bank','')),'') is null or nullif(trim(coalesce(selected->>'account_number','')),'') is null or nullif(trim(coalesce(selected->>'branch_name','')),'') is null) then raise exception 'Chinese bank transfer requires bank, account number and branch'; end if;
    if p_method in ('alipay','wechat_pay') and nullif(trim(coalesce(selected->>'account_id','')),'') is null then raise exception 'Payment account ID is required'; end if;
    if p_method='unionpay' and nullif(trim(coalesce(selected->>'card_number','')),'') is null then raise exception 'UnionPay card number is required'; end if;
    if p_method='ecny' and nullif(trim(coalesce(selected->>'wallet_id','')),'') is null then raise exception 'e-CNY wallet ID is required'; end if;
  end if;

  select * into ps from public.platform_settings limit 1;
  return query select cfg.pais,cfg.valor_minimo_saque,cfg.prazo_min_dias,cfg.prazo_max_dias,
    coalesce(ps.withdrawal_fee_percent,cfg.taxa_percentual),coalesce(ps.withdrawal_fee_fixed,cfg.taxa_fixa),
    greatest(round(p_amount-(p_amount*coalesce(ps.withdrawal_fee_percent,cfg.taxa_percentual)/100)-coalesce(ps.withdrawal_fee_fixed,cfg.taxa_fixa),2),0);
end;
$function$;

create or replace function public.server_request_withdrawal(p_user_id uuid,p_amount numeric,p_method text,p_data jsonb)
returns public.withdrawals language plpgsql security definer set search_path to ''
as $function$
declare v public.withdrawals; cfg record; lock_key bigint; v_exchange_rate numeric:=1; v_payout_currency text; v_liquido_zar numeric; v_converted_amount numeric; settings jsonb; selected jsonb; v_role text; v_kyc_status text;
begin
  if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'Unauthorized withdrawal request'; end if;
  select coalesce(p.role,'') into v_role from public.profiles p where p.id=p_user_id;
  if v_role='supplier' then select lower(coalesce(sp.kyc_status,'')) into v_kyc_status from public.supplier_profiles sp where sp.user_id=p_user_id;
  else select lower(coalesce(p.kyc_status,'')) into v_kyc_status from public.profiles p where p.id=p_user_id; end if;
  if v_kyc_status<>'approved' then raise exception 'KYC verification is required before you can withdraw'; end if;
  if p_amount is null or p_amount<=0 then raise exception 'Withdrawal amount must be greater than zero'; end if;
  lock_key:=hashtextextended(p_user_id::text,0); perform pg_advisory_xact_lock(lock_key);
  select nullif(trim(coalesce(p_data->>'exchange_rate','')),'')::numeric into v_exchange_rate;
  if v_exchange_rate is null or v_exchange_rate<=0 then raise exception 'A live exchange rate is required for this withdrawal'; end if;
  select * into cfg from private.validate_withdrawal_payload(p_user_id,p_amount,p_method,p_data);
  select coalesce(a.payout_methods,'{}'::jsonb) into settings from public.account_settings a where a.user_id=p_user_id;
  if p_method='bank_transfer' then selected:=settings->'bank_transfer';
  elsif p_method='mobile_wallet' and lower(p_data->>'provider')='m-pesa' then selected:=settings->'mpesa';
  elsif p_method='mobile_wallet' and lower(p_data->>'provider')='e-mola' then selected:=settings->'emola';
  else raise exception 'Unsupported payout method'; end if;
  if cfg.pais='ZA' then v_payout_currency:='ZAR'; v_exchange_rate:=1;
  elsif cfg.pais='AO' then v_payout_currency:='AOA';
  elsif cfg.pais='MZ' then v_payout_currency:='MZN';
  else raise exception 'Unsupported payout country'; end if;
  v_liquido_zar:=greatest(round(p_amount-(p_amount*cfg.taxa_percentual/100)-cfg.taxa_fixa,2),0);
  v_converted_amount:=round(v_liquido_zar*v_exchange_rate,2);
  insert into public.withdrawals(vendedor_id,valor_solicitado,taxa_percentual,taxa_fixa,valor_liquido,metodo,dados_pagamento,status,prazo_estimado_dias,wallet_currency,payout_currency,exchange_rate,valor_convertido)
  values(p_user_id,p_amount,cfg.taxa_percentual,cfg.taxa_fixa,v_liquido_zar,p_method,selected,'solicitado',cfg.prazo_max,'ZAR',v_payout_currency,v_exchange_rate,v_converted_amount) returning * into v;
  insert into public.wallet_entries(vendedor_id,withdrawal_id,tipo,valor,estado) values(p_user_id,v.id,'saque',-p_amount,'pendente');
  insert into public.withdrawal_audit_log(withdrawal_id,actor_id,from_status,to_status,note) values(v.id,p_user_id,null,'solicitado','Withdrawal requested in ZAR wallet; converted to local payout currency');
  return v;
end;
$function$;
revoke all on function public.server_request_withdrawal(uuid,numeric,text,jsonb) from public,anon,authenticated;
grant execute on function public.server_request_withdrawal(uuid,numeric,text,jsonb) to authenticated;

create or replace function public.get_platform_affiliate_withdrawal_summary()
returns jsonb language plpgsql stable security definer set search_path to ''
as $function$
declare v_user uuid:=auth.uid(); prof public.profiles%rowtype; cfg public.payout_methods%rowtype; ps public.platform_settings%rowtype; earned numeric:=0; reserved numeric:=0; paid numeric:=0; code text;
begin
  if v_user is null or not exists(select 1 from public.platform_affiliates pa where pa.user_id=v_user) then raise exception 'PLATFORM_AFFILIATE_ACCESS_REQUIRED'; end if;
  select * into prof from public.profiles p where p.id=v_user;
  code:=case upper(coalesce(nullif(prof.pais,''),nullif(prof.country_code,''),nullif(prof.country,''),'')) when 'SOUTH AFRICA' then 'ZA' when 'MOZAMBIQUE' then 'MZ' when 'ANGOLA' then 'AO' else upper(coalesce(nullif(prof.pais,''),nullif(prof.country_code,''),nullif(prof.country,''),'')) end;
  select * into cfg from public.payout_methods pm where pm.pais=code;
  select * into ps from public.platform_settings limit 1;
  select coalesce(sum(r.amount),0) into earned from public.platform_affiliate_rewards r where r.affiliate_user_id=v_user and r.reward_type='referral_bonus' and r.status in ('earned','paid');
  select coalesce(sum(w.valor_solicitado),0) into reserved from public.withdrawals w where w.vendedor_id=v_user and w.status in ('solicitado','em_processamento');
  select coalesce(sum(w.valor_solicitado),0) into paid from public.withdrawals w where w.vendedor_id=v_user and w.status='pago';
  return jsonb_build_object(
    'country_code',code,'kyc_status',prof.kyc_status,
    'available_balance',greatest(earned-reserved-paid,0),'total_rewards',earned,
    'reserved_balance',reserved,'withdrawn_balance',paid,
    'fee_percent',coalesce(ps.withdrawal_fee_percent,cfg.taxa_percentual,0),
    'fee_fixed',coalesce(ps.withdrawal_fee_fixed,cfg.taxa_fixa,0),
    'minimum_withdrawal',coalesce(cfg.valor_minimo_saque,100),
    'min_days',cfg.prazo_min_dias,'max_days',cfg.prazo_max_dias,
    'allowed_methods',coalesce(cfg.metodos,'{}'::jsonb)
  );
end;
$function$;
revoke all on function public.get_platform_affiliate_withdrawal_summary() from public,anon;
grant execute on function public.get_platform_affiliate_withdrawal_summary() to authenticated;
