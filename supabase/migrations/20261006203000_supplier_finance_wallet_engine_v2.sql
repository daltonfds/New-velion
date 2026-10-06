-- Supplier withdrawals use supplier wallet entries while sellers continue using seller financials.
create or replace function private.seller_financials(p_seller uuid default null,p_days integer default null)
returns table(vendedor_id uuid,sales_count bigint,refunded_count bigint,cancelled_count bigint,gross_sales numeric,commission_earned numeric,commission_available numeric,guarantee_retained numeric,reserved numeric,withdrawn numeric,available_balance numeric,total_balance numeric)
language sql stable security definer set search_path=''
as $function$
with scope as (
 select p_seller as vendedor_id where p_seller is not null
 union select s.vendedor_id from public.sales s where p_seller is null
 union select w.vendedor_id from public.wallet_entries w where p_seller is null
), sa as (
 select s.vendedor_id,count(*) filter(where lower(s.status)='paga') sales_count,count(*) filter(where lower(s.status)='reembolsada') refunded_count,count(*) filter(where lower(s.status)='cancelada') cancelled_count,
 coalesce(sum(s.valor_venda) filter(where lower(s.status)='paga'),0) gross_sales,coalesce(sum(s.comissao_vendedor) filter(where lower(s.status)='paga'),0) commission_earned
 from public.sales s where (p_seller is null or s.vendedor_id=p_seller) and (p_days is null or s.vendido_em>=now()-make_interval(days=>p_days)) group by s.vendedor_id
), le as (
 select we.vendedor_id,coalesce(sum(we.valor) filter(where we.estado='disponivel' and we.tipo in('comissao','garantia_liberada','estorno','supplier_earning')),0) commission_available,
 coalesce(sum(we.valor) filter(where we.estado='retido' and we.tipo in('garantia_retida','supplier_earning')),0) retained,
 coalesce(sum(abs(we.valor)) filter(where we.tipo='saque' and wd.status in('solicitado','em_processamento')),0) reserved,
 coalesce(sum(abs(we.valor)) filter(where we.tipo='saque' and wd.status='pago'),0) withdrawn
 from public.wallet_entries we left join public.withdrawals wd on wd.id=we.withdrawal_id
 where (p_seller is null or we.vendedor_id=p_seller) group by we.vendedor_id
)
select sc.vendedor_id,coalesce(sa.sales_count,0),coalesce(sa.refunded_count,0),coalesce(sa.cancelled_count,0),coalesce(sa.gross_sales,0),coalesce(sa.commission_earned,0),coalesce(le.commission_available,0),greatest(coalesce(le.retained,0),0),coalesce(le.reserved,0),coalesce(le.withdrawn,0),
greatest(coalesce(le.commission_available,0)-coalesce(le.reserved,0)-coalesce(le.withdrawn,0),0),
greatest(coalesce(le.commission_available,0)-coalesce(le.reserved,0)-coalesce(le.withdrawn,0),0)+greatest(coalesce(le.retained,0),0)
from scope sc left join sa on sa.vendedor_id=sc.vendedor_id left join le on le.vendedor_id=sc.vendedor_id;
$function$;
