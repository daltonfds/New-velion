alter table public.wallet_entries add column if not exists integration_order_id uuid references public.integration_orders(id) on delete set null;
create unique index if not exists wallet_entries_integration_supplier_unique on public.wallet_entries(integration_order_id,vendedor_id,tipo) where integration_order_id is not null and tipo='supplier_earning';

create or replace function private.post_integration_order_to_ledger(p_order_id uuid)
returns void language plpgsql security definer set search_path=''
as $function$
declare r record;
begin
 for r in select io.id integration_order_id,oi.newvelion_product_id,oi.quantity,oi.newvelion_cost_price,p.created_by from public.integration_orders io join public.integration_order_items oi on oi.order_id=io.id join public.products p on p.id=oi.newvelion_product_id join public.profiles pr on pr.id=p.created_by and pr.role='supplier' where io.id=p_order_id loop
  if r.created_by is not null and r.newvelion_cost_price>0 then
   insert into public.wallet_entries(vendedor_id,integration_order_id,tipo,valor,estado) values(r.created_by,r.integration_order_id,'supplier_earning',round(r.newvelion_cost_price*r.quantity,2),'retido')
   on conflict (integration_order_id,vendedor_id,tipo) do update set valor=excluded.valor;
  end if;
 end loop;
end;
$function$;

create or replace function private.integration_order_ledger_trigger()
returns trigger language plpgsql security definer set search_path=''
as $function$ begin perform private.post_integration_order_to_ledger(new.order_id); return new; end; $function$;
drop trigger if exists integration_order_ledger_after on public.integration_orders;
drop trigger if exists integration_item_ledger_after on public.integration_order_items;
create trigger integration_item_ledger_after after insert on public.integration_order_items for each row execute function private.integration_order_ledger_trigger();

create or replace function private.release_due_guarantees()
returns integer language plpgsql security definer set search_path=''
as $function$
declare released integer:=0; r record; h integer;
begin
 select hold_days into h from public.platform_settings where id=true;
 for r in select s.id,s.vendedor_id,s.valor_garantia from public.sales s where s.status='paga' and s.garantia_libera_em<=now() and not exists(select 1 from public.wallet_entries w where w.sale_id=s.id and w.tipo='garantia_liberada') loop
  if r.valor_garantia>0 then insert into public.wallet_entries(vendedor_id,sale_id,tipo,valor,estado) values(r.vendedor_id,r.id,'garantia_liberada',r.valor_garantia,'disponivel'),(r.vendedor_id,r.id,'garantia_retida',-r.valor_garantia,'retido'); end if;
  update public.wallet_entries set estado='disponivel' where sale_id=r.id and tipo='supplier_earning' and estado='retido';
  released:=released+1;
 end loop;
 for r in select w.id from public.wallet_entries w join public.fulfillment_orders fo on fo.integration_order_id=w.integration_order_id where w.tipo='supplier_earning' and w.estado='retido' and fo.status='delivered' and fo.fulfilled_at<=now()-make_interval(days=>coalesce(h,7)) loop
  update public.wallet_entries set estado='disponivel' where id=r.id; released:=released+1;
 end loop;
 return released;
end;
$function$;