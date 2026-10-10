-- Allow an existing seller or supplier to join the platform affiliate programme
-- without changing their primary role or combining sales and affiliate balances.
create or replace function public.join_platform_affiliate_program()
returns table(user_id uuid, referral_code text)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_role text;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select p.role into v_role from public.profiles p where p.id = v_user;
  if v_role is null or v_role not in ('seller','supplier','customer','platform_affiliate') then
    raise exception 'AFFILIATE_ENROLLMENT_NOT_ALLOWED';
  end if;
  insert into public.platform_affiliates(user_id)
  values(v_user)
  on conflict(user_id) do nothing;
  return query select pa.user_id, pa.referral_code from public.platform_affiliates pa where pa.user_id=v_user;
end;
$function$;
revoke all on function public.join_platform_affiliate_program() from public, anon;
grant execute on function public.join_platform_affiliate_program() to authenticated;
