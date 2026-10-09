-- NewVelion platform affiliate program and sales-based account activation.
-- This migration is intentionally separate from normal app deploys and must be applied to Supabase.

alter table public.profiles
  add column if not exists platform_referred_by uuid references public.profiles(id) on delete set null,
  add column if not exists sales_activation_status text not null default 'inactive',
  add column if not exists first_sale_at timestamptz;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role = any (array['customer'::text,'seller'::text,'supplier'::text,'platform_affiliate'::text,'admin'::text]));

create table if not exists public.platform_affiliates (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  referral_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  created_at timestamptz not null default now()
);

create table if not exists public.platform_affiliate_rewards (
  id uuid primary key default gen_random_uuid(),
  affiliate_user_id uuid not null references public.platform_affiliates(user_id) on delete cascade,
  referred_user_id uuid references public.profiles(id) on delete set null,
  sale_id uuid references public.sales(id) on delete set null,
  reward_type text not null check (reward_type in ('referral_bonus','mystery_prize')),
  amount numeric(12,2) not null default 0 check (amount >= 0),
  milestone_count integer,
  status text not null default 'pending' check (status in ('pending','earned','paid','unlocked','cancelled')),
  description text not null,
  created_at timestamptz not null default now(),
  unique (referred_user_id, reward_type),
  unique (affiliate_user_id, milestone_count, reward_type)
);

create index if not exists profiles_platform_referred_by_idx on public.profiles(platform_referred_by);
create index if not exists profiles_sales_activation_status_idx on public.profiles(sales_activation_status);
create index if not exists platform_affiliate_rewards_affiliate_idx on public.platform_affiliate_rewards(affiliate_user_id, created_at desc);

alter table public.platform_affiliates enable row level security;
alter table public.platform_affiliate_rewards enable row level security;

drop policy if exists platform_affiliates_select_own on public.platform_affiliates;
create policy platform_affiliates_select_own on public.platform_affiliates
  for select to authenticated using (user_id = auth.uid());

drop policy if exists platform_affiliate_rewards_select_own on public.platform_affiliate_rewards;
create policy platform_affiliate_rewards_select_own on public.platform_affiliate_rewards
  for select to authenticated using (affiliate_user_id = auth.uid());

grant select on public.platform_affiliates, public.platform_affiliate_rewards to authenticated;
grant all privileges on public.platform_affiliates, public.platform_affiliate_rewards to service_role;

-- Extend the existing auth bootstrap without changing its supplier provisioning behavior.
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare
  v_role text;
  v_referrer uuid;
  v_referral_code text;
