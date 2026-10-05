create table if not exists public.supplier_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  legal_name text,
  business_type text not null default 'supplier' check (business_type in ('supplier','producer','producer_supplier')),
  country_code text,
  country_name text,
  calling_code text,
  business_phone text,
  whatsapp text,
  business_email text,
  website text,
  registration_number text,
  tax_number text,
  product_categories text[] not null default '{}',
  description text,
  responsible_name text,
  responsible_title text,
  approval_status text not null default 'pending' check (approval_status in ('pending','under_review','approved','rejected','suspended')),
  rejection_reason text,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.supplier_profiles enable row level security;

drop policy if exists supplier_profiles_select_own on public.supplier_profiles;
create policy supplier_profiles_select_own on public.supplier_profiles
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists supplier_profiles_insert_own on public.supplier_profiles;
create policy supplier_profiles_insert_own on public.supplier_profiles
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists supplier_profiles_update_own on public.supplier_profiles;
create policy supplier_profiles_update_own on public.supplier_profiles
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter table public.products
  add column if not exists supplier_status text not null default 'approved'
    check (supplier_status in ('draft','pending_review','approved','rejected','archived','suspended')),
  add column if not exists supplier_reviewed_at timestamptz,
  add column if not exists supplier_reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists supplier_rejection_reason text,
  add column if not exists supplier_min_selling_price numeric,
  add column if not exists supplier_suggested_price numeric,
  add column if not exists supplier_commission_rate numeric,
  add column if not exists reserved_estoque integer not null default 0 check (reserved_estoque >= 0),
  add column if not exists low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0);

update public.products
set supplier_status = case when ativo then 'approved' else 'draft' end
where supplier_status = 'approved';

create index if not exists supplier_profiles_status_idx
  on public.supplier_profiles(approval_status, created_at desc);

create index if not exists products_supplier_status_idx
  on public.products(created_by, supplier_status, created_at desc);

create index if not exists products_supplier_marketplace_idx
  on public.products(ativo, supplier_status, created_at desc);

create or replace function public.touch_supplier_profile_updated_at()
returns trigger language plpgsql security invoker set search_path=''
as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists supplier_profiles_touch_updated_at on public.supplier_profiles;
create trigger supplier_profiles_touch_updated_at
before update on public.supplier_profiles
for each row execute function public.touch_supplier_profile_updated_at();
