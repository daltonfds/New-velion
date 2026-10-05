-- Integration fulfillment status synchronization and indexes.

create or replace function public.sync_fulfillment_from_integration_order()
returns trigger language plpgsql security definer set search_path=''
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

revoke execute on function public.sync_fulfillment_from_integration_order() from public,anon,authenticated;
grant execute on function public.sync_fulfillment_from_integration_order() to service_role;

create index if not exists fulfillment_events_created_by_idx on public.fulfillment_events(created_by);
create index if not exists fulfillment_order_items_product_idx on public.fulfillment_order_items(product_id);
create index if not exists integration_orders_fulfillment_order_idx on public.integration_orders(fulfillment_order_id);
create index if not exists integration_order_items_mapping_idx on public.integration_order_items(mapping_id);
create index if not exists integration_order_items_product_idx on public.integration_order_items(newvelion_product_id);
create index if not exists integration_orders_external_seller_idx on public.integration_orders(external_seller_id);
create index if not exists integration_product_mappings_external_seller_idx on public.integration_product_mappings(external_seller_id);
create index if not exists integration_product_mappings_product_idx on public.integration_product_mappings(newvelion_product_id);
