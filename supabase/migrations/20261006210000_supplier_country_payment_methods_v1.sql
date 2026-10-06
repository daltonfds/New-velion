-- Supplier country policy and payout rails: suppliers are ZA or CN only.
alter table public.payout_methods drop constraint if exists payout_methods_pais_check;
alter table public.payout_methods add constraint payout_methods_pais_check check (pais in ('ZA','MZ','CN'));

alter table public.supplier_profiles drop constraint if exists supplier_profiles_country_code_check;
alter table public.supplier_profiles add constraint supplier_profiles_country_code_check check (country_code is null or upper(country_code) in ('ZA','CN'));

insert into public.payout_methods (pais,metodos,taxa_percentual,taxa_fixa,valor_minimo_saque,prazo_min_dias,prazo_max_dias)
values (
  'CN',
  '{"bank_transfer":{"label":"Bank transfer","fields":["bank","account_number","branch_name","holder_name"]},"alipay":{"label":"Alipay","fields":["account_id","holder_name"],"settlement":"manual"},"wechat_pay":{"label":"WeChat Pay","fields":["account_id","holder_name"],"settlement":"manual"},"unionpay":{"label":"UnionPay","fields":["card_number","bank","holder_name"],"settlement":"manual"},"ecny":{"label":"e-CNY","fields":["wallet_id","holder_name"],"settlement":"manual"}}'::jsonb,
  0,0,100,1,5
)
on conflict (pais) do update set metodos=excluded.metodos;

update public.payout_methods
set metodos='{"bank_transfer":{"label":"Bank transfer / EFT","fields":["bank","account_type","account_number","branch_code","holder_name"]}}'::jsonb
where pais='ZA';

drop function if exists private.validate_withdrawal_payload(uuid,numeric,text,jsonb);

create function private.validate_withdrawal_payload(p_user_id uuid,p_amount numeric,p_method text,p_data jsonb)
returns table(pais text,valor_minimo_saque numeric,prazo_min_dias integer,prazo_max_dias integer,taxa_percentual numeric,taxa_fixa numeric,valor_liquido numeric)
language plpgsql security definer set search_path=public,private as $$
declare
 prof public.profiles%rowtype; sp public.supplier_profiles%rowtype; cfg public.payout_methods%rowtype;
 available numeric; holder text; verified_holder text; settings jsonb; selected jsonb; ps record; role_name text;
 reserved numeric:=0; withdrawn numeric:=0; rows_available numeric:=0; supplier_country text;
begin
 select * into prof from public.profiles where id=p_user_id;
 if prof.id is null then raise exception 'Profile not found'; end if;
 role_name:=coalesce(prof.role,'');
 if role_name='supplier' then
   select * into sp from public.supplier_profiles where user_id=p_user_id;
   if sp.user_id is null then raise exception 'Supplier profile not found'; end if;
   if lower(coalesce(sp.kyc_status,''))<>'approved' then raise exception 'KYC approval is required'; end if;
   supplier_country:=upper(coalesce(sp.country_code,''));
   if supplier_country not in('ZA','CN') then raise exception 'Unsupported supplier payout country'; end if;
 else
   if lower(coalesce(prof.kyc_status,''))<>'approved' then raise exception 'KYC approval is required'; end if;
 end if;
 if role_name='supplier' then
   select pm.* into cfg from public.payout_methods pm where pm.pais=supplier_country;
 else
   if upper(coalesce(prof.pais,prof.country_code,'')) not in('ZA','MZ') then raise exception 'Unsupported payout country'; end if;
   select pm.* into cfg from public.payout_methods pm where pm.pais=upper(coalesce(prof.pais,prof.country_code));
 end if;
 if cfg.pais is null then raise exception 'Payout configuration not found'; end if;
 if not(cfg.metodos ? p_method) then raise exception 'Payout method is not allowed for this country'; end if;
 select coalesce(a.payout_methods,'{}'::jsonb) into settings from public.account_settings a where a.user_id=p_user_id;
 selected:=coalesce(settings->p_method,'{}'::jsonb);
 if coalesce((selected->>'enabled')::boolean,false) is not true then raise exception 'Selected payout method is not configured in Settings'; end if;
 if role_name='supplier' then
   select coalesce(sum(we.valor),0) into rows_available from public.wallet_entries we where we.vendedor_id=p_user_id and we.estado='disponivel' and we.tipo in('supplier_earning','estorno','garantia_liberada');
   select coalesce(sum(abs(we.valor)),0) into reserved from public.wallet_entries we join public.withdrawals w on w.id=we.withdrawal_id where we.vendedor_id=p_user_id and we.tipo='saque' and w.status in('solicitado','em_processamento');
   select coalesce(sum(abs(we.valor)),0) into withdrawn from public.wallet_entries we join public.withdrawals w on w.id=we.withdrawal_id where we.vendedor_id=p_user_id and we.tipo='saque' and w.status='pago';
   available:=greatest(rows_available-reserved-withdrawn,0);
 else
   select f.available_balance into available from private.seller_financials(p_user_id,null) f;
 end if;
 if coalesce(available,0)<p_amount then raise exception 'Insufficient available balance'; end if;
 if p_amount<cfg.valor_minimo_saque then raise exception 'Amount is below the minimum withdrawal'; end if;
 holder:=coalesce(selected->>'holder_name',selected->>'titular','');
 verified_holder:=case when role_name='supplier' then coalesce(sp.responsible_name,sp.legal_name,sp.company_name,'') else coalesce(prof.nome_completo,prof.full_name,'') end;
 if lower(trim(holder))<>lower(trim(verified_holder)) then raise exception 'Payout holder must match the KYC-approved profile name'; end if;
 if role_name='supplier' and supplier_country='ZA' and p_method<>'bank_transfer' then raise exception 'South African suppliers support bank transfer / EFT only for payouts'; end if;
 if role_name='supplier' and supplier_country='CN' then
   if p_method='bank_transfer' and (nullif(trim(coalesce(selected->>'bank','')),'') is null or nullif(trim(coalesce(selected->>'account_number','')),'') is null or nullif(trim(coalesce(selected->>'branch_name','')),'') is null) then raise exception 'Chinese bank transfer requires bank, account number and branch'; end if;
   if p_method in('alipay','wechat_pay') and nullif(trim(coalesce(selected->>'account_id','')),'') is null then raise exception 'Payment account ID is required'; end if;
   if p_method='unionpay' and nullif(trim(coalesce(selected->>'card_number','')),'') is null then raise exception 'UnionPay card number is required'; end if;
   if p_method='ecny' and nullif(trim(coalesce(selected->>'wallet_id','')),'') is null then raise exception 'e-CNY wallet ID is required'; end if;
 end if;
 select * into ps from public.platform_settings limit 1;
 return query select cfg.pais,cfg.valor_minimo_saque,cfg.prazo_min_dias,cfg.prazo_max_dias,coalesce(ps.withdrawal_fee_percent,cfg.taxa_percentual),coalesce(ps.withdrawal_fee_fixed,cfg.taxa_fixa),greatest(round(p_amount-(p_amount*coalesce(ps.withdrawal_fee_percent,cfg.taxa_percentual)/100)-coalesce(ps.withdrawal_fee_fixed,cfg.taxa_fixa),2),0);
end;
$$;

revoke all on function private.validate_withdrawal_payload(uuid,numeric,text,jsonb) from public;
grant execute on function private.validate_withdrawal_payload(uuid,numeric,text,jsonb) to authenticated,service_role;
