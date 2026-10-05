-- Fulfillment RPC permissions.
revoke execute on function public.create_sale_fulfillment(uuid) from public,anon,authenticated;
grant execute on function public.create_sale_fulfillment(uuid) to service_role;
revoke execute on function public.approve_checkout_session(uuid) from public,anon;
grant execute on function public.approve_checkout_session(uuid) to authenticated;
