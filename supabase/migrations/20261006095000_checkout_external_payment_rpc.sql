-- Reproducible admin payment registration RPC used by the checkout-session dashboard.
create or replace function public.record_external_payment(
 p_session_id uuid,
 p_external_payment_reference text,
 p_external_payment_amount numeric,
 p_external_payment_currency text,
 p_external_payment_paid_at timestamptz default null,
 p_external_payment_method text default null,
 p_external_customer_name text default null,
 p_external_customer_phone text default null,
 p_external_customer_email text default null,
 p_external_payment_notes text default null
)
returns table(session_id uuid,comparison_status text)
language plpgsql
security definer
set search_path=''
as $function$
declare
 s public.checkout_sessions%rowtype;
 v_status text;
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

 v_status:=case
   when round(s.amount,2)=round(p_external_payment_amount,2)
    and upper(coalesce(p_external_payment_currency,'ZAR'))='ZAR'
   then 'matched'
   else 'mismatch'
 end;

 update public.checkout_sessions
 set external_payment_reference=trim(p_external_payment_reference),
     external_payment_amount=round(p_external_payment_amount,2),
     external_payment_currency=upper(coalesce(trim(p_external_payment_currency),'ZAR')),
     external_payment_paid_at=coalesce(p_external_payment_paid_at,now()),
     external_payment_method=nullif(trim(coalesce(p_external_payment_method,'')),''),
     external_customer_name=nullif(trim(coalesce(p_external_customer_name,'')),''),
     external_customer_phone=nullif(trim(coalesce(p_external_customer_phone,'')),''),
     external_customer_email=nullif(trim(coalesce(p_external_customer_email,'')),''),
     external_payment_notes=nullif(trim(coalesce(p_external_payment_notes,'')),''),
     payment_comparison_status=v_status,
     status=case when v_status='matched' then 'paid_pending_review' else 'pending' end,
     updated_at=now()
 where id=s.id;

 return query select p_session_id,v_status;
end;
$function$;

revoke execute on function public.record_external_payment(uuid,text,numeric,text,timestamptz,text,text,text,text,text) from public,anon;
grant execute on function public.record_external_payment(uuid,text,numeric,text,timestamptz,text,text,text,text,text) to authenticated;
