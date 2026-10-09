-- Fix payout configuration field name used by the withdrawal RPC.
-- payout_methods exposes prazo_max_dias, not prazo_max.
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
  values(p_user_id,p_amount,cfg.taxa_percentual,cfg.taxa_fixa,v_liquido_zar,p_method,selected,'solicitado',cfg.prazo_max_dias,'ZAR',v_payout_currency,v_exchange_rate,v_converted_amount) returning * into v;
  insert into public.wallet_entries(vendedor_id,withdrawal_id,tipo,valor,estado) values(p_user_id,v.id,'saque',-p_amount,'pendente');
  insert into public.withdrawal_audit_log(withdrawal_id,actor_id,from_status,to_status,note) values(v.id,p_user_id,null,'solicitado','Withdrawal requested in ZAR wallet; converted to local payout currency');
  return v;
end;
$function$;
