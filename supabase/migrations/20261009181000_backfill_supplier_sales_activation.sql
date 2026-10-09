-- Backfill supplier/producer sales activation from existing confirmed paid sales.
update public.profiles p
set sales_activation_status='active',
    first_sale_at=coalesce(p.first_sale_at, first_sales.first_sale_at)
from (
  select pr.id as user_id, min(s.vendido_em) as first_sale_at
  from public.profiles pr
  join public.products prod on prod.created_by=pr.id
  join public.sales s on s.product_id=prod.id and lower(coalesce(s.status,''))='paga'
  where pr.role='supplier'
  group by pr.id
) first_sales
where first_sales.user_id=p.id and p.role='supplier';
