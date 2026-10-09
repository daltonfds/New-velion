-- Prevent users from assigning themselves a referrer or changing their sales activation state.
create or replace function private.protect_platform_affiliate_fields()
returns trigger
language plpgsql
security definer
set search_path=''
as $function$
begin
  if coalesce(current_setting('request.jwt.claim.role', true),'') = 'authenticated'
     and auth.uid() = old.id
     and (
       new.platform_referred_by is distinct from old.platform_referred_by
       or new.sales_activation_status is distinct from old.sales_activation_status
       or new.first_sale_at is distinct from old.first_sale_at
     ) then
    raise exception 'Referral attribution and sales activation are managed by Newvelion';
  end if;
  return new;
end;
$function$;

drop trigger if exists protect_platform_affiliate_fields on public.profiles;
create trigger protect_platform_affiliate_fields
before update on public.profiles
for each row execute function private.protect_platform_affiliate_fields();

revoke all on function public.get_platform_affiliate_dashboard() from public, anon;
grant execute on function public.get_platform_affiliate_dashboard() to authenticated;
