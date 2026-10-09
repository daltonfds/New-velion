-- Repair table privileges/policies for the admin settings, customer reviews and notification center.
-- Keep all privileged settings and moderation writes restricted to administrators.

grant select, insert, update, delete on table public.platform_settings to authenticated, service_role;
drop policy if exists platform_settings_admin_read on public.platform_settings;
drop policy if exists platform_settings_admin_insert on public.platform_settings;
drop policy if exists platform_settings_admin_update on public.platform_settings;
create policy platform_settings_admin_read on public.platform_settings
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy platform_settings_admin_insert on public.platform_settings
  for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy platform_settings_admin_update on public.platform_settings
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

grant select, insert, update, delete on table public.product_reviews to authenticated, service_role;
drop policy if exists product_reviews_customer_read_own on public.product_reviews;
drop policy if exists product_reviews_admin_read on public.product_reviews;
drop policy if exists product_reviews_admin_update on public.product_reviews;
create policy product_reviews_customer_read_own on public.product_reviews
  for select to authenticated
  using (reviewer_id = auth.uid());
create policy product_reviews_admin_read on public.product_reviews
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy product_reviews_admin_update on public.product_reviews
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

grant select, update on table public.notifications to authenticated;
grant all privileges on table public.notifications to service_role;
alter table public.notifications enable row level security;
drop policy if exists notifications_select_own on public.notifications;
drop policy if exists notifications_update_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy notifications_update_own on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Realtime is optional because the client also polls; add notifications when the publication exists.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'notifications'
     ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- Older withdrawal detail RPC incorrectly read email from profiles (email lives in auth.users).
do $$
declare
  definition text;
begin
  select pg_get_functiondef('public.admin_get_withdrawal_detail(uuid)'::regprocedure)
    into definition;
  if position('p.email' in definition) > 0 then
    definition := replace(
      definition,
      'p.email',
      '(select u.email from auth.users u where u.id = p.id)'
    );
    execute definition;
  end if;
end $$;
