-- Deferred bridge keeps the existing Integration API transaction compatible.
create or replace function public.ensure_integration_fulfillment_from_item()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  perform public.create_integration_fulfillment(new.order_id);
  return new;
end;
$$;

drop trigger if exists integration_order_items_create_fulfillment on public.integration_order_items;
create constraint trigger integration_order_items_create_fulfillment
after insert on public.integration_order_items
deferrable initially deferred
for each row
execute function public.ensure_integration_fulfillment_from_item();

create or replace function public.sync_fulfillment_from_integration_order()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.fulfillment_order_id is not null then
    perform public.set_fulfillment_status(
      new.fulfillment_order_id,
      new.status,
      new.tracking_number,
      new.carrier,
      new.tracking_url,
      'Synchronized from Integration API order.',
      null
    );
  end if;
  return new;
end;
$$;

drop trigger if exists integration_orders_sync_fulfillment on public.integration_orders;
create trigger integration_orders_sync_fulfillment
after update of status,tracking_number,carrier,tracking_url on public.integration_orders
for each row
when (
  new.fulfillment_order_id is not null
  and (
    old.status is distinct from new.status
    or old.tracking_number is distinct from new.tracking_number
    or old.carrier is distinct from new.carrier
    or old.tracking_url is distinct from new.tracking_url
  )
)
execute function public.sync_fulfillment_from_integration_order();

revoke execute on function public.ensure_integration_fulfillment_from_item() from public,anon,authenticated;
grant execute on function public.ensure_integration_fulfillment_from_item() to service_role;
revoke execute on function public.sync_fulfillment_from_integration_order() from public,anon,authenticated;
grant execute on function public.sync_fulfillment_from_integration_order() to service_role;
