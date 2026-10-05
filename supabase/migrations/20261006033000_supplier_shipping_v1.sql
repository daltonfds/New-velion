alter table public.products add column if not exists peso_kg numeric not null default 0 check(peso_kg>=0);
create table if not exists public.supplier_shipping_profiles(
 user_id uuid primary key references public.profiles(id) on delete cascade,
 enabled boolean not null default true,
 processing_days integer not null default 1 check(processing_days>=0),
 free_shipping_threshold numeric,
 default_rate numeric not null default 0 check(default_rate>=0),
 currency text not null default 'ZAR' check(currency in('ZAR','MZN')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.supplier_shipping_zones(
 id uuid primary key default extensions.gen_random_uuid(),
 supplier_id uuid not null references public.profiles(id) on delete cascade,
 name text not null,
 country_codes text[] not null default '{}',
 metro boolean,
 base_rate numeric not null default 0 check(base_rate>=0),
 per_kg_rate numeric not null default 0 check(per_kg_rate>=0),
 estimated_days integer not null default 3 check(estimated_days>=0),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists supplier_shipping_zones_supplier_idx on public.supplier_shipping_zones(supplier_id,active);
alter table public.supplier_shipping_profiles enable row level security;
alter table public.supplier_shipping_zones enable row level security;
drop policy if exists supplier_shipping_profiles_own on public.supplier_shipping_profiles;
create policy supplier_shipping_profiles_own on public.supplier_shipping_profiles for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists supplier_shipping_zones_own on public.supplier_shipping_zones;
create policy supplier_shipping_zones_own on public.supplier_shipping_zones for all to authenticated using(auth.uid()=supplier_id) with check(auth.uid()=supplier_id);