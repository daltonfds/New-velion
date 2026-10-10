-- Rejected affiliate payouts return to the affiliate reward balance via the payout summary.
-- Do not create a seller/supplier wallet refund entry for affiliate-only withdrawals.
CREATE OR REPLACE FUNCTION private.withdrawal_ledger_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if coalesce(new.withdrawal_source,'sales') <> 'affiliate' and old.status not in('rejeitado','cancelado') and new.status in('rejeitado','cancelado') then
   insert into public.wallet_entries(vendedor_id,tipo,valor,estado)
   values(new.vendedor_id,'estorno',new.valor_solicitado,'disponivel');
 end if;
 return new;
end; $function$
;
revoke all on function private.withdrawal_ledger_transition() from public,anon,authenticated;
grant execute on function private.withdrawal_ledger_transition() to service_role;