begin
  v_role := case
    when coalesce(new.raw_user_meta_data->>'role','') in ('supplier','customer','seller','platform_affiliate')
      then new.raw_user_meta_data->>'role'
    else 'seller'
  end;

  insert into public.profiles(
    id,full_name,nome_completo,country,country_code,country_calling_code,
    phone_number,phone_e164,whatsapp_number,whatsapp_e164,preferred_language,
    role,status,pais,telefone
  )
  values(
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.raw_user_meta_data->>'country_name',''),
    coalesce(new.raw_user_meta_data->>'country_code',''),
    coalesce(new.raw_user_meta_data->>'country_calling_code',''),
    coalesce(new.raw_user_meta_data->>'phone_number',''),
    coalesce(new.raw_user_meta_data->>'phone_e164',''),
    coalesce(new.raw_user_meta_data->>'whatsapp_number',''),
    coalesce(new.raw_user_meta_data->>'whatsapp_e164',''),
    case when coalesce(new.raw_user_meta_data->>'preferred_language','en')='pt' then 'pt' else 'en' end,
    v_role,'active',
    case when upper(coalesce(new.raw_user_meta_data->>'country_code','')) in ('ZA','MZ') then upper(new.raw_user_meta_data->>'country_code') else null end,
    coalesce(new.raw_user_meta_data->>'phone_e164',new.raw_user_meta_data->>'phone_number','')
  )
  on conflict(id) do update set
    full_name=excluded.full_name,
    nome_completo=excluded.nome_completo,
    country=excluded.country,
    country_code=excluded.country_code,
    country_calling_code=excluded.country_calling_code,
    phone_number=excluded.phone_number,
    phone_e164=excluded.phone_e164,
    whatsapp_number=excluded.whatsapp_number,
    whatsapp_e164=excluded.whatsapp_e164,
    preferred_language=excluded.preferred_language,
    role=case when public.profiles.role='admin' then 'admin' else excluded.role end,
    pais=excluded.pais,
    telefone=excluded.telefone,
    updated_at=now();

  v_referral_code := upper(trim(coalesce(new.raw_user_meta_data->>'platform_referral_code','')));
  if v_referral_code <> '' then
    select pa.user_id into v_referrer
    from public.platform_affiliates pa
    where upper(pa.referral_code)=v_referral_code
    limit 1;

    if v_referrer is not null and v_referrer <> new.id then
      update public.profiles set platform_referred_by=v_referrer where id=new.id and platform_referred_by is null;
    end if;
  end if;

  if v_role='platform_affiliate' then
    insert into public.platform_affiliates(user_id) values(new.id) on conflict(user_id) do nothing;
  end if;

  if v_role='supplier' then
    insert into public.supplier_profiles(
      user_id,company_name,responsible_name,country_code,country_name,calling_code,
      business_phone,whatsapp,business_email,product_categories,description,approval_status
    )
    values(
      new.id,
      coalesce(new.raw_user_meta_data->>'supplier_company_name',new.raw_user_meta_data->>'company_name',''),
      coalesce(new.raw_user_meta_data->>'responsible_name',new.raw_user_meta_data->>'full_name',''),
      nullif(new.raw_user_meta_data->>'country_code',''),
      nullif(new.raw_user_meta_data->>'country_name',''),
      nullif(new.raw_user_meta_data->>'country_calling_code',''),
      nullif(coalesce(new.raw_user_meta_data->>'phone_e164',new.raw_user_meta_data->>'phone_number',''),''),
      nullif(coalesce(new.raw_user_meta_data->>'whatsapp_e164',new.raw_user_meta_data->>'whatsapp_number',''),''),
      nullif(new.email,''),
      '{}'::text[],
      nullif(new.raw_user_meta_data->>'description',''),
      'pending'
    )
    on conflict(user_id) do nothing;
  end if;

  return new;
end;
$function$;

create or replace function public.process_platform_affiliate_sale_activation()
returns trigger
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_supplier_id uuid;
  v_referred_user uuid;
  v_affiliate_id uuid;
  v_active_count integer;
  v_threshold integer;
  v_inserted integer;
begin
  if lower(coalesce(new.status,'')) <> 'paga'
     or (tg_op='UPDATE' and lower(coalesce(old.status,''))='paga') then
    return new;
  end if;

  -- A seller becomes sales-active only after the first paid sale.
  if new.vendedor_id is not null then
    update public.profiles
      set sales_activation_status='active', first_sale_at=coalesce(first_sale_at,new.vendido_em,now())
      where id=new.vendedor_id and role='seller' and sales_activation_status <> 'active'
      returning id into v_referred_user;

    if v_referred_user is not null then
      insert into public.notifications(user_id,type,title,message,data,event_key)
      values(v_referred_user,'account_activated','Congratulations — your account is active',
        'Your first sale has been confirmed. Your Newvelion seller account is now active.',
        jsonb_build_object('sale_id',new.id,'activation_status','active'),
        'account_activated:'||new.id::text||':'||v_referred_user::text);
    end if;
  end if;

  -- A supplier becomes sales-active when one of their products records a paid sale.
  select p.created_by into v_supplier_id
  from public.products p where p.id=new.product_id limit 1;

  if v_supplier_id is not null then
    update public.profiles
      set sales_activation_status='active', first_sale_at=coalesce(first_sale_at,new.vendido_em,now())
      where id=v_supplier_id and role='supplier' and sales_activation_status <> 'active'
      returning id into v_referred_user;

    if v_referred_user is not null then
      insert into public.notifications(user_id,type,title,message,data,event_key)
      values(v_referred_user,'account_activated','Congratulations — your account is active',
        'Your product has made its first confirmed sale. Your Newvelion supplier account is now active.',
        jsonb_build_object('sale_id',new.id,'activation_status','active'),
        'account_activated:'||new.id::text||':'||v_referred_user::text);
    end if;
  end if;

  -- A referrer earns R50 once per referred business account after its first paid sale.
  foreach v_referred_user in array array_remove(array[new.vendedor_id,v_supplier_id],null::uuid) loop
    select p.platform_referred_by into v_affiliate_id
    from public.profiles p
    where p.id=v_referred_user and p.role in ('seller','supplier');

    if v_affiliate_id is not null then
      insert into public.platform_affiliate_rewards(
        affiliate_user_id,referred_user_id,sale_id,reward_type,amount,status,description
      )
      values(v_affiliate_id,v_referred_user,new.id,'referral_bonus',50,'earned',
        'R50 referral reward — first confirmed sale')
      on conflict (referred_user_id,reward_type) do nothing;
    end if;
  end loop;

  -- Mystery prize milestones count referred sellers/suppliers with at least one paid sale.
  for v_affiliate_id in
    select distinct p.platform_referred_by
    from public.profiles p
    where p.platform_referred_by is not null
      and p.sales_activation_status='active'
      and p.role in ('seller','supplier')
  loop
    select count(*)::integer into v_active_count
    from public.profiles p
    where p.platform_referred_by=v_affiliate_id
      and p.sales_activation_status='active'
      and p.role in ('seller','supplier');

    foreach v_threshold in array array[5,10,25] loop
      if v_active_count >= v_threshold then
        insert into public.platform_affiliate_rewards(
          affiliate_user_id,reward_type,amount,milestone_count,status,description
        )
        values(v_affiliate_id,'mystery_prize',0,v_threshold,'unlocked',
          'Mystery prize unlocked for reaching '||v_threshold||' active referrals')
        on conflict (affiliate_user_id,milestone_count,reward_type) do nothing;
        get diagnostics v_inserted = row_count;

        if v_inserted > 0 then
          insert into public.notifications(user_id,type,title,message,data,event_key)
          values(v_affiliate_id,'mystery_prize_unlocked','Mystery prize unlocked!',
            'You reached '||v_threshold||' active referrals. Contact Newvelion support to reveal your mystery prize.',
            jsonb_build_object('milestone_count',v_threshold),
            'mystery_prize_unlocked:'||v_affiliate_id::text||':'||v_threshold::text);
        end if;
      end if;
    end loop;
  end loop;

  return new;
