-- NewVelion checkout payment reconciliation.
-- Admin records the external payment reference/amount; matching is exact in ZAR.
create or replace function public.register_checkout_payment(
 p_session_id uuid,
 p_external_payment_reference text,
 p_external_payment_amount numeric,
 p_external_payment_paid_at timestamptz default now()
)
returns table(session_id uuid,status text,payment_comparison_status text)
language plpgsql
security definer
set search_path=''
as $function$
declare
 s public.checkout_sessions%rowtype;
 v_amount numeric;
begin
 if not (select private.is_admin_user()) then raise exception 'Forbidden'; end if;

 select * into s
 from public.checkout_sessions
 where id=p_session_id
 for update;

 if not found then raise exception 'Checkout session not found'; end if;
 if s.status='approved' then raise exception 'Checkout session is already approved'; end if;

 if nullif(trim(coalesce(p_external_payment_reference,'')),'') is null
    or p_external_payment_amount is null
    or p_external_payment_amount<0
 then raise exception 'Invalid payment data'; end if;

 v_amount:=round(p_external_payment_amount,2);

 update public.checkout_sessions
 set external_payment_reference=trim(p_external_payment_reference),
     external_payment_amount=v_amount,
     external_payment_paid_at=coalesce(p_external_payment_paid_at,now()),
     payment_comparison_status=case
       when round(amount,2)=v_amount and upper(coalesce(currency,'ZAR'))='ZAR'
       then 'matched' else 'mismatch' end,
     status=case
       when round(amount,2)=v_amount and upper(coalesce(currency,'ZAR'))='ZAR'
       then 'paid_pending_review' else 'pending' end,
     updated_at=now()
 where id=s.id
 returning id,status,payment_comparison_status
 into session_id,status,payment_comparison_status;

 return next;
end;
$function$;

revoke execute on function public.register_checkout_payment(uuid,text,numeric,timestamptz) from public,anon;
grant execute on function public.register_checkout_payment(uuid,text,numeric,timestamptz) to authenticated;
