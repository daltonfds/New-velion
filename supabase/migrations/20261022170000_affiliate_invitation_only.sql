-- Affiliate access is invitation-only. Invites may be created by an existing affiliate,
-- seller, or administrator, and are single-use with a seven-day expiry.
create table if not exists public.platform_affiliate_invitations (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),
  inviter_user_id uuid not null references public.profiles(id) on delete cascade,
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index if not exists platform_affiliate_invitations_inviter_idx
  on public.platform_affiliate_invitations(inviter_user_id, created_at desc);

alter table public.platform_affiliate_invitations enable row level security;
revoke all on public.platform_affiliate_invitations from anon, authenticated;
grant all privileges on public.platform_affiliate_invitations to service_role;

create or replace function public.create_platform_affiliate_invitation()
returns table(invitation_token uuid, expires_at timestamptz)
language plpgsql security definer set search_path=''
as $function$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_token uuid;
  v_expires timestamptz;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  select p.role into v_role from public.profiles p where p.id=v_user;
  if coalesce(v_role,'') not in ('platform_affiliate','seller','admin') then
    raise exception 'INVITATION_NOT_ALLOWED';
  end if;
  insert into public.platform_affiliate_invitations(inviter_user_id)
  values(v_user) returning token, platform_affiliate_invitations.expires_at into v_token, v_expires;
  return query select v_token, v_expires;
end;
$function$;

revoke all on function public.create_platform_affiliate_invitation() from public, anon;
grant execute on function public.create_platform_affiliate_invitation() to authenticated;

create or replace function public.accept_platform_affiliate_invitation(p_token uuid)
returns void
language plpgsql security definer set search_path=''
as $function$
declare
  v_user uuid := auth.uid();
  v_invitation public.platform_affiliate_invitations%rowtype;
  v_role text;
begin
  if v_user is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  select p.role into v_role from public.profiles p where p.id=v_user;
  if v_role is null then raise exception 'PROFILE_REQUIRED'; end if;
  if coalesce(v_role,'') not in ('seller','customer') then raise exception 'ACCOUNT_ROLE_NOT_ELIGIBLE_FOR_AFFILIATE_INVITE'; end if;
  select * into v_invitation
  from public.platform_affiliate_invitations i
  where i.token=p_token
  for update;
  if not found then raise exception 'INVITATION_NOT_FOUND'; end if;
  if v_invitation.accepted_at is not null then raise exception 'INVITATION_ALREADY_USED'; end if;
  if v_invitation.expires_at <= now() then raise exception 'INVITATION_EXPIRED'; end if;
  if v_invitation.inviter_user_id=v_user then raise exception 'SELF_INVITATION_NOT_ALLOWED'; end if;

  update public.profiles
  set role='platform_affiliate',
      platform_referred_by=case
        when (select p.role from public.profiles p where p.id=v_invitation.inviter_user_id)='platform_affiliate'
          then v_invitation.inviter_user_id
        else platform_referred_by
      end,
      updated_at=now()
  where id=v_user;

  insert into public.platform_affiliates(user_id)
  values(v_user) on conflict(user_id) do nothing;

  update public.platform_affiliate_invitations
  set accepted_by=v_user, accepted_at=now()
  where id=v_invitation.id;
end;
$function$;

revoke all on function public.accept_platform_affiliate_invitation(uuid) from public, anon;
grant execute on function public.accept_platform_affiliate_invitation(uuid) to authenticated;

-- Close the old self-enrollment path. Only an already-provisioned affiliate may call it.
create or replace function public.join_platform_affiliate_program()
returns table(user_id uuid, referral_code text)
language plpgsql security definer set search_path=''
as $function$
declare
  v_user uuid := auth.uid();
  v_role text;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select p.role into v_role from public.profiles p where p.id=v_user;
  if coalesce(v_role,'') <> 'platform_affiliate' then
    raise exception 'AFFILIATE_INVITATION_REQUIRED';
  end if;
  insert into public.platform_affiliates as existing_affiliate(user_id)
  values(v_user)
  on conflict on constraint platform_affiliates_pkey do nothing;
  return query select pa.user_id, pa.referral_code
  from public.platform_affiliates pa where pa.user_id=v_user;
end;
$function$;
revoke all on function public.join_platform_affiliate_program() from public, anon;
grant execute on function public.join_platform_affiliate_program() to authenticated;
