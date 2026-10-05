-- Integration order v2 permissions
revoke execute on function public.create_integration_order_v2(uuid,text,uuid,text,jsonb,jsonb,jsonb,numeric,jsonb,text) from public,anon,authenticated;
grant execute on function public.create_integration_order_v2(uuid,text,uuid,text,jsonb,jsonb,jsonb,numeric,jsonb,text) to service_role;
