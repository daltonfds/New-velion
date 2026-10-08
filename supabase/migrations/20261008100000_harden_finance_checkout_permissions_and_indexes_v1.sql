-- Harden finance, public checkout permissions and remaining database indexes.
-- Keeps the production database aligned with this corrective migration.

drop trigger if exists sales_financials_before on public.sales;
drop trigger if exists sales_post_to_ledger on public.sales;

revoke execute on function public.create_public_checkout_session(
  text,text,text,text,text,text,text,text,text,text,text,integer
) from public, authenticated;
grant execute on function public.create_public_checkout_session(
  text,text,text,text,text,text,text,text,text,text,text,integer
) to anon;

create index if not exists customer_addresses_user_id_idx
  on public.customer_addresses(user_id);
create index if not exists customer_cart_items_product_id_idx
  on public.customer_cart_items(product_id);
create index if not exists customer_favorites_product_id_idx
  on public.customer_favorites(product_id);
create index if not exists integration_external_offers_external_seller_id_idx
  on public.integration_external_offers(external_seller_id);
create index if not exists integration_external_offers_mapping_id_idx
  on public.integration_external_offers(mapping_id);
create index if not exists sales_affiliation_id_idx
  on public.sales(affiliation_id);

drop index if exists public.product_reviews_reviewer_product_unique;
