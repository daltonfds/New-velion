-- Enforce both rolling-window and platform monthly request limits.
create or replace function public.consume_integration_rate_limit(p_platform_id uuid,p_limit integer default 120,p_window_seconds integer default 60)
returns boolean language plpgsql set search_path=''
as $function$
declare v_now timestamptz:=now(); v_bucket public.integration_rate_limit_buckets%rowtype; v_monthly_limit integer; v_monthly_count bigint;
begin
 if p_limit<=0 or p_window_seconds<=0 then return false; end if;
 select coalesce(api_monthly_request_limit,0) into v_monthly_limit from public.platform_settings limit 1;
 if coalesce(v_monthly_limit,0)>0 then
   select count(*) into v_monthly_count from public.integration_api_logs where platform_id=p_platform_id and created_at>=date_trunc('month',v_now);
   if v_monthly_count>=v_monthly_limit then return false; end if;
 end if;
 insert into public.integration_rate_limit_buckets(platform_id,window_started_at,request_count)
 values(p_platform_id,v_now,1) on conflict(platform_id) do nothing;
 select * into v_bucket from public.integration_rate_limit_buckets where platform_id=p_platform_id for update;
 if v_bucket.window_started_at<=v_now-make_interval(secs=>p_window_seconds) then
   update public.integration_rate_limit_buckets set window_started_at=v_now,request_count=1 where platform_id=p_platform_id; return true;
 end if;
 if v_bucket.request_count>=p_limit then return false; end if;
 update public.integration_rate_limit_buckets set request_count=request_count+1 where platform_id=p_platform_id;
 return true;
end;
$function$;
revoke execute on function public.consume_integration_rate_limit(uuid,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_integration_rate_limit(uuid,integer,integer) to service_role;