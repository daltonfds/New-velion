-- Customer marketplace foundation
-- Applied to the live project before committing this migration.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role = any (array['customer'::text,'seller'::text,'supplier'::text,'admin'::text]));

alter table public.checkout_sessions add column if not exists customer_id uuid references public.profiles(id);
alter table public.sales add column if not exists customer_id uuid references public.profiles(id);

create index if not exists checkout_sessions_customer_id_idx on public.checkout_sessions(customer_id);
create index if not exists sales_customer_id_idx on public.sales(customer_id);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  province text not null,
  city text not null,
  postal_code text,
  address text not null,
  address_reference text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.customer_addresses enable row level security;

create table if not exists public.customer_cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check(quantity > 0 and quantity <= 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);
alter table public.customer_cart_items enable row level security;

create table if not exists public.customer_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);
alter table public.customer_favorites enable row level security;

drop policy if exists "customers manage own addresses" on public.customer_addresses;
create policy "customers manage own addresses" on public.customer_addresses for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "customers manage own cart" on public.customer_cart_items;
create policy "customers manage own cart" on public.customer_cart_items for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "customers manage own favorites" on public.customer_favorites;
create policy "customers manage own favorites" on public.customer_favorites for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- The live definition of create_customer_checkout_session and
-- process_checkout_webhook_payment is intentionally maintained in the
-- following committed SQL in this migration's full implementation history.
