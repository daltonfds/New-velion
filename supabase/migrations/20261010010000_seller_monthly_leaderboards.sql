create or replace function public.get_seller_monthly_leaderboards()
returns table (
  ranking_type text,
  rank_position bigint,
  seller_id uuid,
  seller_name text,
  country_code text,
  sales_count bigint,
  monthly_sales numeric,
  monthly_commission numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  return query
  with profile_base as (
    select
      p.id,
      coalesce(nullif(trim(p.full_name), ''), nullif(trim(p.nome_completo), ''), 'Seller') as display_name,
      case
        when upper(coalesce(nullif(trim(p.country_code), ''), nullif(trim(p.country), ''), nullif(trim(p.pais), ''), '')) in ('MZ','MOZAMBIQUE') then 'MZ'
        when upper(coalesce(nullif(trim(p.country_code), ''), nullif(trim(p.country), ''), nullif(trim(p.pais), ''), '')) in ('ZA','SOUTH AFRICA','SOUTH AFRICA (ZA)') then 'ZA'
        when upper(coalesce(nullif(trim(p.country_code), ''), nullif(trim(p.country), ''), nullif(trim(p.pais), ''), '')) in ('BR','BRAZIL','BRASIL') then 'BR'
        else nullif(upper(coalesce(nullif(trim(p.country_code), ''), nullif(trim(p.country), ''), nullif(trim(p.pais), ''), '')), '—')
      end as normalized_country
    from public.profiles p
    where lower(coalesce(p.role, '')) in ('seller','affiliate')
  ),
  monthly as (
    select
      pb.id,
      pb.display_name,
      pb.normalized_country,
      count(s.id)::bigint as total_sales,
      coalesce(sum(s.valor_venda), 0)::numeric as total_revenue,
      coalesce(sum(s.comissao_vendedor), 0)::numeric as total_commission
    from profile_base pb
    join public.sales s on s.vendedor_id = pb.id
    where lower(trim(coalesce(s.status, ''))) in ('paga','paid')
      and s.vendido_em >= date_trunc('month', current_date::timestamp)
      and s.vendido_em < date_trunc('month', current_date::timestamp) + interval '1 month'
    group by pb.id, pb.display_name, pb.normalized_country
  ),
  platform_ranked as (
    select row_number() over (order by m.total_sales desc, m.total_commission desc, m.total_revenue desc, m.display_name asc) as pos, m.*
    from monthly m
  ),
  country_ranked as (
    select row_number() over (partition by m.normalized_country order by m.total_sales desc, m.total_commission desc, m.total_revenue desc, m.display_name asc) as pos, m.*
    from monthly m
    where m.normalized_country is not null and length(m.normalized_country) = 2
  )
  select 'platform'::text, r.pos, r.id, r.display_name, r.normalized_country, r.total_sales, r.total_revenue, r.total_commission
  from platform_ranked r
  where r.pos <= 10
  union all
  select 'country'::text, r.pos, r.id, r.display_name, r.normalized_country, r.total_sales, r.total_revenue, r.total_commission
  from country_ranked r
  where r.pos <= 10
  order by 1, 2;
end;
$function$;

revoke all on function public.get_seller_monthly_leaderboards() from public, anon;
grant execute on function public.get_seller_monthly_leaderboards() to authenticated;
