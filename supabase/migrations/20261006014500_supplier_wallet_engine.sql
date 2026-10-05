alter table public.wallet_entries drop constraint if exists wallet_entries_tipo_check;
alter table public.wallet_entries add constraint wallet_entries_tipo_check
check (tipo = any (array['comissao','garantia_retida','garantia_liberada','estorno','saque','supplier_earning']));
create unique index if not exists wallet_entries_supplier_earning_unique
on public.wallet_entries (sale_id, vendedor_id, tipo)
where tipo='supplier_earning';

create or replace function private.post_sale_to_ledger()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare v_product public.products%rowtype; v_supplier_id uuid; v_supplier_amount numeric;
begin
  insert into public.wallet_entries(vendedor_id,sale_id,tipo,valor,estado)
  values
    (new.vendedor_id,new.id,'comissao',new.comissao_vendedor-new.valor_garantia,'disponivel'),
    (new.vendedor_id,new.id,'garantia_retida',new.valor_garantia,'retido');
  select p.* into v_product from public.products p where p.id=new.product_id;
  if found then
    select pr.id into v_supplier_id from public.profiles pr where pr.id=v_product.created_by and pr.role='supplier';
    v_supplier_amount:=greatest(coalesce(v_product.preco_custo,0),0);
    if v_supplier_id is not null and v_supplier_amount>0 then
      insert into public.wallet_entries(vendedor_id,sale_id,tipo,valor,estado)
      values(v_supplier_id,new.id,'supplier_earning',v_supplier_amount,'retido')
      on conflict (sale_id,vendedor_id,tipo) do nothing;
    end if;
  end if;
  return new;
end;
$function$;

create or replace function private.seller_financials(p_seller uuid default null,p_days integer default null)
returns table(vendedor_id uuid,sales_count bigint,refunded_count bigint,cancelled_count bigint,gross_sales numeric,commission_earned numeric,commission_available numeric,guarantee_retained numeric,reserved numeric,withdrawn numeric,available_balance numeric,total_balance numeric)
language sql stable security definer set search_path=''
as $function$
with scope as (
 select p_seller as vendedor_id where p_seller is not null
 union select s.vendedor_id from public.sales s where p_seller is null
 union select w.vendedor_id from public.wallet_entries w where p_seller is null
), sa as (
 select s.vendedor_id,count(*) filter(where lower(s.status)='paga') sales_count,
 count(*) filter(where lower(s.status)='reembolsada') refunded_count,
 count(*) filter(where lower(s.status)='cancelada') cancelled_count,
 coalesce(sum(s.valor_venda) filter(where lower(s.status)='paga'),0) gross_sales,
 coalesce(sum(s.comissao_vendedor) filter(where lower(s.status)='paga'),0) commission_earned
 from public.sales s where (p_seller is null or s.vendedor_id=p_seller)
 and (p_days is null or s.vendido_em>=now()-make_interval(days=>p_days)) group by s.vendedor_id
), le as (
 select we.vendedor_id,
 coalesce(sum(we.valor) filter(where we.estado='disponivel' and we.tipo in('comissao','garantia_liberada','estorno','supplier_earning')),0) commission_available,
 coalesce(sum(we.valor) filter(where we.estado='retido' and we.tipo in('garantia_retida','supplier_earning')),0) retained,
 coalesce(sum(abs(we.valor)) filter(where we.tipo='saque' and wd.status in('solicitado','em_processamento')),0) reserved,
 coalesce(sum(abs(we.valor)) filter(where we.tipo='saque' and wd.status='pago'),0) withdrawn
 from public.wallet_entries we left join public.withdrawals wd on wd.id=we.withdrawal_id
 where (p_seller is null or we.vendedor_id=p_seller) group by we.vendedor_id
)
select sc.vendedor_id,coalesce(sa.sales_count,0),coalesce(sa.refunded_count,0),coalesce(sa.cancelled_count,0),
coalesce(sa.gross_sales,0),coalesce(sa.commission_earned,0),coalesce(le.commission_available,0),
greatest(coalesce(le.retained,0),0),coalesce(le.reserved,0),coalesce(le.withdrawn,0),
greatest(coalesce(le.commission_available,0)-coalesce(le.reserved,0)-coalesce(le.withdrawn,0),0),
greatest(coalesce(le.commission_available,0)-coalesce(le.reserved,0)-coalesce(le.withdrawn,0),0)+greatest(coalesce(le.retained,0),0)
from scope sc left join sa on sa.vendedor_id=sc.vendedor_id left join le on le.vendedor_id=sc.vendedor_id;
$function$;

create or replace function private.release_due_guarantees()
returns integer language plpgsql security definer set search_path=''
as $function$
declare released integer:=0; r record;
begin
 for r in select s.id,s.vendedor_id,s.valor_garantia from public.sales s
 where s.status='paga' and s.garantia_libera_em<=now()
 and not exists(select 1 from public.wallet_entries w where w.sale_id=s.id and w.tipo='garantia_liberada')
 loop
  if r.valor_garantia>0 then
   insert into public.wallet_entries(vendedor_id,sale_id,tipo,valor,estado) values
   (r.vendedor_id,r.id,'garantia_liberada',r.valor_garantia,'disponivel'),
   (r.vendedor_id,r.id,'garantia_retida',-r.valor_garantia,'retido');
  end if;
  update public.wallet_entries set estado='disponivel'
  where sale_id=r.id and tipo='supplier_earning' and estado='retido';
  released:=released+1;
 end loop;
 return released;
end;
$function$;