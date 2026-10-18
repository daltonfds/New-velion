-- Prevent overlapping webhook workers from delivering the same event concurrently.
alter table public.integration_webhook_events
  drop constraint if exists integration_webhook_events_status_check;
alter table public.integration_webhook_events
  add constraint integration_webhook_events_status_check
  check (status = any (array['pending'::text, 'processing'::text, 'delivered'::text, 'failed'::text]));

alter table public.integration_webhook_events
  add column if not exists locked_at timestamptz;

create or replace function public.claim_integration_webhook(p_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_now timestamptz := clock_timestamp();
begin
  update public.integration_webhook_events e
     set status = 'processing',
         locked_at = v_now
   where e.id = p_event_id
     and (
       (e.status = 'pending' and coalesce(e.next_attempt_at, '-infinity'::timestamptz) <= v_now)
       or (e.status = 'processing' and e.locked_at < v_now - interval '5 minutes')
     );
  return found;
end;
$function$;

revoke all on function public.claim_integration_webhook(uuid) from public, anon, authenticated;
grant execute on function public.claim_integration_webhook(uuid) to service_role;

comment on function public.claim_integration_webhook(uuid) is
  'Atomically claims a due webhook event for one worker; stale processing leases may be recovered after five minutes.';
