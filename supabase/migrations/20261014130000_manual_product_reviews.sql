-- Manual seller/admin testimonials for product catalog management.
alter table public.product_reviews
  add column if not exists created_by_admin boolean not null default false,
  add column if not exists created_manually boolean not null default false,
  add column if not exists review_date timestamptz;

update public.product_reviews
set review_date = created_at
where review_date is null;

alter table public.product_reviews
  alter column review_date set default now();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-media',
  'review-media',
  true,
  4194304,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update
set public = true,
    file_size_limit = 4194304,
    allowed_mime_types = excluded.allowed_mime_types;

create index if not exists product_reviews_product_review_date_idx
  on public.product_reviews(product_id, review_date desc);
