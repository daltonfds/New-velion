-- Backfill active affiliate offers with the pricing snapshots required by the fixed/custom engine.
update public.affiliations a
set sale_price=case when p.preco_promocional is not null and p.preco_promocional>0 then p.preco_promocional else p.preco end,
    pricing_mode='fixed',
    base_price_zar=s.base_price_zar,
    seller_margin_zar=greatest(round((case when p.preco_promocional is not null and p.preco_promocional>0 then p.preco_promocional else p.preco end)-s.base_price_zar,2),0),
    commission_snapshot_zar=s.commission_zar
from public.products p
cross join lateral private.product_pricing_snapshot(p.id) s
where a.product_id=p.id
  and a.ativo=true
  and (a.commission_snapshot_zar is null or a.base_price_zar is null)
  and p.pricing_mode='fixed';