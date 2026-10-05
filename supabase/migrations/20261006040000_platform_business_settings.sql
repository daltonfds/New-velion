create table if not exists public.platform_settings(
 id boolean primary key default true check(id),
 transaction_fee_percent numeric not null default 10 check(transaction_fee_percent>=0),
 supplier_transaction_fee_percent numeric not null default 0 check(supplier_transaction_fee_percent>=0),
 withdrawal_fee_percent numeric not null default 0 check(withdrawal_fee_percent>=0),
 withdrawal_fee_fixed numeric not null default 0 check(withdrawal_fee_fixed>=0),
 hold_days integer not null default 7 check(hold_days>=0),
 api_monthly_order_limit integer not null default 10000 check(api_monthly_order_limit>0),
 supplier_monthly_product_limit integer not null default 100 check(supplier_monthly_product_limit>0),
 updated_at timestamptz not null default now()
);
insert into public.platform_settings(id) values(true) on conflict(id) do nothing;
alter table public.platform_settings enable row level security;
drop policy if exists platform_settings_admin_read on public.platform_settings;
create policy platform_settings_admin_read on public.platform_settings for select to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));