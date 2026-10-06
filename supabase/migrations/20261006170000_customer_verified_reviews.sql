-- Customer reviews: only verified delivered buyers may submit reviews.
drop policy if exists "Customers can submit their own product reviews" on public.product_reviews;

create unique index if not exists product_reviews_reviewer_product_unique
  on public.product_reviews(reviewer_id, product_id)
  where reviewer_id is not null;

create policy "Customers can submit their own product reviews"
on public.product_reviews
for insert
to authenticated
with check (
  reviewer_id = (select auth.uid())
  and status = 'pending'
  and verified_buyer = true
  and exists (
    select 1
    from public.sales s
    join public.fulfillment_orders f on f.sale_id = s.id
    where s.gateway_ref = 'newvelion_checkout:' || product_reviews.purchase_session_id::text
      and s.customer_id = (select auth.uid())
      and s.product_id = product_reviews.product_id
      and f.status = 'delivered'
  )
  and (
    (is_anonymous = true and (reviewer_name is null or char_length(trim(reviewer_name)) <= 120))
    or
    (is_anonymous = false and reviewer_name is not null and char_length(trim(reviewer_name)) between 2 and 120)
  )
);
