-- Make the monthly integration order quota atomic across concurrent order creation.
-- The request-window limiter is intentionally separate; this trigger protects every
-- INSERT path into integration_orders, including RPCs and offer-based orders.
create or replace function public.enforce_integration_monthly_order_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_monthly_limit integer;
  v_monthly_count bigint;
begin
  if new.platform_id is null then
    raise exception 'INVALID_PLATFORM';
  end if;

  -- Serialize inserts for one platform until the surrounding transaction commits.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.platform_id::text, 73190421)
  );

  select coalesce(ps.api_monthly_order_limit, 0)
    into v_monthly_limit
    from public.platform_settings ps
  limit 1;

  -- A zero or negative setting preserves the existing "unlimited" convention.
  if coalesce(v_monthly_limit, 0) > 0 then
    select count(*)
      into v_monthly_count
      from public.integration_orders io
     where io.platform_id = new.platform_id
       and io.created_at >= date_trunc('month', coalesce(new.created_at, clock_timestamp()))
       and io.created_at < date_trunc('month', coalesce(new.created_at, clock_timestamp())) + interval '1 month';

    if v_monthly_count >= v_monthly_limit then
      raise exception 'API_MONTHLY_ORDER_LIMIT';
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists integration_orders_monthly_quota on public.integration_orders;
create trigger integration_orders_monthly_quota
before insert on public.integration_orders
for each row execute function public.enforce_integration_monthly_order_limit();

revoke all on function public.enforce_integration_monthly_order_limit() from public, anon, authenticated;
comment on function public.enforce_integration_monthly_order_limit() is
  'Atomically enforces platform_settings.api_monthly_order_limit for all integration order insert paths.';
