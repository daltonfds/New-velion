-- Create fulfillment after the integration order's item inserts are complete.
create or replace function public.ensure_integration_fulfillment_from_item()
returns trigger language plpgsql security definer set search_path=''
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

revoke execute on function public.ensure_integration_fulfillment_from_item() from public,anon,authenticated;
grant execute on function public.ensure_integration_fulfillment_from_item() to service_role;
