-- Newvelion Club: quarterly memberships and administrator-managed payment links.
create table if not exists public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  plan_code text not null check (plan_code in ('club_399','club_499','club_599')),
  amount_zar numeric(10,2) not null check (amount_zar in (399,499,599)),
  status text not null default 'pending_payment' check (status in ('pending_payment','pending_review','active','rejected','expired','cancelled')),
  payment_url text,
  payment_reference text,
  customer_note text,
  approved_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists club_memberships_customer_created_idx on public.club_memberships(customer_id, created_at desc);
create index if not exists club_memberships_status_created_idx on public.club_memberships(status, created_at desc);
alter table public.club_memberships enable row level security;
revoke all on public.club_memberships from anon, authenticated;
grant select, insert, update on public.club_memberships to authenticated;
drop policy if exists "Customers read own club memberships" on public.club_memberships;
create policy "Customers read own club memberships" on public.club_memberships for select to authenticated using ((select auth.uid()) = customer_id);
drop policy if exists "Customers create own club membership requests" on public.club_memberships;
create policy "Customers create own club membership requests" on public.club_memberships for insert to authenticated with check ((select auth.uid()) = customer_id and status = 'pending_payment' and approved_by is null and starts_at is null and expires_at is null);
drop policy if exists "Customers update own unpaid membership request" on public.club_memberships;
create policy "Customers update own unpaid membership request" on public.club_memberships for update to authenticated using ((select auth.uid()) = customer_id and status in ('pending_payment','pending_review')) with check ((select auth.uid()) = customer_id and status in ('pending_payment','pending_review') and approved_by is null and starts_at is null and expires_at is null);

create table if not exists public.club_membership_plans (
  plan_code text primary key check (plan_code in ('club_399','club_499','club_599')),
  name text not null,
  amount_zar numeric(10,2) not null check (amount_zar in (399,499,599)),
  payment_url text,
  benefits jsonb not null default '["Member-only product discounts","Free delivery on eligible orders","Exclusive promotions and offers"]'::jsonb,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.club_membership_plans(plan_code,name,amount_zar) values
('club_399','Essential',399),('club_499','Plus',499),('club_599','Premium',599)
on conflict (plan_code) do nothing;
alter table public.club_membership_plans enable row level security;
revoke all on public.club_membership_plans from anon, authenticated;