end;
$function$;

drop trigger if exists sales_platform_affiliate_activation on public.sales;
create trigger sales_platform_affiliate_activation
after insert or update of status on public.sales
for each row execute function public.process_platform_affiliate_sale_activation();

-- Existing users are intentionally not marked active just because they registered.
update public.profiles p
set sales_activation_status='active',
    first_sale_at=coalesce(p.first_sale_at,first_sales.first_sale_at)
from (
  select vendedor_id as user_id,min(vendido_em) as first_sale_at
  from public.sales
  where lower(coalesce(status,''))='paga'
  group by vendedor_id
) first_sales
where first_sales.user_id=p.id
  and p.role='seller';


create or replace function public.get_platform_affiliate_dashboard()
returns table(
  referral_code text,
  referrals_total bigint,
  active_referrals bigint,
  rewards_earned numeric,
  rewards_pending numeric,
  mystery_prizes_unlocked integer,
  next_milestone integer
)
language plpgsql
stable
security definer
set search_path=''
as $function$
declare
  v_user uuid := auth.uid();
  v_active integer := 0;
begin
  if v_user is null or not exists(select 1 from public.platform_affiliates pa where pa.user_id=v_user) then
    raise exception 'PLATFORM_AFFILIATE_ACCESS_REQUIRED';
  end if;

  select count(*)::integer into v_active
  from public.profiles p
  where p.platform_referred_by=v_user
    and p.role in ('seller','supplier')
    and p.sales_activation_status='active';

  return query
  select
    pa.referral_code,
    (select count(*) from public.profiles p where p.platform_referred_by=v_user and p.role in ('seller','supplier')),
    v_active::bigint,
    coalesce((select sum(r.amount) from public.platform_affiliate_rewards r where r.affiliate_user_id=v_user and r.reward_type='referral_bonus' and r.status in ('earned','paid')),0),
    coalesce((select sum(r.amount) from public.platform_affiliate_rewards r where r.affiliate_user_id=v_user and r.reward_type='referral_bonus' and r.status='pending'),0),
    (select count(*)::integer from public.platform_affiliate_rewards r where r.affiliate_user_id=v_user and r.reward_type='mystery_prize' and r.status='unlocked'),
    case when v_active < 5 then 5 when v_active < 10 then 10 when v_active < 25 then 25 else null end
  from public.platform_affiliates pa where pa.user_id=v_user;
end;
$function$;

grant execute on function public.get_platform_affiliate_dashboard() to authenticated;
